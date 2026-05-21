# Wrenchy Quiz: Interactive Technical Assessment Arena

Wrenchy Quiz is a responsive, highly performant single-page technical assessment application built from scratch. It features an integrated Express REST API backend and a glowing, glassmorphic dark-mode web dashboard. Users are challenged on software development competencies across multiple subject domains and difficulties with interactive progress trackers, Web Audio oscillation feedback, and an automated shared leaderboard.

---

## 1. Directory Structure

```text
/Users/user/Desktop/Interactive Quiz App/
├── backend/
│   ├── package.json        # Node.js configuration & Express/CORS dependencies
│   ├── server.js           # Server engine hosting REST API endpoints and questions pool
│   └── leaderboard.json    # Persistent local JSON registry tracking logged scores
├── frontend/
│   ├── index.html          # SPA structure with setup, quiz play, and results containers
│   ├── styles.css          # Visual layout rules, CSS custom variables, and media queries
│   └── app.js              # State controller, Web Audio oscillators, and timer module
└── README.md               # Playbook documenting layout specifications and REST routes
```

---

## 2. Integrated REST Routing Interface

The Express backend serves resources on port `5001` with active Cross-Origin Resource Sharing (CORS) allowances, providing complete access to the following endpoints:

### A. GET /api/questions
Retrieves a randomized assortment of corresponding questions based on client filters.
- **Query Parameters**:
  - `category` (string): The subject domain (`Web Development`, `Data Structures`, `Databases`).
  - `difficulty` (string): The complexity level (`Easy`, `Medium`, `Hard`).
- **Response Shape (JSON)**: Array of 5 randomized questions with options shuffled for high-quality variety.
  ```json
  [
    {
      "id": 1,
      "category": "Web Development",
      "difficulty": "Easy",
      "question": "What is the purpose of the HTML5 <nav> element?",
      "options": [
        "To define a block of navigation links",
        "To load external scripts",
        "To display progress meters",
        "To define a sidebar area"
      ],
      "correctAnswer": "To define a block of navigation links"
    }
  ]
  ```

### B. GET /api/leaderboard
Retrieves the compiled leaderboard registrations.
- **Response Shape (JSON)**: Returns the top 10 highest-performing scores sorted in descending order.
  ```json
  [
    {
      "username": "Devin",
      "score": 100,
      "category": "Web Development",
      "date": "2026-05-20T11:25:21.054Z"
    }
  ]
  ```

### C. POST /api/leaderboard
Extracts score payload runs and commits them to the local database file `leaderboard.json` to keep them persistent in real time.
- **Request Body (JSON)**:
  ```json
  {
    "username": "Devin",
    "score": 100,
    "category": "Web Development"
  }
  ```
- **Response Shape (JSON)**:
  ```json
  {
    "success": true,
    "entry": {
      "username": "Devin",
      "score": 100,
      "category": "Web Development",
      "date": "2026-05-20T11:25:21.054Z"
    }
  }
  ```

---

## 3. Frontend Specifications & Features

### A. Single-Page Application (SPA) Controller
Dynamic layout views are toggled instantly by adding or removing the active CSS helper class (`.screen { display: none; } .screen.active { display: block; }`). This ensures transitions are smooth and prevents full page refreshes, keeping the state completely synchronised.

### B. Web Audio oscillator-based Synthesizer
Live programmatically generated sounds synthesize on actions without relying on any external files or server assets:
- **Success Chime**: Soft triangle wave double high chime playing an A5 (880Hz) and E6 (1320Hz) frequency pair.
- **Incorrect/Timeout Sweep Warning**: Low sawtooth wave sweep diving from 180Hz down to 90Hz to provide direct haptic error responses.

### C. Responsive Grid Breakdown
Styles scale dynamically across viewport matrices. If viewed on viewports narrower than `600px` or `480px` (e.g. mobile devices), columns adapt to stacked flex lists and form selectors shrink, providing a high-performance experience with zero overflows.

---

## 4. Run & Play Instructions

### Step 1: Initialize Backend dependencies
Navigate to the backend directory and install express and cors:
```bash
cd backend
npm install
```

### Step 2: Start Express Server
Spin up the REST API on port `5001`:
```bash
npm start
```

### Step 3: Launch Frontend SPA
Simply serve the `frontend/` directory using any local web hosting server (e.g. VS Code Live Server, python http server, or simply opening `frontend/index.html` directly in modern web browsers) to start assessing your engineering skills!
