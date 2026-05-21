const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON body parsing with increased limit for base64 images
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware to log API calls
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mapping of our categories to Open Trivia Database category IDs
const OTDB_CATEGORIES = {
  technical: 18, // Science: Computers
  science: 17,    // Science & Nature
  geography: 22   // Geography
};

// Simple HTML entity decoder function for clean text output
function decodeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&deg;/g, '°')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&hellip;/g, '...');
}

// Robust email format check regular expression
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// API Route: Get available categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// API Route: Get subtopics filtered by category
app.get('/api/subtopics', (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ error: 'Category is required.' });
    }
    const subtopics = db.getSubtopics(category);
    res.json(subtopics);
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    res.status(500).json({ error: 'Failed to retrieve subtopics' });
  }
});

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

app.get('/api/questions', async (req, res) => {
  const { category, difficulty, limit, subtopic, email } = req.query;
  const sessionLimit = parseInt(limit) || 5;
  
  // Retrieve user to check answered questions
  let user = null;
  if (email) {
    user = db.findUserByEmail(email);
    if (user && !user.answeredQuestions) {
      user.answeredQuestions = [];
    }
  }

  if (genAI && category) {
    try {
      console.log(`Generating ${sessionLimit} questions via Gemini AI for category=${category}, subtopic=${subtopic}, difficulty=${difficulty}`);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      let avoidPrompt = '';
      if (user && user.answeredQuestions && user.answeredQuestions.length > 0) {
        // Exclude recently answered questions to prevent Gemini from generating them again
        const recentlyAnswered = user.answeredQuestions.filter(x => typeof x === 'string').slice(-100);
        if (recentlyAnswered.length > 0) {
          avoidPrompt = `\nCRITICAL: Do NOT generate any of the following questions that the user has already answered recently:\n${JSON.stringify(recentlyAnswered)}`;
        }
      }

      const prompt = `Generate exactly ${sessionLimit} multiple-choice questions for the category '${category}' and subtopic '${subtopic || category}' with a difficulty level of '${difficulty || 'easy'}'.
      The questions must be highly technical, accurate, and challenging.${avoidPrompt}
      Return the response STRICTLY as a JSON array where each object matches this schema:
      {
        "id": "gen-timestamp-random",
        "category": "${category}",
        "subtopic": "${subtopic || category}",
        "difficulty": "${difficulty || 'easy'}",
        "question": "The actual question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The exact string from options that is correct"
      }`;

      const result = await model.generateContent(prompt);
      const aiQuestions = JSON.parse(result.response.text());
      
      console.log(`Successfully generated ${aiQuestions.length} questions from Gemini AI.`);
      return res.json(aiQuestions);
    } catch (aiError) {
      console.error('Error generating questions via Gemini AI, falling back to local DB:', aiError);
    }
  } else {
    if (!genAI) {
      console.warn("GEMINI_API_KEY is not set. Falling back to local database.");
    }
  }
  
  // Graceful fallback to local questions database
  console.log(`Serving fallback local questions for category=${category}, difficulty=${difficulty}, subtopic=${subtopic}`);
  try {
    let questions = db.getQuestions(category, difficulty, subtopic);
    
    // Filter out already answered questions if user email is provided
    if (user && user.answeredQuestions && user.answeredQuestions.length > 0) {
      let filtered = questions.filter(q => !user.answeredQuestions.includes(q.id) && !user.answeredQuestions.includes(q.question));
      if (filtered.length >= sessionLimit) {
        questions = filtered;
      } else {
        console.log(`Question pool exhausted for user=${email}. Recycling answered questions list for category=${category}.`);
        
        // Smart LRU recycling: take what is left unanswered
        const remainingUnanswered = [...filtered];
        
        // Find matching answered questions in this pool
        const matchingAnswered = questions.filter(q => user.answeredQuestions.includes(q.id) || user.answeredQuestions.includes(q.question));
        
        // Sort by their index in answeredQuestions (ascending, oldest first)
        matchingAnswered.sort((a, b) => {
          const idxA = Math.max(user.answeredQuestions.indexOf(a.id), user.answeredQuestions.indexOf(a.question));
          const idxB = Math.max(user.answeredQuestions.indexOf(b.id), user.answeredQuestions.indexOf(b.question));
          return idxA - idxB;
        });
        
        // Take the needed amount from the oldest/least-recently answered questions
        const neededCount = sessionLimit - remainingUnanswered.length;
        const recycledToUse = matchingAnswered.slice(0, neededCount);
        
        // Remove reused questions from the answered list to track them as fresh
        const recycledIdentifiers = new Set();
        recycledToUse.forEach(q => {
          recycledIdentifiers.add(q.id);
          recycledIdentifiers.add(q.question);
        });
        
        user.answeredQuestions = user.answeredQuestions.filter(idOrText => !recycledIdentifiers.has(idOrText));
        db.saveUserAnsweredQuestions(email, user.answeredQuestions);
        
        // Combine unanswered and least-recently-used ones
        questions = [...remainingUnanswered, ...recycledToUse];
      }
    }
    
    questions = questions.sort(() => 0.5 - Math.random());
    const limitedQuestions = questions.slice(0, sessionLimit);
    res.json(limitedQuestions);
  } catch (error) {
    console.error('Error fetching fallback questions:', error);
    res.status(500).json({ error: 'Failed to retrieve questions' });
  }
});
// API Route: Generate AI explanation for a question
app.post('/api/explain', async (req, res) => {
  const { question, options, correctAnswer, userAnswer } = req.body;
  
  if (!genAI) {
    return res.status(503).json({ error: 'AI integration is not configured. Missing API Key.' });
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Explain why the correct answer to the following technical question is "${correctAnswer}".
    Question: "${question}"
    Options: ${JSON.stringify(options)}
    ${userAnswer ? `The user incorrectly guessed "${userAnswer}". Briefly explain why their guess was wrong.` : ''}
    Keep the explanation extremely concise, educational, and under 3 sentences.`;

    const result = await model.generateContent(prompt);
    return res.json({ explanation: result.response.text() });
  } catch (error) {
    console.error('AI Explanation error:', error);
    return res.status(500).json({ error: 'Failed to generate explanation.' });
  }
});

// API Route: Get high scores leaderboard
app.get('/api/leaderboard', (req, res) => {
  try {
    const leaderboard = db.getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
});

// API Route: Post new high score to leaderboard
app.post('/api/leaderboard', (req, res) => {
  try {
    const { name, score, category, difficulty, timeSpent } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Player name is required.' });
    }
    
    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({ error: 'Valid score (0-100) is required.' });
    }

    const newScore = db.saveLeaderboardScore({
      name: name.trim().substring(0, 16),
      score,
      category,
      difficulty,
      timeSpent
    });
    
    res.status(201).json(newScore);
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Failed to save high score' });
  }
});

// API Route: User Registration
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required.' });
    }
    
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    
    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email address is already registered.' });
    }
    
    const newUser = db.registerNewUser({
      username,
      email,
      password
    });
    
    res.status(201).json({
      success: true,
      user: {
        username: newUser.username,
        email: newUser.email,
        streak: newUser.streak,
        lastLoginAt: newUser.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ error: 'Internal registration failure' });
  }
});

// API Route: User Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    
    const user = db.findUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    
    const updatedUser = db.updateStreak(email) || user;
    
    res.json({
      success: true,
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        streak: updatedUser.streak,
        lastLoginAt: updatedUser.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({ error: 'Internal login failure' });
  }
});

// API Route: User Session Sync (e.g. on Page Load)
app.post('/api/auth/sync', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required for session sync.' });
    }
    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Check and update their daily streak
    const updatedUser = db.updateStreak(email) || user;
    
    res.json({
      success: true,
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        streak: updatedUser.streak,
        lastLoginAt: updatedUser.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Error in user session sync:', error);
    res.status(500).json({ error: 'Internal sync failure' });
  }
});

// API Route: Get user achievements
app.get('/api/achievements', (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'User email is required.' });
    }
    const achievements = db.getUserAchievements(email);
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to retrieve achievements.' });
  }
});

// API Route: Unlock user achievement
app.post('/api/achievements/unlock', (req, res) => {
  try {
    const { email, achievementId } = req.body;
    if (!email || !achievementId) {
      return res.status(400).json({ error: 'Email and achievementId are required.' });
    }
    const result = db.saveUserAchievement(email, achievementId);
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }
    res.json(result);
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    res.status(500).json({ error: 'Failed to unlock achievement.' });
  }
});

// API Route: Get community consensus difficulty votes
app.get('/api/quiz/votes', (req, res) => {
  try {
    const { category, subtopic } = req.query;
    if (!category) {
      return res.status(400).json({ error: 'Category is required.' });
    }
    const votesSummary = db.getTopicVotes(category, subtopic || '');
    res.json(votesSummary);
  } catch (error) {
    console.error('Error fetching votes summary:', error);
    res.status(500).json({ error: 'Failed to retrieve votes summary.' });
  }
});

// API Route: Post difficulty vote
app.post('/api/quiz/vote', (req, res) => {
  try {
    const { category, subtopic, vote } = req.body;
    if (!category || !vote) {
      return res.status(400).json({ error: 'Category and vote value are required.' });
    }
    const validVotes = ['easy', 'medium', 'hard'];
    if (!validVotes.includes(vote.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid vote value. Must be easy, medium, or hard.' });
    }
    db.saveTopicVote(category, subtopic || '', vote);
    const votesSummary = db.getTopicVotes(category, subtopic || '');
    res.json(votesSummary);
  } catch (error) {
    console.error('Error saving vote:', error);
    res.status(500).json({ error: 'Failed to save difficulty vote.' });
  }
});

// API Route: Get recent games for a user
app.get('/api/recent-games', (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'User email is required.' });
    }
    const games = db.getRecentGames(email);
    res.json(games || []);
  } catch (error) {
    console.error('Error fetching recent games:', error);
    res.status(500).json({ error: 'Failed to retrieve recent games' });
  }
});

// API Route: Save a recent game record
app.post('/api/recent-games', (req, res) => {
  try {
    const { email, game } = req.body;
    if (!email || !game) {
      return res.status(400).json({ error: 'Email and game data are required.' });
    }
    const saved = db.saveRecentGame(email, game);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error saving recent game:', error);
    res.status(500).json({ error: 'Failed to save recent game' });
  }
});

// API Route: Get random AI-generated questions for Quick Play mode
app.get('/api/questions/random', async (req, res) => {
  const limit = 5;
  
  if (genAI) {
    try {
      console.log('Generating random mixed-topic questions via Gemini AI for Quick Play...');
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const prompt = `Generate exactly ${limit} multiple-choice quiz questions on RANDOM diverse topics. Mix topics like programming, science, geography, history, math, cybersecurity, AI, databases, networking, and general knowledge. Each question should be a different topic. Vary difficulty randomly between easy, medium, and hard.
      Return the response STRICTLY as a JSON array where each object matches this schema:
      {
        "id": "random-timestamp-index",
        "category": "the broad category (technical, science, geography, etc.)",
        "subtopic": "the specific subtopic",
        "difficulty": "easy|medium|hard",
        "question": "The actual question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The exact string from options that is correct"
      }`;

      const result = await model.generateContent(prompt);
      const aiQuestions = JSON.parse(result.response.text());
      
      console.log(`Successfully generated ${aiQuestions.length} random questions from Gemini AI.`);
      return res.json(aiQuestions);
    } catch (aiError) {
      console.error('Error generating random questions via Gemini AI, falling back to local DB:', aiError);
    }
  } else {
    console.warn('GEMINI_API_KEY is not set. Falling back to random local database questions.');
  }
  
  // Fallback: pick random questions from all categories
  try {
    let allQuestions = db.getQuestions();
    allQuestions = allQuestions.sort(() => 0.5 - Math.random());
    const randomQuestions = allQuestions.slice(0, limit);
    res.json(randomQuestions);
  } catch (error) {
    console.error('Error fetching random fallback questions:', error);
    res.status(500).json({ error: 'Failed to retrieve random questions' });
  }
});

// API Route: Get all questions in the database
app.get('/api/questions/all', (req, res) => {
  try {
    const all = db.getAllQuestions();
    res.json(all);
  } catch (error) {
    console.error('Error in fetching all questions:', error);
    res.status(500).json({ error: 'Failed to retrieve question bank.' });
  }
});

// API Route: Save answered questions (supports both IDs and Texts to filter out repetition)
app.post('/api/auth/save-answers', (req, res) => {
  try {
    const { email, questionIds, questionTexts } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (!user.answeredQuestions) {
      user.answeredQuestions = [];
    }
    if (questionIds && Array.isArray(questionIds)) {
      questionIds.forEach(id => {
        if (!user.answeredQuestions.includes(id)) {
          user.answeredQuestions.push(id);
        }
      });
    }
    if (questionTexts && Array.isArray(questionTexts)) {
      questionTexts.forEach(text => {
        if (!user.answeredQuestions.includes(text)) {
          user.answeredQuestions.push(text);
        }
      });
    }
    db.saveUserAnsweredQuestions(email, user.answeredQuestions);
    res.json({ success: true, count: user.answeredQuestions.length });
  } catch (error) {
    console.error('Error saving answers:', error);
    res.status(500).json({ error: 'Failed to save answered questions.' });
  }
});

// API Route: Save unlocked achievements
app.post('/api/auth/save-achievements', (req, res) => {
  try {
    const { email, achievements } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    db.saveUserAchievements(email, achievements || []);
    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Error saving achievements:', error);
    res.status(500).json({ error: 'Failed to save achievements.' });
  }
});

// API Route: Update User Profile (Username, Email, Password, Avatar)
app.post('/api/auth/update-profile', (req, res) => {
  try {
    const { email, username, newEmail, password, avatarEmoji, avatarImage } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Current email is required.' });
    }
    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Validate email uniqueness if changing email
    if (newEmail && newEmail.toLowerCase().trim() !== email.toLowerCase().trim()) {
      const existing = db.findUserByEmail(newEmail);
      if (existing) {
        return res.status(400).json({ error: 'The new email is already in use by another user.' });
      }
      if (!emailRegex.test(newEmail)) {
        return res.status(400).json({ error: 'Please enter a valid new email address.' });
      }
    }

    if (username && username.trim() === '') {
      return res.status(400).json({ error: 'Username cannot be empty.' });
    }

    if (password && password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const updatedUser = db.updateUserProfile(email, {
      username,
      newEmail,
      password,
      avatarEmoji,
      avatarImage
    });

    res.json({
      success: true,
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        streak: updatedUser.streak,
        lastLoginAt: updatedUser.lastLoginAt,
        achievements: updatedUser.achievements || [],
        avatarEmoji: updatedUser.avatarEmoji || '⚡',
        avatarImage: updatedUser.avatarImage || null
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Fallback for SPA Routing: serve index.html for any other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 Wrenchy Quiz Server running on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`===============================================`);
});
