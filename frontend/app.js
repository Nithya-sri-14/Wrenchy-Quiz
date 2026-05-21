/* ==========================================================================
   1. RETRO SYNTHESIZER (WEB AUDIO API ENGINE)
   ========================================================================== */
class RetroSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  // Lazy-load AudioContext to comply with browser autoplay policies
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle(forceState) {
    this.enabled = forceState !== undefined ? forceState : !this.enabled;
    return this.enabled;
  }

  // Synthesize a crisp, rising major arpeggio for correct answers (C5 -> E5 -> G5) with hot streak multiplier
  playCorrect(streak = 0) {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    
    // Scale pitch based on streak (+15% frequency shift per successive correct answer)
    let pitchMultiplier = 1.0;
    if (streak > 1) {
      pitchMultiplier = 1.0 + (streak - 1) * 0.15;
    }
    
    const baseNotes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const notes = baseNotes.map(freq => freq * pitchMultiplier);
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle'; // triangle wave gives a soft retro chip sound
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.25);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  // Synthesize a low, vibrato buzz for wrong answers (G2 -> F2)
  playWrong() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth'; // sawtooth gives a raspy buzzing retro texture
    osc.frequency.setValueAtTime(196.00, now); // G2
    osc.frequency.linearRampToValueAtTime(174.61, now + 0.35); // F2
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    
    // Add rapid vibrato frequency modulation
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    mod.frequency.value = 16; // 16Hz rapid flutter
    modGain.gain.value = 15;
    
    mod.connect(modGain);
    modGain.connect(osc.frequency);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    mod.start(now);
    osc.start(now);
    
    mod.stop(now + 0.35);
    osc.stop(now + 0.35);
  }

  // Synthesize a short, crisp tick/click sound for the timer warning countdown
  playTick() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Synthesize a triumphant multi-chord fanfare for completing the quiz
  playVictory() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const chords = [
      [261.63, 329.63, 392.00], // C4, E4, G4
      [349.23, 440.00, 523.25], // F4, A4, C5
      [392.00, 493.88, 587.33], // G4, B4, D5
      [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6 (Mega Chord!)
    ];
    
    chords.forEach((frequencies, chordIdx) => {
      const chordTime = now + chordIdx * 0.18;
      const duration = chordIdx === 3 ? 0.8 : 0.25;
      
      frequencies.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, chordTime);
        
        gain.gain.setValueAtTime(0.12, chordTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(chordTime);
      });
    });
  }



  // Synthesize a beautiful, frosty crystal shimmer when Time Freeze starts
  playFreezeSuccess() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const notes = [880.00, 1046.50, 1318.51, 1567.98]; // A5, C6, E6, G6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      
      gain.gain.setValueAtTime(0.08, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.3);
    });
  }

  // Synthesize a crisp high ice ping for frozen countdown ticks
  playFreezeTick() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, now); // high crystal ping
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playStreak() {
    this.playCorrect(2);
  }
}

// Instantiate Sound Engine
const synth = new RetroSynth();

/* ==========================================================================
   2. QUIZ APPLICATION CORE STATE MANAGER
   ========================================================================== */
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '/api'
  : 'https://wrenchy-quiz.onrender.com/api';

const state = {
  categories: [],
  selectedCategory: null,
  selectedSubtopic: null,
  selectedDifficulty: 'easy',
  selectedQuestionCount: 5,
  quizMode: 'classic', // 'classic', 'timeattack', 'zen'
  /** After a quiz ends, shown once on the leaderboard page */
  leaderboardScoreBanner: null,
  quizFinishing: false,
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  answers: [], // history records: { questionId, text, chosenOption, correctOption, isCorrect, timeSpent }
  startTime: 0,
  endTime: 0,
  questionStartTime: 0,
  timeLeft: 20,
  timerInterval: null,
  
  // Premium pack additions
  currentStreak: 0,
  lifelinesSpent: { '5050': false, 'freeze': false },
  isFrozen: false,
  freezeTimeLeft: 0,
  freezeInterval: null,

  // Global Time Attack Clock
  globalTimeLeft: 60,
  globalTimerInterval: null,

  // Authentic User Info
  currentUser: null,
  authMode: 'login', // 'login' or 'register'

  // Coding Arena State Variables
  activeArena: 'quiz', // 'quiz' or 'coding'
  challenges: [],
  activeChallenge: null,
  submissions: [],
  contests: [],
  contestCountdownInterval: null
};

/* ==========================================================================
   3. DOM ELEMENT REFERENCES
   ========================================================================== */
const DOM = {
  // Pages (new sidebar layout)
  appLayout: document.getElementById('app-layout'),
  startScreen: document.getElementById('page-quiz-setup'),
  quizScreen: document.getElementById('page-quiz-active'),
  resultScreen: document.getElementById('page-results'),
  playgroundScreen: null, // removed

  // All pages for routing
  pages: {
    dashboard: document.getElementById('page-dashboard'),
    quickplay: document.getElementById('page-quickplay'),
    'quiz-setup': document.getElementById('page-quiz-setup'),
    'versus-matching': document.getElementById('page-versus-matching'),
    'quiz-active': document.getElementById('page-quiz-active'),
    results: document.getElementById('page-results'),
    leaderboard: document.getElementById('page-leaderboard'),
    profile: document.getElementById('page-profile'),
    settings: document.getElementById('page-settings'),
  },
  
  // Sidebar
  sidebar: document.getElementById('sidebar'),
  navLinks: document.getElementById('nav-links'),
  sidebarAvatar: document.getElementById('sidebar-avatar'),
  sidebarUsername: document.getElementById('sidebar-username'),
  sidebarEmail: document.getElementById('sidebar-email'),
  
  // Mobile
  mobileTopbar: document.getElementById('mobile-topbar'),
  mobileMenuBtn: document.getElementById('mobile-menu-btn'),
  
  // Quiz Setup Elements
  categorySelectGrid: document.getElementById('category-select-grid'),
  subtopicGroup: document.getElementById('subtopic-group'),
  subtopicSelectGrid: document.getElementById('subtopic-select-grid'),
  startQuizBtn: document.getElementById('start-quiz-btn'),
  openRulesBtn: document.getElementById('open-rules-btn'),
  openLeaderboardBtn: null, // now a page
  
  // Quiz play elements
  quizCatBadge: document.getElementById('quiz-cat-badge'),
  quizDiffBadge: document.getElementById('quiz-diff-badge'),
  timerCountdown: document.getElementById('timer-countdown'),
  timerArc: document.getElementById('timer-progress-arc'),
  timerContainer: document.querySelector('.timer-container'),
  currentQuestionNum: document.getElementById('current-question-num'),
  totalQuestionsNum: document.getElementById('total-questions-num'),
  quizProgressFill: document.getElementById('quiz-progress-fill'),
  questionText: document.getElementById('question-text'),
  optionsGrid: document.getElementById('options-grid'),
  skipBtn: document.getElementById('skip-btn'),
  nextBtn: document.getElementById('next-btn'),
  
  // Results Screen Elements
  resultTitle: document.getElementById('result-title'),
  resultScorePercent: document.getElementById('result-score-percent'),
  resultScoreFraction: document.getElementById('result-score-fraction'),
  statTimeSpent: document.getElementById('stat-time-spent'),
  statXP: document.getElementById('stat-xp'),
  statAvgSpeed: document.getElementById('stat-avg-speed'),
  leaderboardSubmitBox: document.getElementById('leaderboard-submit-box'),
  scoreSavedNotification: document.getElementById('score-saved-notification'),
  scoreSavedStatusText: document.getElementById('score-saved-status-text'),
  toggleReviewBtn: document.getElementById('toggle-review-btn'),
  reviewContentWrapper: document.getElementById('review-content-wrapper'),
  reviewSection: document.querySelector('.review-section'),
  reviewList: document.getElementById('review-list'),
  restartQuizBtn: document.getElementById('restart-quiz-btn'),
  goHomeBtn: document.getElementById('go-home-btn'),
  
  // Auth Screen Elements
  authScreen: document.getElementById('auth-screen'),
  authTitle: document.getElementById('auth-title'),
  authForm: document.getElementById('auth-form'),
  authUsernameGroup: document.getElementById('auth-username-group'),
  authUsernameInput: document.getElementById('auth-username'),
  authEmailInput: document.getElementById('auth-email'),
  authPasswordInput: document.getElementById('auth-password'),
  authErrorMsg: document.getElementById('auth-error-msg'),
  authSubmitBtn: document.getElementById('auth-submit-btn'),
  authToggleText: document.getElementById('auth-toggle-text'),
  authToggleBtn: document.getElementById('auth-toggle-btn'),
  userGreeting: document.getElementById('dashboard-username'),
  btnSignout: document.getElementById('btn-signout'),
  
  // Audio Controls
  soundToggleBtn: document.getElementById('sound-toggle-btn'),
  soundIcon: document.getElementById('sound-icon'),
  soundTooltip: document.querySelector('.sound-tooltip'),
  
  // Dialog Modals
  rulesDialog: document.getElementById('rules-dialog'),
  leaderboardDialog: null, // now a full page
  leaderboardTableBody: document.getElementById('leaderboard-table-body'),

  // Dashboard elements
  dashQuizzesPlayed: document.getElementById('dash-quizzes-played'),
  dashHighScore: document.getElementById('dash-high-score'),
  dashTotalXP: document.getElementById('dash-total-xp'),
  dashAccuracy: document.getElementById('dash-accuracy'),
  heroStreakNum: document.getElementById('hero-streak-num'),
  activityList: document.getElementById('activity-list'),

  // Quick Play
  startQuickplayBtn: document.getElementById('start-quickplay-btn'),
  quickplayLoading: document.getElementById('quickplay-loading'),
};

/* ==========================================================================
   4. NAVIGATION & VIEW CONTROLLERS
   ========================================================================== */
/* ==========================================================================
   3.5. USER AUTHENTICATION CONTROLLERS
   ========================================================================== */
function toggleAuthMode() {
  state.authMode = state.authMode === 'login' ? 'register' : 'login';
  DOM.authErrorMsg.textContent = '';
  
  if (state.authMode === 'login') {
    DOM.authTitle.textContent = 'Sign In to Wrenchy Quiz';
    DOM.authUsernameGroup.style.display = 'none';
    DOM.authUsernameInput.removeAttribute('required');
    DOM.authSubmitBtn.textContent = 'Sign In';
    DOM.authToggleText.textContent = "Don't have an account?";
    DOM.authToggleBtn.textContent = 'Sign Up';
  } else {
    DOM.authTitle.textContent = 'Create Wrenchy Quiz Account';
    DOM.authUsernameGroup.style.display = 'block';
    DOM.authUsernameInput.setAttribute('required', 'required');
    DOM.authSubmitBtn.textContent = 'Register & Play';
    DOM.authToggleText.textContent = 'Already have an account?';
    DOM.authToggleBtn.textContent = 'Sign In';
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  DOM.authErrorMsg.textContent = '';
  
  const email = DOM.authEmailInput.value.trim();
  const password = DOM.authPasswordInput.value;
  const username = DOM.authUsernameInput.value.trim();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    DOM.authErrorMsg.textContent = 'Please enter a valid email address.';
    return;
  }
  
  if (!password) {
    DOM.authErrorMsg.textContent = 'Please enter your password.';
    return;
  }
  
  if (password.length < 6) {
    DOM.authErrorMsg.textContent = 'Password must be at least 6 characters.';
    return;
  }
  
  if (state.authMode === 'register' && !username) {
    DOM.authErrorMsg.textContent = 'Username is required for registration.';
    return;
  }
  
  DOM.authSubmitBtn.disabled = true;
  DOM.authSubmitBtn.textContent = state.authMode === 'login' ? 'Signing In...' : 'Registering...';
  
  try {
    const url = state.authMode === 'login' ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    const payload = state.authMode === 'login' ? { email, password } : { username, email, password };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Authentication failed');
    }
    
    // Auth Successful!
    state.currentUser = data.user;
    localStorage.setItem('questify_user', JSON.stringify(data.user));
    
    // Greet and setup session
    initSessionForUser();
    
  } catch (error) {
    console.error('Auth error:', error);
    DOM.authErrorMsg.textContent = error.message;
    DOM.authSubmitBtn.disabled = false;
    DOM.authSubmitBtn.textContent = state.authMode === 'login' ? 'Sign In' : 'Register & Play';
  }
}

function initSessionForUser() {
  if (!state.currentUser) return;

  // Sync user's database streak to localStorage
  if (state.currentUser.streak !== undefined) {
    localStorage.setItem('questify_day_streak', String(state.currentUser.streak));
    if (state.currentUser.lastLoginAt) {
      localStorage.setItem('questify_streak_last_login_at', state.currentUser.lastLoginAt);
    }
  } else {
    // Guest fallback
    updateDayStreakOnLogin();
  }
  
  // Update sidebar user info
  if (DOM.userGreeting) DOM.userGreeting.textContent = state.currentUser.username;
  if (DOM.sidebarUsername) DOM.sidebarUsername.textContent = state.currentUser.username;
  if (DOM.sidebarEmail) DOM.sidebarEmail.textContent = state.currentUser.email || '';

  // Update profile page
  const profileUsername = document.getElementById('profile-username');
  const profileEmail = document.getElementById('profile-email');
  if (profileUsername) profileUsername.textContent = state.currentUser.username;
  if (profileEmail) profileEmail.textContent = state.currentUser.email || '';

  // Premium dynamic user avatar update & handlers setup
  updateUserAvatarUI();
  setupSettingsAvatarHandlers();
  
  // Clear Auth Forms
  DOM.authEmailInput.value = '';
  DOM.authPasswordInput.value = '';
  DOM.authUsernameInput.value = '';
  DOM.authSubmitBtn.disabled = false;
  DOM.authSubmitBtn.textContent = 'Sign In';
  
  // Show app layout, hide auth
  DOM.authScreen.classList.add('hide');
  DOM.appLayout.classList.remove('hide');
  
  // Render User Statistics
  renderLocalStatistics();
  renderDashboard();
  
  // Navigate to Dashboard
  showPage('dashboard');
  
  // Play positive chime
  synth.playStreak();
}

function handleSignOut() {
  localStorage.removeItem('questify_user');
  state.currentUser = null;
  state.leaderboardScoreBanner = null;
  
  // Show auth, hide app
  DOM.authScreen.classList.remove('hide');
  DOM.appLayout.classList.add('hide');
  
  // Reset to login mode
  state.authMode = 'register';
  toggleAuthMode();
}

// ---- PAGE ROUTING SYSTEM ----
function showPage(pageName) {
  // Hide all pages
  Object.values(DOM.pages).forEach(page => {
    if (page) {
      page.classList.remove('active');
      page.style.display = 'none';
    }
  });
  
  // Show target page
  const target = DOM.pages[pageName];
  if (target) {
    target.style.display = 'flex';
    void target.offsetWidth;
    target.classList.add('active');
  }
  
  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });
  
  // Close mobile sidebar
  if (DOM.sidebar) DOM.sidebar.classList.remove('open');
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) overlay.classList.remove('active');
  
  // Page-specific rendering
  if (pageName === 'dashboard') renderDashboard();
  if (pageName === 'leaderboard') renderLeaderboardPage();
  if (pageName === 'profile') renderProfilePage();
  if (pageName === 'settings') renderSettingsPage();
  
  state.currentPage = pageName;
}

function changeScreen(targetScreen) {
  // Map old screen references to new page system
  if (targetScreen === DOM.startScreen) { showPage('quiz-setup'); return; }
  if (targetScreen === DOM.quizScreen) { showPage('quiz-active'); return; }
  if (targetScreen === DOM.resultScreen) { showPage('results'); return; }
  
  // Fallback for direct page elements
  Object.values(DOM.pages).forEach(page => {
    if (page) {
      page.classList.remove('active');
      page.style.display = 'none';
    }
  });
  if (targetScreen) {
    targetScreen.style.display = 'flex';
    void targetScreen.offsetWidth;
    targetScreen.classList.add('active');
  }
}

/* ==========================================================================
   5. TIMER CONTROLS & DYNAMIC SVG DRAWING
   ========================================================================== */
function startTimer() {
  state.questionStartTime = Date.now();
  
  // Reset any active freeze states
  if (state.isFrozen) {
    clearInterval(state.freezeInterval);
    state.isFrozen = false;
    DOM.timerContainer.classList.remove('frozen');
  }
  
  if (state.quizMode === 'zen') {
    DOM.timerCountdown.textContent = '∞';
    DOM.timerArc.style.strokeDashoffset = '0';
    return;
  }
  
  if (state.quizMode === 'timeattack') {
    // Time Attack global clock handles UI directly
    return;
  }
  
  state.timeLeft = 20;
  runActiveTimer();
}

function runActiveTimer() {
  if (state.quizMode === 'zen' || state.quizMode === 'timeattack') return;
  
  clearInterval(state.timerInterval);
  
  // Reset SVG Arc Stroke
  const arcPercent = (state.timeLeft / 20) * 100;
  DOM.timerArc.style.strokeDashoffset = (100 - arcPercent).toFixed(1);
  DOM.timerCountdown.textContent = state.timeLeft;
  
  if (state.timeLeft <= 5) {
    DOM.timerContainer.classList.add('warning-critical');
  } else {
    DOM.timerContainer.classList.remove('warning-critical');
  }
  
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    
    // Update Timer Text
    DOM.timerCountdown.textContent = state.timeLeft;
    
    // Draw SVG Circle Countdown Progress (perimeter ~ 100)
    const arcPercent = (state.timeLeft / 20) * 100;
    DOM.timerArc.style.strokeDashoffset = (100 - arcPercent).toFixed(1);
    
    // Warning thresholds: 5 seconds remaining
    if (state.timeLeft <= 5) {
      DOM.timerContainer.classList.add('warning-critical');
      synth.playTick(); // synthesize ticking warnings
    }
    
    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      handleQuestionTimeout();
    }
  }, 1000);
}

function stopTimer() {
  if (state.quizMode !== 'timeattack' && state.quizMode !== 'zen') {
    clearInterval(state.timerInterval);
  }
  if (state.isFrozen) {
    clearInterval(state.freezeInterval);
    state.isFrozen = false;
    DOM.timerContainer.classList.remove('frozen');
  }
}

/* ==========================================================================
   6. API REQUEST INTEGRATIONS
   ========================================================================== */
async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('API server returned status: ' + res.status);
    
    state.categories = await res.json();
    renderCategories(state.categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    DOM.categorySelectGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--danger); font-size: 14px;">
        Failed to load categories from backend.<br>
        Please check if the Express server is running.
      </div>
    `;
  }
}

async function startQuizSession() {
  if (!state.selectedCategory) return;
  
  DOM.startQuizBtn.disabled = true;
  DOM.startQuizBtn.classList.add('btn-loading');
  
  const aiOverlay = document.getElementById('ai-loading-overlay');
  if (aiOverlay) aiOverlay.classList.remove('hide');
  
  // Reset confetti and active timer clocks
  confetti.stop();
  clearInterval(state.timerInterval);
  clearInterval(state.globalTimerInterval);
  clearTimeout(state.versusOpponentInterval);
  DOM.timerContainer.classList.remove('time-attack', 'warning-critical');
  
  try {
    let url = '';
    const today = new Date().toDateString();
    const lastDaily = localStorage.getItem('questify_last_daily_date');

    if (state.quizMode === 'daily') {
      if (lastDaily === today) {
        alert("You have already played today's Daily Challenge! Come back tomorrow.");
        if (aiOverlay) aiOverlay.classList.add('hide');
        DOM.startQuizBtn.disabled = false;
        DOM.startQuizBtn.classList.remove('btn-loading');
        return;
      }
      const limit = state.selectedQuestionCount || 5;
      url = `${API_BASE}/questions?category=technical&difficulty=hard&limit=${limit}&subtopic=AI%20Engineering`;
      if (state.currentUser && state.currentUser.email) {
        url += `&email=${encodeURIComponent(state.currentUser.email)}`;
      }
    } else {
      // Allow custom quiz question count selection
      const limit = state.selectedQuestionCount || ((state.quizMode === 'classic') ? 5 : 10);
      url = `${API_BASE}/questions?category=${state.selectedCategory}&difficulty=${state.selectedDifficulty}&limit=${limit}`;
      if (state.selectedSubtopic) {
        url += `&subtopic=${state.selectedSubtopic}`;
      }
      if (state.currentUser && state.currentUser.email) {
        url += `&email=${encodeURIComponent(state.currentUser.email)}`;
      }
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('API server returned status: ' + res.status);
    
    state.questions = await res.json();
    
    if (state.questions.length === 0) {
      if (aiOverlay) aiOverlay.classList.add('hide');
      alert('No questions found for this combination.');
      DOM.startQuizBtn.disabled = false;
      return;
    }
    
    // Initialize quiz session state
    state.quizFinishing = false;
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.answers = [];
    state.startTime = Date.now();
    
    // Reset Premium lifelines & streaks
    state.lifelinesSpent = { '5050': false, 'freeze': false };
    state.currentStreak = 0;
    state.isFrozen = false;
    updateStreakUI();
    
    const btn5050 = document.getElementById('lifeline-5050');
    const btnFreeze = document.getElementById('lifeline-freeze');
    const lifelinesHud = document.querySelector('.lifelines-hud');
    
    if (lifelinesHud) {
      lifelinesHud.style.display = (state.quizMode === 'zen') ? 'none' : 'flex';
    }
    
    if (btn5050) {
      btn5050.classList.remove('spent');
      btn5050.disabled = false;
    }
    if (btnFreeze) {
      btnFreeze.classList.remove('spent');
      btnFreeze.disabled = false;
    }
    
    // Time Attack specific startup
    if (state.quizMode === 'timeattack') {
      state.globalTimeLeft = 60;
      DOM.timerContainer.classList.add('time-attack');
      startGlobalTimer();
    }
    
    // Render first question
    DOM.totalQuestionsNum.textContent = state.questions.length;
    renderQuestion(state.questions[state.currentQuestionIndex]);
    
    if (state.quizMode === 'versus') {
      if (aiOverlay) aiOverlay.classList.add('hide');
      showPage('versus-matching');
      
      const statusLog = document.getElementById('matching-status-log');
      const statuses = [
        "Locating technical opponents in active nodes...",
        "Evaluating candidate engineers based on category...",
        "Candidate found! Syncing connection protocols...",
        "Opponent Connected: StackOverlord (Rating: 1845)",
        "Syncing quiz sequence... Match starting!"
      ];
      
      let step = 0;
      if (statusLog) statusLog.textContent = statuses[0];
      
      const matchingInterval = setInterval(() => {
        step++;
        if (step < statuses.length) {
          if (statusLog) statusLog.textContent = statuses[step];
        } else {
          clearInterval(matchingInterval);
          DOM.startQuizBtn.disabled = false;
          DOM.startQuizBtn.classList.remove('btn-loading');
          
          showPage('quiz-active');
          
          const vsHud = document.getElementById('versus-hud-panel');
          if (vsHud) {
            vsHud.classList.remove('hide');
          }
          const playerFill = document.getElementById('vs-player-fill');
          const opponentFill = document.getElementById('vs-opponent-fill');
          if (playerFill) playerFill.style.width = '0%';
          if (opponentFill) opponentFill.style.width = '0%';
          
          const opponentName = document.getElementById('vs-opponent-name');
          const botNames = ["StackOverlord", "GitMergeMaster", "CyberNerd", "ByteMe", "BinaryBoss", "DebuggerDon"];
          const chosenBot = botNames[Math.floor(Math.random() * botNames.length)];
          if (opponentName) opponentName.textContent = `${chosenBot} (Bot PvP)`;
          
          startBotSimulation();
        }
      }, 600);
    } else {
      if (aiOverlay) aiOverlay.classList.add('hide');
      DOM.startQuizBtn.disabled = false;
      DOM.startQuizBtn.classList.remove('btn-loading');
      
      showPage('quiz-active');
      const vsHud = document.getElementById('versus-hud-panel');
      if (vsHud) vsHud.classList.add('hide');
    }
  } catch (error) {
    if (aiOverlay) aiOverlay.classList.add('hide');
    console.error('Quiz Init Error:', error);
    alert('Failed to initialize quiz sequence. Ensure backend connectivity.');
    DOM.startQuizBtn.disabled = false;
    DOM.startQuizBtn.classList.remove('btn-loading');
  }
}

function startGlobalTimer() {
  clearInterval(state.globalTimerInterval);
  
  const updateUI = () => {
    DOM.timerCountdown.textContent = state.globalTimeLeft;
    const arcPercent = (state.globalTimeLeft / 60) * 100;
    DOM.timerArc.style.strokeDashoffset = (100 - arcPercent).toFixed(1);
    
    if (state.globalTimeLeft <= 10) {
      DOM.timerContainer.classList.add('warning-critical');
      synth.playTick(); // synthesize fast heart-beat warning clicks
    } else {
      DOM.timerContainer.classList.remove('warning-critical');
    }
  };
  
  updateUI();
  
  state.globalTimerInterval = setInterval(() => {
    if (state.isFrozen) return; // hold countdown during time freeze
    
    state.globalTimeLeft--;
    updateUI();
    
    if (state.globalTimeLeft <= 0) {
      clearInterval(state.globalTimerInterval);
      finishQuizSession().catch((err) => console.error(err));
    }
  }, 1000);
}

function startBotSimulation() {
  clearTimeout(state.versusOpponentInterval);
  
  const botNameEl = document.getElementById('vs-opponent-name');
  const botName = botNameEl ? botNameEl.textContent.replace(' (Bot PvP)', '') : 'StackOverlord';
  
  state.botName = botName;
  state.botCorrectAnswers = 0;
  state.botCurrentIndex = 0;
  state.botFinished = false;
  
  const totalQuestions = state.questions.length || 5;
  const difficulty = state.selectedDifficulty || 'medium';
  
  // Decide accuracy and response interval bounds based on difficulty
  let correctChance = 0.70;
  let minSec = 5;
  let maxSec = 9;
  
  if (difficulty === 'easy') {
    correctChance = 0.50;
    minSec = 6;
    maxSec = 11;
  } else if (difficulty === 'hard') {
    correctChance = 0.90;
    minSec = 4;
    maxSec = 7;
  }
  
  const opponentFill = document.getElementById('vs-opponent-fill');
  const statusFeed = document.getElementById('versus-status-feed');
  
  function nextBotStep() {
    if (state.botFinished || state.quizFinishing) return;
    
    // Choose random answer time
    const waitTime = (Math.random() * (maxSec - minSec) + minSec) * 1000;
    
    state.versusOpponentInterval = setTimeout(() => {
      if (state.botFinished || state.quizFinishing) return;
      
      const isCorrect = Math.random() < correctChance;
      if (isCorrect) {
        state.botCorrectAnswers++;
      }
      
      state.botCurrentIndex++;
      
      if (opponentFill) {
        const pct = (state.botCurrentIndex / totalQuestions) * 100;
        opponentFill.style.width = `${pct}%`;
      }
      
      if (statusFeed) {
        if (isCorrect) {
          statusFeed.innerHTML = `<span style="color: var(--warning); font-weight: 600;">${botName}</span> answered Question ${state.botCurrentIndex} <span style="color: var(--success);">correctly</span>!`;
        } else {
          statusFeed.innerHTML = `<span style="color: var(--warning); font-weight: 600;">${botName}</span> answered Question ${state.botCurrentIndex} <span style="color: var(--danger);">incorrectly</span>.`;
        }
      }
      
      synth.playTick(); // subtle beep for opponent updates
      
      if (state.botCurrentIndex >= totalQuestions) {
        state.botFinished = true;
        if (statusFeed) {
          statusFeed.innerHTML = `<span style="color: var(--warning); font-weight: 600;">${botName}</span> has completed the quiz! <span style="color: var(--text-muted);">Waiting for you...</span>`;
        }
      } else {
        nextBotStep();
      }
    }, waitTime);
  }
  
  // Start the first step
  nextBotStep();
}

async function fetchLeaderboard() {
  DOM.leaderboardTableBody.innerHTML = `
    <tr>
      <td colspan="6" class="table-loading">Loading top rankings...</td>
    </tr>
  `;
  
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) throw new Error('API status: ' + res.status);
    
    const records = await res.json();
    renderLeaderboard(records);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    DOM.leaderboardTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--danger); padding: 24px;">
          Error loading leaderboard data from server.
        </td>
      </tr>
    `;
  }
}

async function autoSaveLeaderboardScore() {
  if (!state.currentUser || !state.currentUser.username) {
    if (DOM.scoreSavedStatusText) {
      DOM.scoreSavedStatusText.textContent = "Please log in to save scores to the Leaderboard.";
    }
    if (DOM.scoreSavedNotification) {
      DOM.scoreSavedNotification.classList.add('error');
    }
    return;
  }

  const name = state.currentUser.username;
  const statusText = DOM.scoreSavedStatusText;
  const container = DOM.scoreSavedNotification;

  if (statusText) {
    statusText.textContent = "Saving your score to the Leaderboard...";
  }
  if (container) {
    container.classList.remove('success', 'error');
    container.className = 'score-saved-notification saving';
  }

  try {
    const totalTime = Math.floor((state.endTime - state.startTime) / 1000);
    const scoreVal = Math.round((state.score / (state.questions.length * 20)) * 100);

    const response = await fetch(`${API_BASE}/leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        score: scoreVal,
        category: state.selectedCategory,
        difficulty: state.selectedDifficulty,
        timeSpent: totalTime
      })
    });

    if (!response.ok) throw new Error('API post failed: ' + response.status);

    // Score successfully recorded!
    if (statusText) {
      statusText.textContent = "Score saved to the Leaderboard successfully!";
    }
    if (container) {
      container.className = 'score-saved-notification success';
    }

    // Refresh the high score list dynamically
    await fetchLeaderboard();
  } catch (error) {
    console.error('Error auto-saving score:', error);
    if (statusText) {
      statusText.textContent = "Unable to auto-save score to the Leaderboard.";
    }
    if (container) {
      container.className = 'score-saved-notification error';
    }
  }
}

/* ==========================================================================
   7. QUIZ PLAY RENDERING & LOGIC
   ========================================================================== */
function renderCategories(catList) {
  DOM.categorySelectGrid.innerHTML = '';
  
  catList.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.dataset.id = cat.id;
    card.tabIndex = 0; // support tab index keyboard navigation
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    
    card.innerHTML = `
      <div class="category-indicator"></div>
      <span class="category-name">${cat.name}</span>
    `;
    
    // Click Select triggers state
    const selectHandler = () => {
      document.querySelectorAll('.category-card').forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-pressed', 'false');
      });
      card.classList.add('selected');
      card.setAttribute('aria-pressed', 'true');
      state.selectedCategory = cat.id;
      synth.playTick(); // synthesize gentle click confirmation
      
      // Dynamic subtopic loading for Technical category
      if (cat.id.toLowerCase() === 'technical') {
        state.selectedSubtopic = null;
        DOM.subtopicGroup.classList.remove('hide');
        DOM.startQuizBtn.disabled = true; // Wait for subtopic selection
        fetchSubtopics(cat.id);
      } else {
        state.selectedSubtopic = null;
        DOM.subtopicGroup.classList.add('hide');
        DOM.startQuizBtn.disabled = false;
      }
    };
    
    card.addEventListener('click', selectHandler);
    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectHandler();
      }
    });
    
    DOM.categorySelectGrid.appendChild(card);
  });
}

async function fetchSubtopics(category) {
  DOM.subtopicSelectGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 13px; padding: 10px;">
      Loading subtopics...
    </div>
  `;
  try {
    const res = await fetch(`${API_BASE}/subtopics?category=${category}`);
    if (!res.ok) throw new Error('API subtopics status: ' + res.status);
    const subtopics = await res.json();
    renderSubtopics(subtopics);
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    DOM.subtopicSelectGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--danger); font-size: 13px; padding: 10px;">
        Failed to load subtopics from server.
      </div>
    `;
  }
}

function renderSubtopics(subList) {
  DOM.subtopicSelectGrid.innerHTML = '';
  if (subList.length === 0) {
    DOM.subtopicSelectGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 13px; padding: 10px;">
        No subtopics available.
      </div>
    `;
    return;
  }
  
  subList.forEach(sub => {
    const card = document.createElement('div');
    card.className = 'subtopic-card';
    card.dataset.id = sub.id;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    
    card.innerHTML = `
      <span class="subtopic-card-name">${sub.name}</span>
    `;
    
    const selectHandler = () => {
      document.querySelectorAll('.subtopic-card').forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-pressed', 'false');
      });
      card.classList.add('selected');
      card.setAttribute('aria-pressed', 'true');
      state.selectedSubtopic = sub.id;
      DOM.startQuizBtn.disabled = false;
      synth.playTick();
    };
    
    card.addEventListener('click', selectHandler);
    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectHandler();
      }
    });
    DOM.subtopicSelectGrid.appendChild(card);
  });
}

function renderQuestion(q) {
  // Update Badges
  DOM.quizCatBadge.textContent = state.selectedCategory.charAt(0).toUpperCase() + state.selectedCategory.slice(1);
  DOM.quizDiffBadge.textContent = state.selectedDifficulty;
  DOM.quizDiffBadge.className = `badge ${state.selectedDifficulty}`;
  
  // Set question meta numbers
  DOM.currentQuestionNum.textContent = state.currentQuestionIndex + 1;
  const progressPercent = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
  DOM.quizProgressFill.style.width = `${progressPercent}%`;
  
  // Inject Question Text
  DOM.questionText.textContent = q.question;
  
  // Reset Options Panel
  DOM.optionsGrid.innerHTML = '';
  DOM.optionsGrid.classList.remove('revealed');
  
  // Shuffle options array so answers don't always reside in the same slots
  const shuffledOptions = [...q.options].sort(() => 0.5 - Math.random());
  
  shuffledOptions.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span>${option}</span>
      <span class="option-badge">${String.fromCharCode(65 + idx)}</span>
    `;
    
    btn.addEventListener('click', () => handleOptionSelection(btn, option, q));
    DOM.optionsGrid.appendChild(btn);
  });
  
  // Toggle footer skips & next btn display states
  DOM.skipBtn.classList.remove('hide');
  DOM.nextBtn.classList.add('hide');
  
  startTimer();
}

function handleOptionSelection(selectedBtn, chosenOption, q) {
  stopTimer();
  
  const isCorrect = (chosenOption === q.correctAnswer);
  const timeSpent = Math.floor((Date.now() - state.questionStartTime) / 1000);
  
  // Update styling immediate feedbacks
  DOM.optionsGrid.classList.add('revealed');
  selectedBtn.classList.add('selected');
  
  // Disable all options so user can't click-spam
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    
    // Find correctly named option text and highlight green
    const textNode = btn.querySelector('span:first-child');
    if (textNode.textContent === q.correctAnswer) {
      btn.classList.add('correct');
    }
  });
  
  if (isCorrect) {
    selectedBtn.classList.add('correct');
    state.score += 20; // 20 marks per question
    
    // Streak logic
    state.currentStreak++;
    updateStreakUI();
    
    synth.playCorrect(state.currentStreak);
  } else {
    selectedBtn.classList.add('incorrect');
    
    // Streak logic
    state.currentStreak = 0;
    updateStreakUI();
    
    synth.playWrong();
  }
  
  // Record answer history
  state.answers.push({
    questionId: q.id,
    questionText: q.question,
    chosenOption,
    correctOption: q.correctAnswer,
    isCorrect,
    timeSpent: Math.min(20, timeSpent)
  });

  if (state.quizMode === 'versus') {
    const playerFill = document.getElementById('vs-player-fill');
    if (playerFill) {
      const percent = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
      playerFill.style.width = `${percent}%`;
    }
    const feed = document.getElementById('versus-status-feed');
    if (feed) {
      if (isCorrect) {
        feed.innerHTML = `<span style="color: var(--primary); font-weight: 600;">You</span> answered Question ${state.currentQuestionIndex + 1} <span style="color: var(--success);">correctly</span>!`;
      } else {
        feed.innerHTML = `<span style="color: var(--primary); font-weight: 600;">You</span> answered Question ${state.currentQuestionIndex + 1} <span style="color: var(--danger);">incorrectly</span>.`;
      }
    }
  }
  
  // Display Next Question triggers
  DOM.skipBtn.classList.add('hide');
  DOM.nextBtn.classList.remove('hide');
  
  DOM.nextBtn.focus();

  if (state.currentQuestionIndex >= state.questions.length - 1) {
    setTimeout(() => advanceQuiz(), 1400);
  }
}

function handleQuestionTimeout() {
  stopTimer();
  
  const q = state.questions[state.currentQuestionIndex];
  
  DOM.optionsGrid.classList.add('revealed');
  
  // Highlight correct answer and block options
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    const textNode = btn.querySelector('span:first-child');
    if (textNode.textContent === q.correctAnswer) {
      btn.classList.add('correct');
    }
  });
  
  // Streak logic
  state.currentStreak = 0;
  updateStreakUI();
  
  synth.playWrong();
  
  state.answers.push({
    questionId: q.id,
    questionText: q.question,
    chosenOption: "Timeout",
    correctOption: q.correctAnswer,
    isCorrect: false,
    timeSpent: 20
  });

  if (state.quizMode === 'versus') {
    const playerFill = document.getElementById('vs-player-fill');
    if (playerFill) {
      const percent = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
      playerFill.style.width = `${percent}%`;
    }
    const feed = document.getElementById('versus-status-feed');
    if (feed) {
      feed.innerHTML = `<span style="color: var(--primary); font-weight: 600;">You</span> ran out of time on Question ${state.currentQuestionIndex + 1}!`;
    }
  }
  
  DOM.skipBtn.classList.add('hide');
  DOM.nextBtn.classList.remove('hide');
  DOM.nextBtn.focus();

  if (state.currentQuestionIndex >= state.questions.length - 1) {
    setTimeout(() => advanceQuiz(), 1400);
  }
}

function handleSkipQuestion() {
  stopTimer();
  
  const q = state.questions[state.currentQuestionIndex];
  
  // Streak logic
  state.currentStreak = 0;
  updateStreakUI();
  
  state.answers.push({
    questionId: q.id,
    questionText: q.question,
    chosenOption: "Skipped",
    correctOption: q.correctAnswer,
    isCorrect: false,
    timeSpent: 0
  });

  if (state.quizMode === 'versus') {
    const playerFill = document.getElementById('vs-player-fill');
    if (playerFill) {
      const percent = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
      playerFill.style.width = `${percent}%`;
    }
    const feed = document.getElementById('versus-status-feed');
    if (feed) {
      feed.innerHTML = `<span style="color: var(--primary); font-weight: 600;">You</span> skipped Question ${state.currentQuestionIndex + 1}.`;
    }
  }
  
  synth.playTick(); // synthesize skipping tick
  advanceQuiz();
}

function advanceQuiz() {
  state.currentQuestionIndex++;
  
  if (state.currentQuestionIndex < state.questions.length) {
    renderQuestion(state.questions[state.currentQuestionIndex]);
  } else {
    finishQuizSession().catch((err) => console.error(err));
  }
}

async function finishQuizSession() {
  if (state.quizFinishing) return;
  state.quizFinishing = true;

  try {
    state.endTime = Date.now();

    clearInterval(state.globalTimerInterval);
    clearInterval(state.timerInterval);
    clearTimeout(state.versusOpponentInterval);
    if (DOM.timerContainer) {
      DOM.timerContainer.classList.remove('time-attack', 'warning-critical');
    }

    synth.playVictory();

    const qCount = Math.max(1, state.questions.length);
    const totalTime = Math.floor((state.endTime - state.startTime) / 1000);
    const correctCount = state.answers.filter((ans) => ans.isCorrect).length;
    const scorePercent = Math.round((state.score / (qCount * 20)) * 100);

    if (scorePercent >= 80) {
      try {
        confetti.start();
      } catch (e) {
        console.warn('Confetti skipped:', e);
      }
    }

    if (state.quizMode === 'versus') {
      const botCorrect = state.botCorrectAnswers || 0;
      const botName = state.botName || 'StackOverlord';
      let outcome = '';
      let outcomeClass = '';
      if (correctCount > botCorrect) {
        outcome = '🏆 BATTLE VICTORY!';
        outcomeClass = 'versus-win';
      } else if (correctCount < botCorrect) {
        outcome = '💀 BATTLE DEFEAT';
        outcomeClass = 'versus-loss';
      } else {
        outcome = '🤝 BATTLE DRAW';
        outcomeClass = 'versus-draw';
      }
      state.leaderboardScoreBanner = {
        percent: scorePercent,
        detail: `${correctCount} / ${qCount} correct vs ${botCorrect} / ${qCount} by ${botName}`,
        versusOutcome: outcome,
        versusClass: outcomeClass
      };
    } else {
      state.leaderboardScoreBanner = {
        percent: scorePercent,
        detail: `${correctCount} / ${qCount} correct`,
      };
    }

    saveLocalStatistics(scorePercent, state.score, state.selectedCategory);

    // Save detailed results for PDF downloads and achievement rules checking
    const formattedAnswers = state.answers.map((ans, idx) => {
      const origQ = state.questions[idx] || {};
      return {
        question: ans.questionText || origQ.question || '',
        options: origQ.options || [],
        selected: ans.chosenOption || '',
        correctAnswer: ans.correctOption || origQ.correctAnswer || '',
        isCorrect: ans.isCorrect
      };
    });

    const lastQuizResults = {
      timestamp: Date.now(),
      category: state.selectedCategory || 'Mixed',
      subtopic: state.selectedSubtopic || '',
      difficulty: state.selectedDifficulty || '',
      totalTime: totalTime,
      scorePercent: scorePercent,
      correctCount: correctCount,
      qCount: qCount,
      mode: state.quizMode || 'classic',
      answers: formattedAnswers,
      lifelinesSpent: state.lifelinesSpent ? { ...state.lifelinesSpent } : { '5050': false, 'freeze': false }
    };
    localStorage.setItem('questify_last_quiz_results', JSON.stringify(lastQuizResults));

    // Check and grant achievements
    checkAndGrantAchievements(lastQuizResults);

    // Persist answered questions to avoid repetitions
    if (state.currentUser && state.currentUser.email) {
      const questionIds = state.answers.map(ans => ans.questionId).filter(id => id !== undefined);
      const questionTexts = state.answers.map(ans => ans.questionText).filter(text => text !== undefined);

      fetch(`${API_BASE}/auth/save-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.currentUser.email,
          questionIds,
          questionTexts
        })
      }).catch(err => console.error('Error saving answered questions to database:', err));
    }

    populateResultsPage(scorePercent, correctCount, qCount, totalTime);

    try {
      renderBreakdownReview();
    } catch (e) {
      console.warn('Review breakdown skipped:', e);
    }

    // Go to scoreboard immediately so finish always lands on leaderboard
    showPage('leaderboard');

    autoSaveLeaderboardScore().catch((err) => console.error('Leaderboard save:', err));
  } catch (err) {
    console.error('finishQuizSession error:', err);
    showPage('leaderboard');
  } finally {
    state.quizFinishing = false;
  }
}

function populateResultsPage(scorePercent, correctCount, qCount, totalTime) {
  if (DOM.resultScorePercent) DOM.resultScorePercent.textContent = `${scorePercent}%`;
  if (DOM.resultScoreFraction) {
    DOM.resultScoreFraction.textContent = `${correctCount} / ${qCount} Correct`;
  }

  const minutes = String(Math.floor(totalTime / 60)).padStart(2, '0');
  const seconds = String(totalTime % 60).padStart(2, '0');
  if (DOM.statTimeSpent) DOM.statTimeSpent.textContent = `${minutes}:${seconds}`;
  if (DOM.statXP) DOM.statXP.textContent = `${state.score} XP`;

  const totalValidTime = state.answers.reduce((acc, a) => acc + a.timeSpent, 0);
  const avgSpeed = (totalValidTime / qCount).toFixed(1);
  if (DOM.statAvgSpeed) DOM.statAvgSpeed.textContent = `${avgSpeed}s`;

  if (DOM.resultTitle) {
    if (scorePercent === 100) {
      DOM.resultTitle.textContent = 'Absolute Perfection!';
    } else if (scorePercent >= 80) {
      DOM.resultTitle.textContent = 'Phenomenal Job!';
    } else if (scorePercent >= 50) {
      DOM.resultTitle.textContent = 'Quiz Completed!';
    } else {
      DOM.resultTitle.textContent = 'Keep Practicing!';
    }
  }
}

function renderBreakdownReview() {
  if (!DOM.reviewList) return;
  DOM.reviewList.innerHTML = '';
  
  state.answers.forEach((ans, idx) => {
    const card = document.createElement('div');
    card.className = `review-card ${ans.isCorrect ? 'correct' : 'incorrect'}`;
    
    card.innerHTML = `
      <div class="review-question">Q${idx + 1}: ${ans.questionText}</div>
      <div class="review-answers">
        <span class="review-choice">Your Choice: <strong>${ans.chosenOption}</strong> <span class="badge-feedback ${ans.isCorrect ? 'correct' : 'incorrect'}">${ans.isCorrect ? 'Correct' : 'Incorrect'}</span></span>
        ${!ans.isCorrect ? `<span class="review-correct">Correct Answer: <strong>${ans.correctOption}</strong></span>` : ''}
      </div>
      <button class="btn btn-secondary btn-sm ai-explain-btn" style="margin-top: 10px; padding: 5px 10px; font-size: 12px; display:flex; align-items:center; gap:5px;" data-idx="${idx}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12L2.5 12"></path></svg>
        Explain with AI
      </button>
    `;
    
    
    // Add event listener for AI Explain
    const explainBtn = card.querySelector('.ai-explain-btn');
    explainBtn.addEventListener('click', () => triggerAIExplain(ans));

    DOM.reviewList.appendChild(card);
  });
  
  if (DOM.reviewSection) DOM.reviewSection.classList.remove('expanded');
  if (DOM.reviewContentWrapper) DOM.reviewContentWrapper.classList.add('hide');
}

const DAY_STREAK_MS = 24 * 60 * 60 * 1000;

/** Day streak on dashboard: +1 when user opens a session at least 24h after last credit; reset if gap ≥ 48h. */
function updateDayStreakOnLogin() {
  const now = Date.now();
  const lastStr = localStorage.getItem('questify_streak_last_login_at');
  let streak = parseInt(
    localStorage.getItem('questify_day_streak')
      || localStorage.getItem('questify_daily_streak')
      || '0',
    10
  );

  if (!lastStr) {
    if (!Number.isFinite(streak) || streak < 1) streak = 1;
    localStorage.setItem('questify_day_streak', String(streak));
    localStorage.setItem('questify_streak_last_login_at', new Date(now).toISOString());
    return;
  }

  const last = new Date(lastStr).getTime();
  if (Number.isNaN(last)) {
    if (!Number.isFinite(streak) || streak < 1) streak = 1;
    localStorage.setItem('questify_day_streak', String(streak));
    localStorage.setItem('questify_streak_last_login_at', new Date(now).toISOString());
    return;
  }

  const elapsed = now - last;
  if (elapsed < DAY_STREAK_MS) return;

  if (elapsed < 2 * DAY_STREAK_MS) {
    streak = (Number.isFinite(streak) && streak > 0 ? streak : 0) + 1;
  } else {
    streak = 1;
  }
  localStorage.setItem('questify_day_streak', String(streak));
  localStorage.setItem('questify_streak_last_login_at', new Date(now).toISOString());
}

function getDayStreak() {
  if (state.currentUser && state.currentUser.streak !== undefined) {
    return state.currentUser.streak;
  }
  return parseInt(
    localStorage.getItem('questify_day_streak')
      || localStorage.getItem('questify_daily_streak')
      || '0',
    10
  );
}

function renderLeaderboard(records) {
  DOM.leaderboardTableBody.innerHTML = '';
  
  if (records.length === 0) {
    DOM.leaderboardTableBody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 24px;">
          No high scores registered yet. Be the first!
        </td>
      </tr>
    `;
    return;
  }
  
  records.forEach((record, index) => {
    const row = document.createElement('tr');
    row.className = `rank-row rank-${index + 1}`;
    
    row.innerHTML = `
      <td><span class="rank-badge">${index + 1}</span></td>
      <td class="player-highlight">${record.name}</td>
      <td style="font-weight: 700; color: var(--primary);">${record.score}%</td>
    `;
    
    DOM.leaderboardTableBody.appendChild(row);
  });
}

/* ==========================================================================
   8. ACCESSIBILITY MODALS & BACKDROP CLOSES
   ========================================================================== */
function setupDialogHandlers(dialog, openBtnSelector) {
  const openBtn = document.querySelector(openBtnSelector);
  
  openBtn.addEventListener('click', () => {
    dialog.showModal();
    synth.playTick(); // synthesize dialog popup tone
  });
  
  // Handle Close actions
  const closeElements = dialog.querySelectorAll('[data-close-dialog]');
  closeElements.forEach(el => {
    el.addEventListener('click', () => {
      dialog.close();
      synth.playTick();
    });
  });
  
  // Modern standard light-dismiss click fallback for Safari
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      
      const rect = dialog.getBoundingClientRect();
      const isInside = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      
      if (!isInside) {
        dialog.close();
        synth.playTick();
      }
    });
  }
}

/* ==========================================================================
   8.5. PREMIUM PACK HELPER ACTIONS (STATS, LIFELINES, STREAKS)
   ========================================================================== */
function loadLocalStatistics() {
  const quizzesPlayed = parseInt(
    localStorage.getItem('questify_stats_quizzes_played')
      || localStorage.getItem('questify_stats_games_played')
      || '0',
    10
  );
  const highScore = parseInt(
    localStorage.getItem('questify_stats_high_score')
      || localStorage.getItem('questify_stats_highscore')
      || '0',
    10
  );
  const totalXp = parseInt(
    localStorage.getItem('questify_stats_total_xp')
      || localStorage.getItem('questify_stats_xp')
      || '0',
    10
  );
  const categoryStats = JSON.parse(localStorage.getItem('questify_stats_categories') || '{}');
  const dayStreak = getDayStreak();
  const dailyChallengeStreak = parseInt(
    localStorage.getItem('questify_daily_challenge_streak') || '0',
    10
  );
  const totalCorrect = parseInt(localStorage.getItem('questify_stats_correct') || '0', 10);
  const totalAnswered = parseInt(localStorage.getItem('questify_stats_answered') || '0', 10);

  return {
    quizzesPlayed,
    highScore,
    totalXp,
    totalXP: totalXp,
    categoryStats,
    dayStreak,
    dailyStreak: dayStreak,
    dailyChallengeStreak,
    totalCorrect,
    totalAnswered,
  };
}

function saveLocalStatistics(scorePercent, scorePoints, category) {
  const stats = loadLocalStatistics();
  
  // 1. Increment quizzes played
  const newQuizzesPlayed = stats.quizzesPlayed + 1;
  localStorage.setItem('questify_stats_quizzes_played', String(newQuizzesPlayed));
  
  // 2. High Score check
  const newHighScore = Math.max(stats.highScore, scorePercent);
  localStorage.setItem('questify_stats_high_score', String(newHighScore));
  
  // 3. Accumulated XP check
  const newTotalXp = stats.totalXp + scorePoints;
  localStorage.setItem('questify_stats_total_xp', String(newTotalXp));
  
  // 4. Update category stats
  const correctThisQuiz = state.answers.filter((a) => a.isCorrect).length;
  const answeredThisQuiz = state.answers.length;

  if (category) {
    stats.categoryStats[category] = (stats.categoryStats[category] || 0) + 1;
    localStorage.setItem('questify_stats_categories', JSON.stringify(stats.categoryStats));

    // Save category specific correctness and total answered for accuracy breakdown
    const categoryCorrect = JSON.parse(localStorage.getItem('questify_stats_category_correct') || '{}');
    const categoryAnswered = JSON.parse(localStorage.getItem('questify_stats_category_answered') || '{}');

    categoryCorrect[category] = (categoryCorrect[category] || 0) + correctThisQuiz;
    categoryAnswered[category] = (categoryAnswered[category] || 0) + answeredThisQuiz;

    localStorage.setItem('questify_stats_category_correct', JSON.stringify(categoryCorrect));
    localStorage.setItem('questify_stats_category_answered', JSON.stringify(categoryAnswered));
  }

  // 5. Accuracy totals
  localStorage.setItem('questify_stats_correct', String(stats.totalCorrect + correctThisQuiz));
  localStorage.setItem('questify_stats_answered', String(stats.totalAnswered + answeredThisQuiz));

  // 6. Recent quiz history
  saveRecentQuiz({
    category: category || state.selectedCategory || 'Mixed',
    subtopic: state.selectedSubtopic || '',
    difficulty: state.selectedDifficulty || '',
    mode: state.quizMode || 'classic',
    score: scorePercent,
    date: new Date().toLocaleString(),
  });

  // 7. Daily Challenge streak (separate from login day streak)
  if (state.quizMode === 'daily') {
    const today = new Date().toDateString();
    localStorage.setItem('questify_last_daily_date', today);
    const dcStreak = stats.dailyChallengeStreak;
    if (scorePercent > 50) {
      localStorage.setItem('questify_daily_challenge_streak', String(dcStreak + 1));
    } else {
      localStorage.setItem('questify_daily_challenge_streak', '0');
    }
  }

  renderLocalStatistics();
  renderRecentActivity();
}

function renderLocalStatistics() {
  const stats = loadLocalStatistics();
  
  const gpEl = document.getElementById('stats-quizzes-played');
  const hsEl = document.getElementById('stats-high-score');
  const txpEl = document.getElementById('stats-total-xp');
  const fcEl = document.getElementById('stats-fav-category');
  const dsEl = document.getElementById('stats-daily-streak');
  
  if (gpEl) gpEl.textContent = stats.quizzesPlayed;
  if (hsEl) hsEl.textContent = `${stats.highScore}%`;
  if (txpEl) txpEl.textContent = `${stats.totalXp} XP`;
  if (dsEl) dsEl.textContent = stats.dayStreak;

  if (DOM.heroStreakNum) DOM.heroStreakNum.textContent = stats.dayStreak;
  if (DOM.dashQuizzesPlayed) DOM.dashQuizzesPlayed.textContent = stats.quizzesPlayed;
  if (DOM.dashHighScore) DOM.dashHighScore.textContent = `${stats.highScore}%`;
  if (DOM.dashTotalXP) DOM.dashTotalXP.textContent = stats.totalXp;
  if (DOM.dashAccuracy && stats.totalAnswered > 0) {
    DOM.dashAccuracy.textContent = `${Math.round((stats.totalCorrect / stats.totalAnswered) * 100)}%`;
  }

  const profileStreak = document.getElementById('profile-streak');
  if (profileStreak) profileStreak.textContent = stats.dayStreak;
  
  // Favorite Category calculation
  let favCategory = 'None';
  let maxCount = 0;
  for (const cat in stats.categoryStats) {
    if (stats.categoryStats[cat] > maxCount) {
      maxCount = stats.categoryStats[cat];
      favCategory = cat;
    }
  }
  
  if (favCategory !== 'None') {
    favCategory = favCategory.charAt(0).toUpperCase() + favCategory.slice(1);
  }
  if (fcEl) fcEl.textContent = favCategory;
  
  // Render Chart.js Analytics
  const ctx = document.getElementById('performance-chart');
  if (ctx && window.Chart) {
    if (window.performanceChart) {
      window.performanceChart.destroy();
    }
    const categories = Object.keys(stats.categoryStats).map(c => c.charAt(0).toUpperCase() + c.slice(1));
    const counts = Object.values(stats.categoryStats);
    
    if (categories.length > 0) {
      window.performanceChart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: categories,
          datasets: [{
        label: 'Quizzes Played per Category',
            data: counts,
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            borderColor: 'rgba(37, 99, 235, 1)',
            pointBackgroundColor: 'rgba(37, 99, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(37, 99, 235, 1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              pointLabels: { color: 'rgba(255, 255, 255, 0.7)', font: { family: 'Outfit' } },
              ticks: { display: false }
            }
          },
          plugins: {
            legend: {
              labels: { color: 'rgba(255, 255, 255, 0.7)', font: { family: 'Outfit' } }
            }
          }
        }
      });
    }
  }
}

function useLifeline5050() {
  if (state.lifelinesSpent['5050']) return;
  
  const q = state.questions[state.currentQuestionIndex];
  const optionButtons = Array.from(DOM.optionsGrid.querySelectorAll('.option-btn'));
  
  // Find incorrect option buttons
  const incorrectButtons = optionButtons.filter(btn => {
    const textNode = btn.querySelector('span:first-child');
    return textNode.textContent !== q.correctAnswer;
  });
  
  // Randomly select 2 incorrect buttons to eliminate
  const eliminated = [];
  while (eliminated.length < 2 && incorrectButtons.length > 0) {
    const randIdx = Math.floor(Math.random() * incorrectButtons.length);
    eliminated.push(incorrectButtons.splice(randIdx, 1)[0]);
  }
  
  // Fade and disable eliminated options
  eliminated.forEach(btn => {
    btn.style.opacity = '0.15';
    btn.style.pointerEvents = 'none';
    btn.disabled = true;
  });
  
  // Spend lifeline
  state.lifelinesSpent['5050'] = true;
  const btn5050 = document.getElementById('lifeline-5050');
  if (btn5050) {
    btn5050.classList.add('spent');
    btn5050.disabled = true;
  }
  
  synth.playTick();
}

function useLifelineFreeze() {
  if (state.lifelinesSpent['freeze']) return;
  
  // 1. Suspend main timer
  clearInterval(state.timerInterval);
  
  // 2. Spend lifeline
  state.lifelinesSpent['freeze'] = true;
  const btnFreeze = document.getElementById('lifeline-freeze');
  if (btnFreeze) {
    btnFreeze.classList.add('spent');
    btnFreeze.disabled = true;
  }
  
  // 3. Trigger freeze state
  state.isFrozen = true;
  DOM.timerContainer.classList.add('frozen');
  
  state.freezeTimeLeft = 10;
  DOM.timerCountdown.textContent = state.freezeTimeLeft;
  
  // Synthesize frosty chime
  synth.playFreezeSuccess();
  
  state.freezeInterval = setInterval(() => {
    state.freezeTimeLeft--;
    DOM.timerCountdown.textContent = state.freezeTimeLeft;
    
    if (state.freezeTimeLeft <= 0) {
      clearInterval(state.freezeInterval);
      state.isFrozen = false;
      DOM.timerContainer.classList.remove('frozen');
      
      // Resume the normal countdown
      if (state.quizMode !== 'timeattack') {
        runActiveTimer();
      }
    } else {
      synth.playFreezeTick();
    }
  }, 1000);
}

function updateStreakUI() {
  const meter = document.getElementById('streak-meter');
  const count = document.getElementById('streak-count');
  if (!meter || !count) return;
  
  if (state.currentStreak >= 2) {
    count.textContent = state.currentStreak;
    meter.classList.remove('hide');
  } else {
    meter.classList.add('hide');
  }
}

/* ==========================================================================
   8.6. COMPETITIVE CODING ARENA IMPLEMENTATION
   ========================================================================== */

async function fetchCodingArenaData() {
  if (!state.currentUser) return;
  
  // Show skeleton loaders
  if (DOM.challengesList) {
    DOM.challengesList.innerHTML = `
      <div class="challenge-skeleton"></div>
      <div class="challenge-skeleton"></div>
    `;
  }
  
  try {
    await Promise.all([
      fetchChallenges(),
      fetchContests(),
      fetchSubmissionsHistoryAndStats()
    ]);
  } catch (err) {
    console.error("Error fetching Coding Arena data:", err);
  }
}

async function fetchChallenges() {
  try {
    const res = await fetch(`${API_BASE}/challenges`);
    if (!res.ok) throw new Error("Challenges API returned status: " + res.status);
    state.challenges = await res.json();
    renderChallengesList();
  } catch (err) {
    console.error("Error loading challenges:", err);
    if (DOM.challengesList) {
      DOM.challengesList.innerHTML = `
        <div style="text-align: center; color: var(--danger); padding: 20px;">
          Failed to load coding challenges.
        </div>
      `;
    }
  }
}

function renderChallengesList() {
  if (!DOM.challengesList) return;
  DOM.challengesList.innerHTML = '';
  
  if (state.challenges.length === 0) {
    DOM.challengesList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 20px;">
        No challenges available at this moment.
      </div>
    `;
    return;
  }
  
  // Create a unique set of solved challenge IDs from Accepted submissions
  const solvedSet = new Set(
    state.submissions
      .filter(s => s.status === 'Accepted')
      .map(s => s.challengeId)
  );
  
  state.challenges.forEach(ch => {
    const isSolved = solvedSet.has(ch.id);
    const item = document.createElement('div');
    item.className = `challenge-item ${isSolved ? 'solved' : ''}`;
    item.setAttribute('role', 'button');
    item.tabIndex = 0;
    
    item.innerHTML = `
      <div class="challenge-meta-header">
        <span class="challenge-title-text">${ch.title}</span>
        <span class="challenge-difficulty-badge ${ch.difficulty.toLowerCase()}">${ch.difficulty.charAt(0).toUpperCase() + ch.difficulty.slice(1)}</span>
      </div>
      <div class="challenge-info-row">
        <span class="challenge-category-tag">${ch.category.toUpperCase()}</span>
        <span class="challenge-xp-tag">${ch.xp} XP</span>
        ${isSolved ? '<span class="challenge-status-tag solved-tag">Solved</span>' : ''}
      </div>
    `;
    
    const clickHandler = () => {
      openChallengePlayground(ch);
      synth.playTick();
    };
    
    item.addEventListener('click', clickHandler);
    item.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        clickHandler();
      }
    });
    
    DOM.challengesList.appendChild(item);
  });
}

async function fetchContests() {
  try {
    const res = await fetch(`${API_BASE}/contests`);
    if (!res.ok) throw new Error("Contests API returned status: " + res.status);
    state.contests = await res.json();
    renderContestsList();
  } catch (err) {
    console.error("Error loading contests:", err);
    if (DOM.contestsList) {
      DOM.contestsList.innerHTML = `
        <div style="text-align: center; color: var(--danger); padding: 20px;">
          Failed to load contests.
        </div>
      `;
    }
  }
}

function renderContestsList() {
  if (!DOM.contestsList) return;
  DOM.contestsList.innerHTML = '';
  
  clearInterval(state.contestCountdownInterval);
  
  if (state.contests.length === 0) {
    DOM.contestsList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 20px;">
        No contests scheduled.
      </div>
    `;
    return;
  }
  
  state.contests.forEach(c => {
    const item = document.createElement('div');
    item.className = 'contest-item';
    
    item.innerHTML = `
      <div class="contest-meta-header">
        <span class="contest-title-text">${c.title}</span>
        <span class="contest-badge upcoming">Upcoming</span>
      </div>
      <div class="contest-time-row">
        <span>Starts in:</span>
        <span class="contest-countdown-timer" id="contest-timer-${c.id}">--d --h --m --s</span>
      </div>
    `;
    
    DOM.contestsList.appendChild(item);
  });
  
  // Ticking update countdowns
  const updateTimers = () => {
    state.contests.forEach(c => {
      const timerEl = document.getElementById(`contest-timer-${c.id}`);
      if (!timerEl) return;
      
      const distance = new Date(c.startTime) - Date.now();
      if (distance < 0) {
        timerEl.textContent = 'Active / Started';
        timerEl.style.color = 'var(--success)';
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      timerEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    });
  };
  
  updateTimers();
  state.contestCountdownInterval = setInterval(updateTimers, 1000);
}

async function fetchSubmissionsHistoryAndStats() {
  if (!state.currentUser) return;
  
  try {
    const res = await fetch(`${API_BASE}/submissions?email=${encodeURIComponent(state.currentUser.email)}`);
    if (!res.ok) throw new Error("Submissions API returned status: " + res.status);
    state.submissions = await res.json();
    
    renderCircularMeters();
    renderHeatmapGrid();
  } catch (err) {
    console.error("Error loading submissions history and stats:", err);
  }
}

function renderCircularMeters() {
  if (!DOM.solvedEasyCount) return;
  
  // Find all unique accepted challenge IDs
  const acceptedIds = new Set(
    state.submissions
      .filter(s => s.status === 'Accepted')
      .map(s => s.challengeId)
  );
  
  const totalEasy = state.challenges.filter(c => c.difficulty === 'easy').length || 3;
  const totalMedium = state.challenges.filter(c => c.difficulty === 'medium').length || 1;
  const totalHard = state.challenges.filter(c => c.difficulty === 'hard').length || 0;
  
  const solvedEasy = state.challenges.filter(c => c.difficulty === 'easy' && acceptedIds.has(c.id)).length;
  const solvedMedium = state.challenges.filter(c => c.difficulty === 'medium' && acceptedIds.has(c.id)).length;
  const solvedHard = state.challenges.filter(c => c.difficulty === 'hard' && acceptedIds.has(c.id)).length;
  
  DOM.solvedEasyCount.textContent = `${solvedEasy}/${totalEasy}`;
  DOM.solvedMediumCount.textContent = `${solvedMedium}/${totalMedium}`;
  DOM.solvedHardCount.textContent = `${solvedHard}/${totalHard}`;
  
  const easyPercent = totalEasy > 0 ? (solvedEasy / totalEasy) * 100 : 0;
  const mediumPercent = totalMedium > 0 ? (solvedMedium / totalMedium) * 100 : 0;
  const hardPercent = totalHard > 0 ? (solvedHard / totalHard) * 100 : 0;
  
  if (DOM.solvedEasyMeter) DOM.solvedEasyMeter.style.strokeDasharray = `${easyPercent}, 100`;
  if (DOM.solvedMediumMeter) DOM.solvedMediumMeter.style.strokeDasharray = `${mediumPercent}, 100`;
  if (DOM.solvedHardMeter) DOM.solvedHardMeter.style.strokeDasharray = `${hardPercent}, 100`;
}

function renderHeatmapGrid() {
  if (!DOM.heatmapGrid) return;
  DOM.heatmapGrid.innerHTML = '';
  
  // Map submissions to YYYY-MM-DD counts
  const dateMap = {};
  state.submissions.forEach(sub => {
    if (!sub.submittedAt) return;
    const dateStr = sub.submittedAt.split('T')[0];
    dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
  });
  
  // Generate 15 weeks * 7 days = 105 cells
  // Render chronological progression (from 104 days ago to today)
  for (let i = 104; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = dateMap[dateStr] || 0;
    
    let level = 'lvl-0';
    if (count === 1) level = 'lvl-1';
    else if (count === 2) level = 'lvl-2';
    else if (count >= 3) level = 'lvl-3';
    
    const cell = document.createElement('div');
    cell.className = `heatmap-cell ${level}`;
    cell.title = `${count} submission${count !== 1 ? 's' : ''} on ${dateStr}`;
    
    DOM.heatmapGrid.appendChild(cell);
  }
}

function openChallengePlayground(challenge) {
  state.activeChallenge = challenge;
  
  // Populate Title & Diff
  if (DOM.playgroundChallengeTitle) DOM.playgroundChallengeTitle.textContent = challenge.title;
  if (DOM.playgroundDifficultyBadge) {
    DOM.playgroundDifficultyBadge.textContent = challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1);
    DOM.playgroundDifficultyBadge.className = `badge ${challenge.difficulty.toLowerCase()}`;
  }
  
  // Populate panes
  if (DOM.playgroundDescriptionText) DOM.playgroundDescriptionText.innerHTML = formatMarkdown(challenge.description);
  if (DOM.playgroundConstraintsText) DOM.playgroundConstraintsText.textContent = challenge.constraints;
  if (DOM.playgroundEditorialText) DOM.playgroundEditorialText.innerHTML = formatMarkdown(challenge.editorial);
  
  // Populate starter code template
  if (DOM.editorLang) DOM.editorLang.value = 'javascript';
  
  // Restore user's last submission draft if it exists, otherwise use template
  const lastSub = state.submissions
    .filter(s => s.challengeId === challenge.id && s.language === 'javascript')
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
    
  if (DOM.editorTextarea) {
    DOM.editorTextarea.value = lastSub ? lastSub.code : challenge.jsTemplate;
  }
  
  // Reset Console output Drawer to collapsed
  if (DOM.consoleDrawer) DOM.consoleDrawer.className = 'console-drawer collapsed';
  if (DOM.consolePlaceholder) DOM.consolePlaceholder.classList.remove('hide');
  if (DOM.consoleResults) {
    DOM.consoleResults.classList.add('hide');
    DOM.consoleResults.innerHTML = '';
  }
  
  // Set tab description active
  document.querySelectorAll('.pane-tab-btn').forEach(btn => {
    if (btn.dataset.tab === 'tab-description') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  const descContent = document.getElementById('tab-description');
  const editContent = document.getElementById('tab-editorial');
  const subContent = document.getElementById('tab-submissions');
  
  if (descContent) descContent.classList.remove('hide');
  if (editContent) editContent.classList.add('hide');
  if (subContent) subContent.classList.add('hide');
  
  // Populate submissions history tab
  renderSubmissionsHistoryTab();
  
  // Transition to playground view
  changeScreen(DOM.playgroundScreen);
}

function renderSubmissionsHistoryTab() {
  if (!DOM.playgroundSubmissionsList || !state.activeChallenge) return;
  DOM.playgroundSubmissionsList.innerHTML = '';
  
  const challengeSubmissions = state.submissions
    .filter(s => s.challengeId === state.activeChallenge.id)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
  if (challengeSubmissions.length === 0) {
    DOM.playgroundSubmissionsList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 24px; font-size: 14px;">
        No submissions yet for this challenge.
      </div>
    `;
    return;
  }
  
  challengeSubmissions.forEach(sub => {
    const item = document.createElement('div');
    const cleanStatus = sub.status.toLowerCase().replace(' ', '-');
    item.className = `submission-history-item ${cleanStatus}`;
    
    const dateFormatted = new Date(sub.submittedAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    item.innerHTML = `
      <div class="sub-history-meta">
        <span class="sub-history-status">${sub.status}</span>
        <span class="sub-history-time">${dateFormatted}</span>
      </div>
      <div class="sub-history-details">
        <span>Lang: ${sub.language.toUpperCase()}</span>
        <span>Runtime: ${sub.runtime}</span>
        <span>XP Earned: ${sub.xpEarned} XP</span>
      </div>
    `;
    
    DOM.playgroundSubmissionsList.appendChild(item);
  });
}

function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
    .replace(/### (.*?)(?:<br>|$)/g, '<h3 style="color: var(--primary); font-family:\'Outfit\',sans-serif; font-size:16px; margin: 16px 0 8px;">$1</h3>')
    .replace(/## (.*?)(?:<br>|$)/g, '<h2 style="color: var(--primary); font-family:\'Outfit\',sans-serif; font-size:18px; margin: 18px 0 10px;">$1</h2>')
    .replace(/• (.*?)(?:<br>|$)/g, '<li style="margin-left: 14px; list-style-type: disc; color: var(--text-light);">$1</li>');
}

function runCode(isSubmit) {
  if (!state.activeChallenge) return;
  const challenge = state.activeChallenge;
  
  // Expand console
  if (DOM.consoleDrawer) DOM.consoleDrawer.classList.remove('collapsed');
  if (DOM.consolePlaceholder) DOM.consolePlaceholder.classList.add('hide');
  if (DOM.consoleResults) {
    DOM.consoleResults.classList.remove('hide');
    DOM.consoleResults.innerHTML = '<div style="color: var(--text-muted); font-family: monospace; padding: 10px;">Executing test cases...</div>';
  }
  
  const codeText = DOM.editorTextarea.value.trim();
  if (!codeText) {
    if (DOM.consoleResults) {
      DOM.consoleResults.innerHTML = '<div style="color: var(--danger); font-family: monospace; padding: 10px;">Error: Solution body cannot be empty.</div>';
    }
    synth.playWrong();
    return;
  }
  
  const lang = DOM.editorLang.value;
  if (lang !== 'javascript') {
    // Simulated compilation for non-JS languages
    setTimeout(() => {
      if (DOM.consoleResults) {
        DOM.consoleResults.innerHTML = `
          <div style="color: var(--warning); font-family: monospace; padding: 12px; line-height: 1.5;">
            Compilation is simulated for ${lang.toUpperCase()}.<br>
            Please switch to JavaScript to run real client-side unit test compilation!
          </div>
        `;
      }
      synth.playTick();
    }, 400);
    return;
  }
  
  // Extract function name from starter JS template
  const nameMatch = challenge.jsTemplate.match(/function\s+(\w+)/);
  if (!nameMatch) {
    if (DOM.consoleResults) {
      DOM.consoleResults.innerHTML = '<div style="color: var(--danger); font-family: monospace; padding: 10px;">Syntax Error: Could not determine entry function name from template.</div>';
    }
    synth.playWrong();
    return;
  }
  const functionName = nameMatch[1];
  
  // Perform Sandbox Execution
  setTimeout(() => {
    let passedAll = true;
    let resultsHtml = '';
    let totalRuntime = 0;
    
    try {
      // Compile function body
      const userFunction = new Function('args', `
        ${codeText}
        if (typeof ${functionName} !== 'function') {
          throw new Error("${functionName} is not defined as a valid function.");
        }
        return ${functionName}.apply(null, args);
      `);
      
      challenge.testCases.forEach((tc, idx) => {
        const tStart = performance.now();
        let userOutput;
        let runtimeError = false;
        let runtimeErrorMsg = '';
        
        try {
          // Deep-clone args to prevent user logic from mutating inputs across tests
          const clonedArgs = JSON.parse(JSON.stringify(tc.rawArgs));
          userOutput = userFunction(clonedArgs);
        } catch (execErr) {
          runtimeError = true;
          runtimeErrorMsg = execErr.message;
        }
        
        const tEnd = performance.now();
        const duration = Math.round(tEnd - tStart);
        totalRuntime += duration;
        
        const expectedParsed = JSON.parse(tc.expected);
        const expectedStr = JSON.stringify(expectedParsed);
        const userOutputStr = runtimeError ? `Runtime Error: ${runtimeErrorMsg}` : JSON.stringify(userOutput);
        
        const isPassed = !runtimeError && (JSON.stringify(userOutput) === expectedStr);
        if (!isPassed) passedAll = false;
        
        resultsHtml += `
          <div class="console-testcase-row ${isPassed ? 'passed' : 'failed'}" style="
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding: 12px 10px;
            font-family: monospace;
          ">
            <div class="testcase-status-bar" style="
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 6px;
            ">
              <span class="testcase-badge" style="
                font-weight: 700;
                font-size: 11px;
                padding: 2px 6px;
                border-radius: 4px;
                background: ${isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
                color: ${isPassed ? 'var(--success)' : 'var(--danger)'};
              ">${isPassed ? 'PASSED' : 'FAILED'}</span>
              <span style="font-weight:600; color: var(--text-light);">Test Case ${idx + 1}</span>
              <span style="color: var(--text-muted); font-size: 11px; margin-left: auto;">${duration}ms</span>
            </div>
            <div class="testcase-details" style="font-size: 12px; line-height: 1.4; padding-left: 8px;">
              <div><span style="color: var(--text-muted);">Input:</span> <code>${tc.input}</code></div>
              <div><span style="color: var(--text-muted);">Expected:</span> <code>${expectedStr}</code></div>
              <div><span style="color: var(--text-muted);">Output:</span> <code style="color: ${isPassed ? 'var(--success)' : 'var(--danger)'};">${userOutputStr}</code></div>
            </div>
          </div>
        `;
      });
      
      if (DOM.consoleResults) DOM.consoleResults.innerHTML = resultsHtml;
      
      if (passedAll) {
        synth.playCorrect();
      } else {
        synth.playWrong();
      }
      
      if (isSubmit) {
        handleSubmissionResult(passedAll, codeText, totalRuntime);
      }
      
    } catch (compileErr) {
      passedAll = false;
      synth.playWrong();
      
      if (DOM.consoleResults) {
        DOM.consoleResults.innerHTML = `
          <div class="console-error-row" style="
            border: 1px solid rgba(239, 68, 68, 0.2);
            background: rgba(239, 68, 68, 0.05);
            border-radius: 8px;
            padding: 16px;
            font-family: monospace;
          ">
            <div class="console-error-header" style="color: var(--danger); font-weight: 700; font-size: 14px; margin-bottom: 8px;">Compilation / Syntax Error</div>
            <pre class="console-error-pre" style="color: var(--text-light); font-size: 12px; white-space: pre-wrap; margin: 0; line-height: 1.4;">${compileErr.message}</pre>
          </div>
        `;
      }
      
      if (isSubmit) {
        handleSubmissionResult(false, codeText, 0, 'Runtime Error');
      }
    }
  }, 300);
}

async function handleSubmissionResult(passedAll, codeText, totalRuntime, customStatus = null) {
  if (!state.currentUser || !state.activeChallenge) return;
  const challenge = state.activeChallenge;
  
  const status = passedAll ? 'Accepted' : (customStatus || 'Wrong Answer');
  const runtimeStr = `${totalRuntime}ms`;
  const xpAwarded = status === 'Accepted' ? challenge.xp : 0;
  
  try {
    const response = await fetch(`${API_BASE}/challenges/${challenge.id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: state.currentUser.email,
        code: codeText,
        status,
        language: DOM.editorLang.value,
        runtime: runtimeStr,
        xpEarned: xpAwarded
      })
    });
    
    if (!response.ok) throw new Error("Submissions POST failed with status: " + response.status);
    
    // Refresh history
    await fetchSubmissionsHistoryAndStats();
    renderSubmissionsHistoryTab();
    
    if (status === 'Accepted') {
      // Update lifetime stats points
      const lifetimeXp = parseInt(localStorage.getItem('questify_stats_total_xp') || '0', 10);
      localStorage.setItem('questify_stats_total_xp', lifetimeXp + xpAwarded);
      renderLocalStatistics();
      
      // Play Triumph Fanfare
      synth.playVictory();
      
      // Particle burst celebration!
      confetti.start();
      
      // Showcase elegant accepted celebration overlay modal
      showCelebrationModal(xpAwarded, runtimeStr);
    } else {
      synth.playWrong();
    }
    
  } catch (err) {
    console.error("Error sending submission:", err);
  }
}

function showCelebrationModal(xp, runtime) {
  const overlay = document.createElement('div');
  overlay.className = 'celebration-modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(12px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.4s ease;
  `;
  
  const card = document.createElement('div');
  card.className = 'celebration-modal-card';
  card.style.cssText = `
    background: rgba(30, 41, 59, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 40px;
    max-width: 450px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 50px rgba(16, 185, 129, 0.2);
    transform: scale(0.9) translateY(20px);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;
  
  card.innerHTML = `
    <div class="celebration-icon-wrapper" style="
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: rgba(16, 185, 129, 0.1);
      border: 2px solid var(--success);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
    ">
      <svg style="width: 40px; height: 40px; color: var(--success);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <h2 style="
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: var(--success);
      margin-bottom: 12px;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    ">Solution Accepted</h2>
    <p style="
      color: var(--text-muted);
      font-size: 15px;
      margin-bottom: 24px;
      line-height: 1.6;
    ">Your JavaScript implementation passed all unit test cases with optimal runtime complexity.</p>
    
    <div class="celebration-metrics" style="
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 32px;
    ">
      <div style="
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 12px;
      ">
        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Points Awarded</div>
        <div style="font-size: 20px; font-weight: 700; color: var(--warning);">+${xp} XP</div>
      </div>
      <div style="
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 12px;
      ">
        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Runtime</div>
        <div style="font-size: 20px; font-weight: 700; color: var(--primary);">${runtime}</div>
      </div>
    </div>
    
    <button class="btn btn-primary btn-glow" id="close-celebration-btn" style="width: 100%;">
      <span>Continue to Submissions</span>
    </button>
  `;
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  
  // Animate in
  setTimeout(() => {
    overlay.style.opacity = '1';
    card.style.transform = 'scale(1) translateY(0)';
  }, 10);
  
  overlay.querySelector('#close-celebration-btn').addEventListener('click', () => {
    // Animate out
    overlay.style.opacity = '0';
    card.style.transform = 'scale(0.9) translateY(20px)';
    setTimeout(() => {
      overlay.remove();
      // Switch left pane to submissions tab
      const submissionsTabBtn = document.querySelector('[data-tab="tab-submissions"]');
      if (submissionsTabBtn) submissionsTabBtn.click();
    }, 400);
  });
}

/* ==========================================================================
   9. INITIALIZATION & EVENT LISTENERS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  // Bind Authentication handlers
  DOM.authForm.addEventListener('submit', handleAuthSubmit);
  DOM.authToggleBtn.addEventListener('click', toggleAuthMode);
  if (DOM.btnSignout) DOM.btnSignout.addEventListener('click', handleSignOut);

  // 1. Fetch startup assets & render leaderboard rankings
  fetchCategories();
  fetchLeaderboard();
  
  // 2. Setup dialog rules bindings
  setupDialogHandlers(DOM.rulesDialog, '#open-rules-btn');
  
  // Sidebar Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      showPage(item.dataset.page);
      synth.playTick();
    });
  });
  
  // Mobile menu toggle
  if (DOM.mobileMenuBtn) {
    DOM.mobileMenuBtn.addEventListener('click', () => {
      DOM.sidebar.classList.toggle('open');
      let overlay = document.querySelector('.sidebar-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', () => {
          DOM.sidebar.classList.remove('open');
          overlay.classList.remove('active');
        });
      }
      overlay.classList.toggle('active');
    });
  }
  
  // Dashboard Quick Action Cards
  const actionQuickplay = document.getElementById('action-quickplay');
  const actionDaily = document.getElementById('action-daily');
  const actionCustom = document.getElementById('action-custom');
  const actionLeaderboard = document.getElementById('action-leaderboard');
  if (actionQuickplay) actionQuickplay.addEventListener('click', () => showPage('quickplay'));
  if (actionDaily) actionDaily.addEventListener('click', () => {
    showPage('quiz-setup');
    const dailyRadio = document.querySelector('input[name="quiz-mode"][value="daily"]');
    if (dailyRadio) { dailyRadio.checked = true; state.quizMode = 'daily'; }
  });
  if (actionCustom) actionCustom.addEventListener('click', () => showPage('quiz-setup'));
  if (actionLeaderboard) actionLeaderboard.addEventListener('click', () => showPage('leaderboard'));
  
  // Quick Play button
  if (DOM.startQuickplayBtn) {
    DOM.startQuickplayBtn.addEventListener('click', startRandomQuiz);
  }

  // Dashboard PDF download actions
  const btnDownloadLastQuiz = document.getElementById('download-last-quiz-btn');
  const btnDownloadQuestionBank = document.getElementById('download-question-bank-btn');
  if (btnDownloadLastQuiz) {
    btnDownloadLastQuiz.addEventListener('click', downloadLastQuizPDF);
  }
  if (btnDownloadQuestionBank) {
    btnDownloadQuestionBank.addEventListener('click', downloadQuestionBankPDF);
  }
  
  // Theme options in settings page
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const hue = btn.dataset.hue;
      document.documentElement.style.setProperty('--hue', hue);
      document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.theme-dot').forEach(d => {
        d.classList.toggle('active', d.dataset.hue === hue);
      });
      localStorage.setItem('questify_theme_hue', hue);
      synth.playTick();
    });
  });
  
  // Settings sound toggle
  const settingSound = document.getElementById('setting-sound');
  if (settingSound) {
    settingSound.addEventListener('change', () => {
      synth.toggle(settingSound.checked);
    });
  }
  
  // 3. Dynamic User Session Check
  const savedUser = localStorage.getItem('questify_user');
  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      // Synchronize session and update streak dynamically from server
      const syncRes = await fetch(`${API_BASE}/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: parsed.email })
      });
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        state.currentUser = syncData.user;
        localStorage.setItem('questify_user', JSON.stringify(syncData.user));
      } else {
        state.currentUser = parsed;
      }
      initSessionForUser();
    } catch (e) {
      console.error('Session loading failed:', e);
      localStorage.removeItem('questify_user');
      DOM.authScreen.classList.remove('hide');
      DOM.appLayout.classList.add('hide');
    }
  } else {
    // Show auth screen on launch
    DOM.authScreen.classList.remove('hide');
    DOM.appLayout.classList.add('hide');
  }
  
  // 3. Audio toggle action bindings
  DOM.soundToggleBtn.addEventListener('click', () => {
    const isEnabled = synth.toggle();
    if (isEnabled) {
      DOM.soundIcon.innerHTML = `
        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      `;
      DOM.soundTooltip.textContent = 'Sound Effects ON';
    } else {
      DOM.soundIcon.innerHTML = `
        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
      DOM.soundTooltip.textContent = 'Sound Effects OFF';
    }
  });
  
  // Load saved default settings if they exist to sync state & Setup UI on startup
  const startupDiff = localStorage.getItem('questify_default_difficulty');
  if (startupDiff) {
    state.selectedDifficulty = startupDiff;
    const diffRadio = document.querySelector(`input[name="difficulty"][value="${startupDiff}"]`);
    if (diffRadio) diffRadio.checked = true;
  }

  const startupCount = localStorage.getItem('questify_question_count');
  if (startupCount) {
    state.selectedQuestionCount = parseInt(startupCount, 10) || 5;
    const countRadio = document.querySelector(`input[name="setup-q-count"][value="${state.selectedQuestionCount}"]`);
    if (countRadio) countRadio.checked = true;
  }
  updateQuizModeDescriptions();

  // 4. Bind difficulty radio elements to state changes
  document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.selectedDifficulty = e.target.value;
      synth.playTick();
    });
  });

  // 4.5 Bind quiz-mode radio elements to state changes
  document.querySelectorAll('input[name="quiz-mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.quizMode = e.target.value;
      synth.playTick();
      updateQuizModeDescriptions();
    });
  });
  
  // 4.7 Bind custom question count radio elements to state changes
  document.querySelectorAll('input[name="setup-q-count"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.selectedQuestionCount = parseInt(e.target.value, 10) || 5;
      updateQuizModeDescriptions();
      synth.playTick();
    });
  });
  
  // 5. Quiz screen navigation actions
  DOM.startQuizBtn.addEventListener('click', startQuizSession);
  DOM.skipBtn.addEventListener('click', handleSkipQuestion);
  DOM.nextBtn.addEventListener('click', advanceQuiz);
  
  // Bind Lifelines HUD
  const btn5050 = document.getElementById('lifeline-5050');
  const btnFreeze = document.getElementById('lifeline-freeze');
  if (btn5050) btn5050.addEventListener('click', useLifeline5050);
  if (btnFreeze) btnFreeze.addEventListener('click', useLifelineFreeze);
  
  DOM.restartQuizBtn.addEventListener('click', () => {
    startQuizSession();
  });
  
  DOM.goHomeBtn.addEventListener('click', () => {
    showPage('dashboard');
  });
  
  // 6. Detailed review accordion toggling
  DOM.toggleReviewBtn.addEventListener('click', () => {
    const isExpanded = DOM.reviewSection.classList.toggle('expanded');
    DOM.reviewContentWrapper.classList.toggle('hide');
    synth.playTick();
    
    if (isExpanded) {
      DOM.reviewContentWrapper.focus();
    }
  });

  /* ==========================================================================
     9.5. COMPETITIVE CODING ARENA EVENT BINDINGS
     ========================================================================== */
  // Arena toggling
  if (DOM.tabQuizArena) {
    DOM.tabQuizArena.addEventListener('click', () => {
      DOM.tabQuizArena.classList.add('active');
      DOM.tabCodingArena.classList.remove('active');
      DOM.quizArenaPanel.classList.remove('hide');
      DOM.codingArenaPanel.classList.add('hide');
      state.activeArena = 'quiz';
      synth.playTick();
    });
  }

  if (DOM.tabCodingArena) {
    DOM.tabCodingArena.addEventListener('click', () => {
      DOM.tabCodingArena.classList.add('active');
      DOM.tabQuizArena.classList.remove('active');
      DOM.codingArenaPanel.classList.remove('hide');
      DOM.quizArenaPanel.classList.add('hide');
      state.activeArena = 'coding';
      // fetchCodingArenaData();
      synth.playTick();
    });
  }

  // Playground control buttons
  if (DOM.playgroundBackBtn) {
    DOM.playgroundBackBtn.addEventListener('click', () => {
      changeScreen(DOM.startScreen);
      fetchChallenges();
      fetchSubmissionsHistoryAndStats();
      synth.playTick();
    });
  }

  if (DOM.editorRunBtn) {
    DOM.editorRunBtn.addEventListener('click', () => {
      runCode(false);
    });
  }

  if (DOM.editorSubmitBtn) {
    DOM.editorSubmitBtn.addEventListener('click', () => {
      runCode(true);
    });
  }

  if (DOM.editorResetBtn) {
    DOM.editorResetBtn.addEventListener('click', () => {
      if (!state.activeChallenge) return;
      const lang = DOM.editorLang ? DOM.editorLang.value : 'javascript';
      if (lang === 'javascript') {
        DOM.editorTextarea.value = state.activeChallenge.jsTemplate;
      } else if (lang === 'python') {
        DOM.editorTextarea.value = state.activeChallenge.pyTemplate;
      }
      synth.playTick();
    });
  }

  if (DOM.editorLang) {
    DOM.editorLang.addEventListener('change', () => {
      if (!state.activeChallenge) return;
      const lang = DOM.editorLang.value;
      if (lang === 'javascript') {
        DOM.editorTextarea.value = state.activeChallenge.jsTemplate;
      } else if (lang === 'python') {
        DOM.editorTextarea.value = state.activeChallenge.pyTemplate;
      }
      synth.playTick();
    });
  }

  // Split-pane Tab toggles
  document.querySelectorAll('.pane-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pane-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.pane-tab-content').forEach(c => {
        c.classList.add('hide');
        c.classList.remove('active');
      });
      btn.classList.add('active');
      const contentEl = document.getElementById(btn.dataset.tab);
      if (contentEl) {
        contentEl.classList.remove('hide');
        contentEl.classList.add('active');
      }
      synth.playTick();
    });
  });

  // Console Drawer Toggling
  if (DOM.consoleHeaderBtn && DOM.consoleDrawer) {
    DOM.consoleHeaderBtn.addEventListener('click', () => {
      DOM.consoleDrawer.classList.toggle('collapsed');
      synth.playTick();
    });
  }

});



/* ==========================================================================
   11. PREMIUM PHYSICS ENGINE - CANVAS CONFETTI
   ========================================================================== */
class ConfettiParticle {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height - 20; // start slightly above viewport
    
    this.size = Math.random() * 8 + 6;
    this.color = this.getRandomColor();
    
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 3 + 2;
    
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 4 - 2;
    
    // Confetti shapes: 0 = circle, 1 = square, 2 = triangle
    this.shape = Math.floor(Math.random() * 3);
  }
  
  getRandomColor() {
    // Elegant vibrant HSL hues tailored to var(--hue) and harmony
    const hues = [
      220, // Primary Sapphire Blue
      150, // Success Emerald Green
      360, // Danger Crimson Red
      38,  // Warning Gold/Yellow
      200  // Cyan highlight
    ];
    const baseHue = hues[Math.floor(Math.random() * hues.length)];
    return `hsl(${baseHue}, 85%, ${Math.floor(Math.random() * 20) + 50}%)`;
  }
  
  update() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.y / 30) * 0.5; // slight wave drift
    this.rotation += this.rotationSpeed;
  }
  
  draw() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate((this.rotation * Math.PI) / 180);
    this.ctx.fillStyle = this.color;
    
    this.ctx.beginPath();
    if (this.shape === 0) {
      // Circle
      this.ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    } else if (this.shape === 1) {
      // Square
      this.ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
    } else {
      // Triangle
      this.ctx.moveTo(0, -this.size / 2);
      this.ctx.lineTo(this.size / 2, this.size / 2);
      this.ctx.lineTo(-this.size / 2, this.size / 2);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }
}

class ConfettiSystem {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.active = false;
    this.animationId = null;
    
    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }
  
  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }
  
  start() {
    if (!this.canvas) return;
    this.stop();
    this.active = true;
    this.particles = Array.from({ length: 150 }, () => new ConfettiParticle(this.canvas));
    this.animate();
    
    // Automatically fade out and terminate after 6 seconds to optimize CPU
    setTimeout(() => this.stop(), 6000);
  }
  
  stop() {
    this.active = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.particles = [];
  }
  
  animate() {
    if (!this.active) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    let allFinished = true;
    this.particles.forEach(p => {
      p.update();
      p.draw();
      
      // If any particle is still inside viewport bounds
      if (p.y < this.canvas.height + 20) {
        allFinished = false;
      }
    });
    
    if (allFinished) {
      this.stop();
    } else {
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  }
}

const confetti = new ConfettiSystem();

async function triggerAIExplain(ans) {
  const modal = document.getElementById('ai-explain-modal');
  const textEl = document.getElementById('ai-explain-text');
  if (modal && textEl) {
    modal.classList.remove('hide');
    textEl.innerHTML = '<span class="pulse">Gemini is thinking...</span>';
    
    try {
      const optionsContext = [ans.correctOption, ans.chosenOption, "other wrong options..."];
      
      const res = await fetch(`${API_BASE}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: ans.questionText,
          options: optionsContext,
          correctAnswer: ans.correctOption,
          userAnswer: ans.isCorrect ? null : ans.chosenOption
        })
      });
      
      if (!res.ok) throw new Error('Explain API failed');
      const data = await res.json();
      
      if (data.explanation) {
        textEl.textContent = data.explanation;
      } else if (data.error) {
        textEl.textContent = "Error: " + data.error;
      }
    } catch (err) {
      textEl.textContent = "Could not fetch AI explanation. Make sure your GEMINI_API_KEY is configured in the backend.";
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('close-explain-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('ai-explain-modal').classList.add('hide');
    });
  }
});

/* ==========================================================================
   10. NEW PAGE RENDERERS (Dashboard, Quick Play, Leaderboard, Profile, Settings)
   ========================================================================== */

// ---- DASHBOARD ----
function renderDashboard() {
  const stats = loadLocalStatistics();
  
  if (DOM.dashQuizzesPlayed) DOM.dashQuizzesPlayed.textContent = stats.quizzesPlayed || 0;
  if (DOM.dashHighScore) DOM.dashHighScore.textContent = (stats.highScore || 0) + '%';
  if (DOM.dashTotalXP) DOM.dashTotalXP.textContent = stats.totalXP || 0;
  if (DOM.heroStreakNum) DOM.heroStreakNum.textContent = stats.dayStreak || 0;
  
  // Calculate accuracy
  if (DOM.dashAccuracy) {
    const accuracy = stats.quizzesPlayed > 0 
      ? Math.round((stats.totalCorrect || 0) / Math.max(1, (stats.totalAnswered || 1)) * 100) 
      : 0;
    DOM.dashAccuracy.textContent = accuracy + '%';
  }
  
  // Render recent activity from localStorage
  renderRecentActivity();
  
  // Render performance chart
  renderPerformanceChart();
}

function renderRecentActivity() {
  if (!DOM.activityList) return;
  
  const recentQuizzes = JSON.parse(
    localStorage.getItem('questify_recent_quizzes') || localStorage.getItem('questify_recent_games') || '[]'
  );
  
  if (recentQuizzes.length === 0) {
    DOM.activityList.innerHTML = `
      <div class="activity-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 40px; height: 40px; opacity: 0.3;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p>No recent quizzes yet. Start a quiz to see your activity!</p>
      </div>`;
    return;
  }
  
  DOM.activityList.innerHTML = recentQuizzes.slice(0, 5).map((quiz) => `
    <div class="activity-item">
      <div class="activity-item-left">
        <span class="activity-item-cat">${quiz.category || 'Mixed'} ${quiz.subtopic ? '• ' + quiz.subtopic : ''}</span>
        <span class="activity-item-time">${quiz.difficulty || ''} • ${quiz.date || 'Just now'}</span>
      </div>
      <span class="activity-item-score">${quiz.score || 0}%</span>
    </div>
  `).join('');
}

function renderPerformanceChart() {
  const stats = loadLocalStatistics();
  const catStats = stats.categoryStats || {};
  
  const labels = Object.keys(catStats).length > 0 ? Object.keys(catStats) : ['Technical', 'Science', 'Geography', 'Aptitude', 'Verbal'];
  const dataValues = Object.keys(catStats).length > 0 ? Object.values(catStats) : [0, 0, 0, 0, 0];
  
  const computedStyle = getComputedStyle(document.documentElement);
  const primaryColor = computedStyle.getPropertyValue('--primary').trim() || '#10b981';
  
  // 1. Render standard performance-chart (legacy fallback)
  const canvasLegacy = document.getElementById('performance-chart');
  if (canvasLegacy) {
    if (window.performanceChartInstance) {
      window.performanceChartInstance.destroy();
    }
    const ctxLegacy = canvasLegacy.getContext('2d');
    window.performanceChartInstance = new Chart(ctxLegacy, {
      type: labels.length > 3 ? 'radar' : 'bar',
      data: {
        labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{
          label: 'Quizzes by Category',
          data: dataValues,
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderColor: primaryColor,
          borderWidth: 2,
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: labels.length > 3 ? {
          r: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            angleLines: { color: 'rgba(255,255,255,0.05)' },
            pointLabels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } },
            ticks: { display: false },
          }
        } : {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)' }, beginAtZero: true },
        }
      }
    });
  }

  // 2. Render premium Radar Chart (Played by Category)
  const radarCanvas = document.getElementById('performance-radar-chart');
  if (radarCanvas) {
    if (window.performanceRadarInstance) {
      window.performanceRadarInstance.destroy();
    }
    const ctxRadar = radarCanvas.getContext('2d');
    window.performanceRadarInstance = new Chart(ctxRadar, {
      type: 'radar',
      data: {
        labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{
          label: 'Quizzes Played',
          data: dataValues,
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: primaryColor,
          borderWidth: 2,
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
          }
        },
        scales: {
          r: {
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: { color: 'rgba(255, 255, 255, 0.7)', font: { family: 'Outfit', size: 10, weight: 600 } },
            ticks: { display: false, stepSize: 1 },
            suggestedMin: 0
          }
        }
      }
    });
  }

  // 3. Render premium Line Chart (Score Trend - Last 10 Quizzes)
  const trendCanvas = document.getElementById('performance-trend-chart');
  if (trendCanvas) {
    if (window.performanceTrendInstance) {
      window.performanceTrendInstance.destroy();
    }
    const ctxTrend = trendCanvas.getContext('2d');
    
    // Load recent quizzes from localStorage
    const recentQuizzes = JSON.parse(localStorage.getItem('questify_recent_quizzes') || '[]');
    let trendLabels = [];
    let trendData = [];
    
    if (recentQuizzes.length > 0) {
      // Reverse so it's oldest to newest
      const chronHistory = [...recentQuizzes].reverse();
      trendLabels = chronHistory.map((q, idx) => {
        const dateObj = new Date(q.date);
        return `Q${idx + 1} (${q.category.substring(0, 4)})`;
      });
      trendData = chronHistory.map(q => q.score);
    } else {
      trendLabels = ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'];
      trendData = [0, 0, 0, 0, 0];
    }
    
    // Add gradient fill
    const trendGradient = ctxTrend.createLinearGradient(0, 0, 0, 200);
    trendGradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    trendGradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    window.performanceTrendInstance = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: trendLabels,
        datasets: [{
          label: 'Score %',
          data: trendData,
          backgroundColor: trendGradient,
          borderColor: '#8b5cf6',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            callbacks: {
              label: function(context) { return `Score: ${context.parsed.y}%`; }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } },
            beginAtZero: true,
            suggestedMax: 100
          }
        }
      }
    });
  }

  // 4. Render premium Bar Chart (Category Accuracy breakdown)
  const accuracyCanvas = document.getElementById('performance-accuracy-chart');
  if (accuracyCanvas) {
    if (window.performanceAccuracyInstance) {
      window.performanceAccuracyInstance.destroy();
    }
    const ctxAccuracy = accuracyCanvas.getContext('2d');
    
    const catCorrect = JSON.parse(localStorage.getItem('questify_stats_category_correct') || '{}');
    const catAnswered = JSON.parse(localStorage.getItem('questify_stats_category_answered') || '{}');
    
    const accuracyLabels = Object.keys(catStats).length > 0 ? Object.keys(catStats) : ['Technical', 'Science', 'Geography', 'Aptitude', 'Verbal'];
    const accuracyData = accuracyLabels.map(cat => {
      const correct = catCorrect[cat] || 0;
      const total = catAnswered[cat] || 0;
      return total > 0 ? Math.round((correct / total) * 100) : 0;
    });
    
    // Gradient fill for bars
    const barGradient = ctxAccuracy.createLinearGradient(0, 0, 0, 200);
    barGradient.addColorStop(0, '#10b981');
    barGradient.addColorStop(1, '#059669');

    window.performanceAccuracyInstance = new Chart(ctxAccuracy, {
      type: 'bar',
      data: {
        labels: accuracyLabels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{
          label: 'Accuracy %',
          data: accuracyData,
          backgroundColor: barGradient,
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            callbacks: {
              label: function(context) { return `Accuracy: ${context.parsed.y}%`; }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } },
            beginAtZero: true,
            suggestedMax: 100
          }
        }
      }
    });
  }
}

function saveRecentQuiz(quizData) {
  const list = JSON.parse(
    localStorage.getItem('questify_recent_quizzes') || localStorage.getItem('questify_recent_games') || '[]'
  );
  list.unshift(quizData);
  localStorage.setItem('questify_recent_quizzes', JSON.stringify(list.slice(0, 10)));
}

// ---- AI QUICK PLAY ----
async function startRandomQuiz() {
  if (DOM.startQuickplayBtn) DOM.startQuickplayBtn.disabled = true;
  if (DOM.quickplayLoading) DOM.quickplayLoading.classList.remove('hide');
  
  try {
    const res = await fetch(`${API_BASE}/questions/random`);
    if (!res.ok) throw new Error('API status: ' + res.status);
    
    state.questions = await res.json();
    
    if (state.questions.length === 0) {
      alert('No questions generated. Please try again.');
      if (DOM.startQuickplayBtn) DOM.startQuickplayBtn.disabled = false;
      if (DOM.quickplayLoading) DOM.quickplayLoading.classList.add('hide');
      return;
    }
    
    // Set up quiz state for random quiz
    state.selectedCategory = 'random';
    state.selectedSubtopic = null;
    state.selectedDifficulty = 'mixed';
    state.quizFinishing = false;
    state.quizMode = 'classic';
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.answers = [];
    state.startTime = Date.now();
    state.lifelinesSpent = { '5050': false, 'freeze': false };
    state.currentStreak = 0;
    state.isFrozen = false;
    updateStreakUI();
    
    const btn5050 = document.getElementById('lifeline-5050');
    const btnFreeze = document.getElementById('lifeline-freeze');
    if (btn5050) { btn5050.classList.remove('spent'); btn5050.disabled = false; }
    if (btnFreeze) { btnFreeze.classList.remove('spent'); btnFreeze.disabled = false; }
    
    DOM.totalQuestionsNum.textContent = state.questions.length;
    if (DOM.quizCatBadge) DOM.quizCatBadge.textContent = 'AI Random';
    if (DOM.quizDiffBadge) DOM.quizDiffBadge.textContent = 'Mixed';
    
    renderQuestion(state.questions[0]);
    
    if (DOM.quickplayLoading) DOM.quickplayLoading.classList.add('hide');
    if (DOM.startQuickplayBtn) DOM.startQuickplayBtn.disabled = false;
    
    showPage('quiz-active');
  } catch (error) {
    console.error('Quick Play Error:', error);
    alert('Failed to generate random quiz. Check backend connectivity.');
    if (DOM.startQuickplayBtn) DOM.startQuickplayBtn.disabled = false;
    if (DOM.quickplayLoading) DOM.quickplayLoading.classList.add('hide');
  }
}

// ---- FULL PAGE LEADERBOARD ----
function showLeaderboardQuizScoreBanner() {
  const wrap = document.getElementById('leaderboard-your-score-banner');
  if (!wrap) return;
  const banner = state.leaderboardScoreBanner;
  if (!banner) {
    wrap.classList.add('hide');
    return;
  }
  const labelEl = wrap.querySelector('.leaderboard-your-score-label');
  const val = document.getElementById('leaderboard-your-score-value');
  const det = document.getElementById('leaderboard-your-score-detail');
  
  // Reset classes
  wrap.classList.remove('versus-win', 'versus-loss', 'versus-draw');
  
  if (banner.versusOutcome) {
    if (labelEl) labelEl.textContent = banner.versusOutcome;
    wrap.classList.add(banner.versusClass);
    if (val) val.textContent = `${banner.percent}%`;
  } else {
    if (labelEl) labelEl.textContent = 'Your quiz score';
    if (val) val.textContent = `${banner.percent}%`;
  }
  
  if (det) det.textContent = banner.detail || '';
  wrap.classList.remove('hide');
}

function renderLeaderboardPage() {
  showLeaderboardQuizScoreBanner();
  state.leaderboardScoreBanner = null;
  fetchLeaderboard();
  
  // Populate podium from existing leaderboard data
  setTimeout(() => {
    const rows = DOM.leaderboardTableBody?.querySelectorAll('tr');
    if (!rows || rows.length === 0) return;
    
    for (let i = 0; i < Math.min(3, rows.length); i++) {
      const cells = rows[i].querySelectorAll('td');
      if (cells.length < 3) continue;
      
      const podiumSlot = document.getElementById(`podium-${i + 1}`);
      if (podiumSlot) {
        const nameEl = podiumSlot.querySelector('.podium-name');
        const scoreEl = podiumSlot.querySelector('.podium-score');
        if (nameEl) nameEl.textContent = cells[1]?.textContent || '—';
        if (scoreEl) scoreEl.textContent = cells[2]?.textContent || '—';
      }
    }
  }, 500);
}

// ---- PROFILE PAGE ----
function renderProfilePage() {
  const stats = loadLocalStatistics();
  
  const profileQuizzes = document.getElementById('profile-quizzes');
  const profileHighscore = document.getElementById('profile-highscore');
  const profileXP = document.getElementById('profile-xp');
  const profileStreak = document.getElementById('profile-streak');
  const profileFavtopic = document.getElementById('profile-favtopic');
  const profileAccuracy = document.getElementById('profile-accuracy');
  
  if (profileQuizzes) profileQuizzes.textContent = stats.quizzesPlayed || 0;
  if (profileHighscore) profileHighscore.textContent = (stats.highScore || 0) + '%';
  if (profileXP) profileXP.textContent = stats.totalXp || 0;
  if (profileStreak) profileStreak.textContent = stats.dayStreak || 0;
  
  // Find favorite topic
  const catStats = stats.categoryStats;
  if (profileFavtopic) {
    if (catStats && Object.keys(catStats).length > 0) {
      const fav = Object.entries(catStats).sort((a, b) => b[1] - a[1])[0][0];
      profileFavtopic.textContent = fav.charAt(0).toUpperCase() + fav.slice(1);
    } else {
      profileFavtopic.textContent = 'None';
    }
  }
  
  if (profileAccuracy) {
    const accuracy = stats.totalAnswered > 0 
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) 
      : 0;
    profileAccuracy.textContent = accuracy + '%';
  }
  
  // Render quiz history
  const historyList = document.getElementById('quiz-history-list');
  if (historyList) {
    const recentQuizzes = JSON.parse(
      localStorage.getItem('questify_recent_quizzes') || localStorage.getItem('questify_recent_games') || '[]'
    );
    if (recentQuizzes.length === 0) {
      historyList.innerHTML = '<p class="empty-state">No quizzes played yet.</p>';
    } else {
      historyList.innerHTML = recentQuizzes.map((q) => `
        <div class="quiz-history-item">
          <div class="quiz-history-item-left">
            <span class="quiz-history-item-cat">${q.category || 'Mixed'} ${q.subtopic ? '• ' + q.subtopic : ''}</span>
            <span class="quiz-history-item-meta">${q.difficulty || ''} • ${q.mode || 'Classic'} • ${q.date || ''}</span>
          </div>
          <span class="quiz-history-item-score">${q.score || 0}%</span>
        </div>
      `).join('');
    }
  }
  
  // Render achievements
  renderAchievements();

  // Initialize Profile form with current credentials
  initProfileForm();
}

const ACHIEVEMENTS_LIST = [
  {
    id: 'academic_scholar',
    name: 'Academic Scholar',
    emoji: '🧠',
    desc: 'Score 100% on any quiz',
    check: (quizData, stats) => quizData && quizData.scorePercent === 100
  },
  {
    id: 'trivia_master',
    name: 'Trivia Master',
    emoji: '📚',
    desc: 'Play 10 quizzes or more',
    check: (quizData, stats) => stats && stats.quizzesPlayed >= 10
  },
  {
    id: 'sonic_speed',
    name: 'Sonic Speed',
    emoji: '⚡',
    desc: 'Average under 5s per question',
    check: (quizData, stats) => quizData && quizData.qCount > 0 && (quizData.totalTime / quizData.qCount) < 5
  },
  {
    id: 'streak_legend',
    name: 'Streak Legend',
    emoji: '🔥',
    desc: '3-day daily challenge streak',
    check: (quizData, stats) => stats && stats.dailyChallengeStreak >= 3
  },
  {
    id: 'lifeline_champion',
    name: 'Lifeline Champion',
    emoji: '🛡️',
    desc: 'Complete quiz without lifelines',
    check: (quizData, stats) => quizData && quizData.mode !== 'zen' && quizData.lifelinesSpent && !quizData.lifelinesSpent['5050'] && !quizData.lifelinesSpent['freeze']
  },
  {
    id: 'zen_guru',
    name: 'Zen Guru',
    emoji: '🧘',
    desc: 'Complete quiz in Zen Mode',
    check: (quizData, stats) => quizData && quizData.mode === 'zen'
  }
];

function renderAchievements() {
  const gallery = document.getElementById('achievements-gallery');
  if (!gallery) return;
  
  const unlocked = JSON.parse(localStorage.getItem('questify_achievements') || '[]');
  
  gallery.innerHTML = ACHIEVEMENTS_LIST.map(a => {
    const isUnlocked = unlocked.includes(a.id);
    return `
    <div class="achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}">
      <span class="achievement-emoji">${a.emoji}</span>
      <span class="achievement-name">${a.name}</span>
      <span class="achievement-badge-desc">${a.desc}</span>
    </div>`;
  }).join('');
}

function checkAndGrantAchievements(quizData) {
  if (!state.currentUser) return;
  const stats = loadLocalStatistics();
  const unlocked = JSON.parse(localStorage.getItem('questify_achievements') || '[]');
  
  let newlyUnlocked = [];
  
  ACHIEVEMENTS_LIST.forEach(ach => {
    if (!unlocked.includes(ach.id)) {
      if (ach.check(quizData, stats)) {
        unlocked.push(ach.id);
        newlyUnlocked.push(ach);
      }
    }
  });
  
  if (newlyUnlocked.length > 0) {
    localStorage.setItem('questify_achievements', JSON.stringify(unlocked));
    
    // Save to backend
    fetch(`${API_BASE}/auth/save-achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: state.currentUser.email,
        achievements: unlocked
      })
    }).catch(err => console.error('Error saving achievements:', err));
    
    // Trigger sliding toast alerts one by one
    newlyUnlocked.forEach((ach, index) => {
      setTimeout(() => {
        showAchievementUnlockedToast(ach);
      }, index * 4000);
    });
  }
}

function showAchievementUnlockedToast(ach) {
  let toast = document.getElementById('achievement-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'achievement-toast';
    toast.className = 'achievement-toast';
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = `
    <span class="achievement-toast-icon">${ach.emoji}</span>
    <div class="achievement-toast-info">
      <h4>Achievement Unlocked! 🎉</h4>
      <p><strong>${ach.name}</strong>: ${ach.desc}</p>
    </div>
  `;
  
  try {
    if (synth && synth.enabled) {
      synth.playVictory();
    }
  } catch (e) {}
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function initProfileForm() {
  if (!state.currentUser) return;
  const usernameInput = document.getElementById('edit-username');
  const emailInput = document.getElementById('edit-email');
  const passwordInput = document.getElementById('edit-password');
  const avatarInput = document.getElementById('edit-avatar-emoji');
  
  if (usernameInput) usernameInput.value = state.currentUser.username || '';
  if (emailInput) emailInput.value = state.currentUser.email || '';
  if (passwordInput) passwordInput.value = '';
  
  const currentAvatar = state.currentUser.avatarEmoji || '⚡';
  if (avatarInput) avatarInput.value = currentAvatar;
  
  const options = document.querySelectorAll('.avatar-option');
  options.forEach(opt => {
    opt.classList.toggle('active', opt.dataset.emoji === currentAvatar);
    
    if (!opt.dataset.bound) {
      opt.dataset.bound = 'true';
      opt.addEventListener('click', () => {
        const emoji = opt.dataset.emoji;
        if (avatarInput) avatarInput.value = emoji;
        
        document.querySelectorAll('.avatar-option').forEach(item => {
          item.classList.toggle('active', item.dataset.emoji === emoji);
        });
        
        try {
          if (synth && synth.enabled) {
            synth.playTick();
          }
        } catch (e) {}
      });
    }
  });
  
  const form = document.getElementById('edit-profile-form');
  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const msgEl = document.getElementById('profile-edit-msg');
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving Changes...';
      }
      
      if (msgEl) {
        msgEl.style.display = 'none';
        msgEl.className = '';
      }
      
      const updatedUsername = usernameInput ? usernameInput.value.trim() : '';
      const updatedEmail = emailInput ? emailInput.value.trim() : '';
      const updatedPassword = passwordInput ? passwordInput.value : '';
      const updatedAvatar = avatarInput ? avatarInput.value : '⚡';
      
      try {
        const response = await fetch(`${API_BASE}/auth/update-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: state.currentUser.email,
            username: updatedUsername,
            newEmail: updatedEmail,
            password: updatedPassword || undefined,
            avatarEmoji: updatedAvatar
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to update profile');
        }
        
        state.currentUser = data.user;
        localStorage.setItem('questify_user', JSON.stringify(data.user));
        
        initSessionForUser();
        
        if (msgEl) {
          msgEl.style.display = 'block';
          msgEl.style.background = 'rgba(16,185,129,0.15)';
          msgEl.style.color = '#10b981';
          msgEl.style.border = '1px solid rgba(16,185,129,0.3)';
          msgEl.textContent = 'Profile updated successfully!';
        }
        
        if (passwordInput) passwordInput.value = '';
        
      } catch (err) {
        console.error('Profile update error:', err);
        if (msgEl) {
          msgEl.style.display = 'block';
          msgEl.style.background = 'rgba(244,63,94,0.15)';
          msgEl.style.color = '#f43f5e';
          msgEl.style.border = '1px solid rgba(244,63,94,0.3)';
          msgEl.textContent = err.message;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Profile Changes';
        }
      }
    });
  }
}

// Render circular custom image or fallback emoji dynamically across the app
function updateUserAvatarUI() {
  if (!state.currentUser) return;
  
  const hasCustomImg = !!state.currentUser.avatarImage;
  const avatarHtml = hasCustomImg 
    ? `<img src="${state.currentUser.avatarImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
    : state.currentUser.avatarEmoji || '⚡';
    
  if (DOM.sidebarAvatar) {
    if (hasCustomImg) {
      DOM.sidebarAvatar.innerHTML = avatarHtml;
      DOM.sidebarAvatar.style.display = 'flex';
      DOM.sidebarAvatar.style.alignItems = 'center';
      DOM.sidebarAvatar.style.justifyContent = 'center';
      DOM.sidebarAvatar.style.padding = '0';
    } else {
      DOM.sidebarAvatar.textContent = state.currentUser.avatarEmoji || '⚡';
      DOM.sidebarAvatar.style.padding = ''; // Reset padding
    }
  }
  
  const profileAvatar = document.getElementById('profile-avatar-large');
  if (profileAvatar) {
    if (hasCustomImg) {
      profileAvatar.innerHTML = avatarHtml;
      profileAvatar.style.display = 'flex';
      profileAvatar.style.alignItems = 'center';
      profileAvatar.style.justifyContent = 'center';
      profileAvatar.style.padding = '0';
    } else {
      profileAvatar.textContent = state.currentUser.avatarEmoji || '⚡';
      profileAvatar.style.padding = ''; // Reset padding
    }
  }
  
  const settingsFallback = document.getElementById('settings-avatar-fallback');
  const settingsPreview = document.getElementById('settings-avatar-preview-container');
  if (settingsPreview) {
    if (hasCustomImg) {
      settingsPreview.innerHTML = avatarHtml;
    } else {
      settingsPreview.innerHTML = `<span id="settings-avatar-fallback">${state.currentUser.avatarEmoji || '⚡'}</span>`;
    }
  }
}

// Bind settings page profile picture upload handlers
function setupSettingsAvatarHandlers() {
  const uploadInput = document.getElementById('settings-avatar-upload');
  const resetBtn = document.getElementById('settings-avatar-reset-btn');
  const statusMsg = document.getElementById('avatar-upload-status');
  
  if (!uploadInput) return;
  
  // Prevent duplicate event handlers by cloning and replacing the input
  const newUploadInput = uploadInput.cloneNode(true);
  uploadInput.parentNode.replaceChild(newUploadInput, uploadInput);
  
  newUploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      if (statusMsg) {
        statusMsg.textContent = '❌ Error: Image is too large (max 2MB).';
        statusMsg.style.color = 'var(--danger)';
      }
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    if (statusMsg) {
      statusMsg.textContent = '⌛ Converting image...';
      statusMsg.style.color = 'var(--text-secondary)';
    }
    
    reader.onload = async () => {
      const base64String = reader.result;
      
      try {
        if (statusMsg) {
          statusMsg.textContent = '⌛ Uploading profile picture...';
        }
        const res = await fetch(`${API_BASE}/auth/update-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: state.currentUser.email,
            avatarImage: base64String
          })
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update avatar image.');
        }
        
        // Success: update state, localStorage, and UI!
        state.currentUser = data.user;
        localStorage.setItem('questify_user', JSON.stringify(data.user));
        
        updateUserAvatarUI();
        
        if (statusMsg) {
          statusMsg.textContent = '✅ Profile picture updated successfully!';
          statusMsg.style.color = '#10b981';
        }
        synth.playStreak(); // Positive chime sound
      } catch (err) {
        console.error(err);
        if (statusMsg) {
          statusMsg.textContent = `❌ Upload failed: ${err.message}`;
          statusMsg.style.color = 'var(--danger)';
        }
      }
    };
    
    reader.onerror = () => {
      if (statusMsg) {
        statusMsg.textContent = '❌ Error reading file.';
        statusMsg.style.color = 'var(--danger)';
      }
    };
    
    reader.readAsDataURL(file);
  });
  
  if (resetBtn) {
    // Prevent duplicate handlers by cloning and replacing
    const newResetBtn = resetBtn.cloneNode(true);
    resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
    
    newResetBtn.addEventListener('click', async () => {
      if (!state.currentUser || !state.currentUser.avatarImage) {
        if (statusMsg) {
          statusMsg.textContent = 'No custom picture set.';
          statusMsg.style.color = 'var(--text-secondary)';
        }
        return;
      }
      
      try {
        if (statusMsg) {
          statusMsg.textContent = '⌛ Removing profile picture...';
        }
        const res = await fetch(`${API_BASE}/auth/update-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: state.currentUser.email,
            avatarImage: null // set to null to delete/remove it
          })
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to remove avatar image.');
        }
        
        // Success: update state, localStorage, and UI!
        state.currentUser = data.user;
        localStorage.setItem('questify_user', JSON.stringify(data.user));
        
        updateUserAvatarUI();
        
        if (statusMsg) {
          statusMsg.textContent = '✅ Profile picture removed.';
          statusMsg.style.color = '#10b981';
        }
        synth.playTick();
      } catch (err) {
        console.error(err);
        if (statusMsg) {
          statusMsg.textContent = `❌ Removal failed: ${err.message}`;
          statusMsg.style.color = 'var(--danger)';
        }
      }
    });
  }
}

function downloadLastQuizPDF() {
  const lastQuiz = JSON.parse(localStorage.getItem('questify_last_quiz_results'));
  if (!lastQuiz) {
    alert("No recent quiz results found. Complete a quiz first!");
    return;
  }
  
  const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
  if (!jsPDFClass) {
    alert("PDF generation engine is not loaded yet. Please refresh the page.");
    return;
  }
  
  const doc = new jsPDFClass();
  let y = 20;
  
  doc.setFillColor(20, 184, 166);
  doc.rect(10, y, 190, 8, 'F');
  y += 18;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39);
  doc.text("Wrenchy Quiz - Performance Sheet", 12, y);
  y += 8;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated on ${new Date(lastQuiz.timestamp || Date.now()).toLocaleString()}`, 12, y);
  y += 14;
  
  doc.setFillColor(243, 244, 246);
  doc.rect(10, y, 190, 32, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("QUIZ OVERVIEW", 15, y + 8);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  
  const min = String(Math.floor(lastQuiz.totalTime / 60)).padStart(2, '0');
  const sec = String(lastQuiz.totalTime % 60).padStart(2, '0');
  
  doc.text(`Category: ${lastQuiz.category || 'Mixed'}`, 15, y + 16);
  doc.text(`Subtopic: ${lastQuiz.subtopic || 'General'}`, 15, y + 24);
  doc.text(`Difficulty: ${lastQuiz.difficulty || 'Medium'}`, 100, y + 16);
  doc.text(`Time Spent: ${min}:${sec}`, 100, y + 24);
  
  doc.setFillColor(16, 185, 129);
  doc.rect(155, y + 5, 38, 22, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`${lastQuiz.scorePercent}%`, 174, y + 16, { align: "center" });
  
  doc.setFontSize(8);
  doc.text(`${lastQuiz.correctCount} / ${lastQuiz.qCount} Correct`, 174, y + 22, { align: "center" });
  
  y += 44;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text("QUESTION BY QUESTION BREAKDOWN", 12, y);
  y += 10;
  
  const answers = lastQuiz.answers || [];
  answers.forEach((ans, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    
    const questionText = `${idx + 1}. ${ans.question}`;
    const questionLines = doc.splitTextToSize(questionText, 180);
    doc.text(questionLines, 12, y);
    y += (questionLines.length * 6);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    const options = ans.options || [];
    options.forEach(opt => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      let prefix = "[ ]";
      
      if (opt === ans.selected) {
        if (ans.isCorrect) {
          prefix = "[✓] (Your Answer - Correct)";
          doc.setTextColor(16, 185, 129);
          doc.setFont("helvetica", "bold");
        } else {
          prefix = "[✗] (Your Answer - Incorrect)";
          doc.setTextColor(239, 68, 68);
          doc.setFont("helvetica", "bold");
        }
      } else if (opt === ans.correctAnswer) {
        prefix = "[✓] (Correct Answer)";
        doc.setTextColor(16, 185, 129);
        doc.setFont("helvetica", "bold");
      } else {
        doc.setTextColor(75, 85, 99);
        doc.setFont("helvetica", "normal");
      }
      
      const optionText = `${prefix} ${opt}`;
      const optionLines = doc.splitTextToSize(optionText, 175);
      doc.text(optionLines, 18, y);
      y += (optionLines.length * 5) + 1;
    });
    
    y += 4;
    doc.setDrawColor(229, 231, 235);
    doc.line(12, y, 198, y);
    y += 8;
  });
  
  doc.save(`Wrenchy_Quiz_Performance_${lastQuiz.category}_${Date.now()}.pdf`);
}

async function downloadQuestionBankPDF() {
  const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
  if (!jsPDFClass) {
    alert("PDF generation engine is not loaded yet. Please refresh the page.");
    return;
  }
  
  const btn = document.getElementById('download-question-bank-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>Compiling Banks...</span>`;
  }
  
  try {
    const res = await fetch(`${API_BASE}/questions/all`);
    if (!res.ok) throw new Error('API server returned status: ' + res.status);
    
    const questions = await res.json();
    if (!questions || questions.length === 0) {
      alert("Question bank is currently empty.");
      return;
    }
    
    const groups = {};
    questions.forEach(q => {
      const cat = q.category ? q.category.toUpperCase() : 'GENERAL';
      const sub = q.subtopic ? q.subtopic : 'General Trivia';
      if (!groups[cat]) groups[cat] = {};
      if (!groups[cat][sub]) groups[cat][sub] = [];
      groups[cat][sub].push(q);
    });
    
    const doc = new jsPDFClass();
    let y = 20;
    
    doc.setFillColor(16, 185, 129);
    doc.rect(10, y, 190, 8, 'F');
    y += 18;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39);
    doc.text("Wrenchy Quiz - Complete Study Banks", 12, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Comprehensive Question Bank containing ${questions.length} structured study materials.`, 12, y);
    y += 14;
    
    for (const [catName, subtopics] of Object.entries(groups)) {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFillColor(243, 244, 246);
      doc.rect(10, y, 190, 10, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129);
      doc.text(`CATEGORY: ${catName}`, 14, y + 7);
      y += 18;
      
      for (const [subtopicName, list] of Object.entries(subtopics)) {
        if (y > 240) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(79, 70, 229);
        doc.text(`Subtopic: ${subtopicName} (${list.length} questions)`, 12, y);
        y += 8;
        
        list.forEach((q, idx) => {
          if (y > 240) {
            doc.addPage();
            y = 20;
          }
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(17, 24, 39);
          
          const qText = `${idx + 1}. [${q.difficulty ? q.difficulty.toUpperCase() : 'MEDIUM'}] ${q.question}`;
          const qLines = doc.splitTextToSize(qText, 180);
          doc.text(qLines, 14, y);
          y += (qLines.length * 5) + 1;
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          
          const options = q.options || [];
          options.forEach(opt => {
            if (y > 260) {
              doc.addPage();
              y = 20;
            }
            
            const isCorrect = (opt === q.correctAnswer);
            let prefix = "[ ]";
            if (isCorrect) {
              prefix = "[✓]";
              doc.setTextColor(16, 185, 129);
              doc.setFont("helvetica", "bold");
            } else {
              doc.setTextColor(75, 85, 99);
              doc.setFont("helvetica", "normal");
            }
            
            const optText = `${prefix} ${opt}`;
            const optLines = doc.splitTextToSize(optText, 175);
            doc.text(optLines, 20, y);
            y += (optLines.length * 4) + 1;
          });
          
          y += 3;
          doc.setDrawColor(243, 244, 246);
          doc.line(14, y, 196, y);
          y += 5;
        });
        y += 4;
      }
      y += 6;
    }
    
    doc.save(`Wrenchy_Quiz_Study_Bank_${Date.now()}.pdf`);
  } catch (err) {
    console.error('Error downloading question bank PDF:', err);
    alert('Failed to compile the question bank: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; flex-shrink: 0;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <span>Download Question Banks</span>
      `;
    }
  }
}

// ---- SETTINGS PAGE ----
function renderSettingsPage() {
  // Load saved settings
  const savedHue = localStorage.getItem('questify_theme_hue');
  if (savedHue) {
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.hue === savedHue);
    });
  }
  
  const settingSound = document.getElementById('setting-sound');
  if (settingSound) settingSound.checked = synth.enabled;
  
  // Default difficulty
  const savedDiff = localStorage.getItem('questify_default_difficulty');
  if (savedDiff) {
    const radio = document.querySelector(`input[name="default-diff"][value="${savedDiff}"]`);
    if (radio) radio.checked = true;
  }
  
  // Question count
  const savedCount = localStorage.getItem('questify_question_count');
  if (savedCount) {
    const radio = document.querySelector(`input[name="q-count"][value="${savedCount}"]`);
    if (radio) radio.checked = true;
  }
  
  // Bind settings change handlers
  document.querySelectorAll('input[name="default-diff"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const val = e.target.value;
      localStorage.setItem('questify_default_difficulty', val);
      state.selectedDifficulty = val;
      const setupDiffRadio = document.querySelector(`input[name="difficulty"][value="${val}"]`);
      if (setupDiffRadio) setupDiffRadio.checked = true;
      synth.playTick();
    });
  });
  
  document.querySelectorAll('input[name="q-count"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const val = e.target.value;
      localStorage.setItem('questify_question_count', val);
      state.selectedQuestionCount = parseInt(val, 10) || 5;
      const setupCountRadio = document.querySelector(`input[name="setup-q-count"][value="${val}"]`);
      if (setupCountRadio) setupCountRadio.checked = true;
      updateQuizModeDescriptions();
      synth.playTick();
    });
  });
}

/**
 * Dynamically updates descriptions under Quiz Modes to reflect the currently selected question count
 */
function updateQuizModeDescriptions() {
  const count = state.selectedQuestionCount || 5;
  
  const classicRadio = document.querySelector('input[name="quiz-mode"][value="classic"]');
  if (classicRadio) {
    const parent = classicRadio.closest('.mode-tab-btn');
    if (parent) {
      const desc = parent.querySelector('.mode-desc');
      if (desc) desc.textContent = `${count} Qs • 20s/Q • Lifelines`;
    }
  }
  
  const versusRadio = document.querySelector('input[name="quiz-mode"][value="versus"]');
  if (versusRadio) {
    const parent = versusRadio.closest('.mode-tab-btn');
    if (parent) {
      const desc = parent.querySelector('.mode-desc');
      if (desc) desc.textContent = `${count} Qs • Live Bot PvP`;
    }
  }
  
  const zenRadio = document.querySelector('input[name="quiz-mode"][value="zen"]');
  if (zenRadio) {
    const parent = zenRadio.closest('.mode-tab-btn');
    if (parent) {
      const desc = parent.querySelector('.mode-desc');
      if (desc) desc.textContent = `${count} Qs • No Clock • Calm`;
    }
  }

  const dailyRadio = document.querySelector('input[name="quiz-mode"][value="daily"]');
  if (dailyRadio) {
    const parent = dailyRadio.closest('.mode-tab-btn');
    if (parent) {
      const desc = parent.querySelector('.mode-desc');
      if (desc) desc.textContent = `${count} Qs • Ultra Hard • Daily`;
    }
  }
}
