# Jobify AI — Intelligent Mock Interview Platform

> **Tagline:** Practice Smarter. Interview Better. Get Hired.  
> An enterprise-grade, full-stack AI mock interview platform featuring dynamic question generation, voice-based answering, real-time camera face monitoring, multi-dimensional answer evaluation, and comprehensive performance analytics.

---

## 📌 Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Architecture & System Design](#architecture--system-design)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Local Setup & Installation](#local-setup--installation)
7. [Environment Variables](#environment-variables)
8. [Backend REST API Specifications](#backend-rest-api-specifications)
9. [Camera & Computer Vision Privacy](#camera--computer-vision-privacy)
10. [Cloud Deployment Guide (Vercel & Render)](#cloud-deployment-guide-vercel--render)
11. [Academic Viva & Technical Interview Prep](#academic-viva--technical-interview-prep)

---

## 1. Project Overview

Jobify AI bridges the gap between candidate preparation and real-world hiring standards. Whether you are a college fresher preparing for campus placement or an experienced engineer targeting senior roles, Jobify AI simulates high-stakes technical, HR, and behavioral interviews.

Unlike static quiz apps or basic question banks, Jobify AI provides:
- **Tailored Question Generation**: Contextual questions generated in real-time according to target job role, experience level, and track.
- **Natural Voice Answering**: Powered by the browser Web Speech API (`en-IN` / `en-US`), transcribing candidate speech into editable text in real-time.
- **Candidate Presence & Face Monitoring**: Integrated client-side face presence monitoring powered by MediaPipe to verify single-candidate presence without recording or uploading video streams.
- **Deep Multi-Metric AI Evaluation**: Granular itemized scoring (0–10), identification of observed strengths, missing technical concepts, and benchmark ideal answers.
- **Zero Fake Metrics Guarantee**: Analytics, trends, and history dashboards calculate metrics strictly from the authenticated user's actual database records.

---

## 2. Key Features

### 🎙️ 1. Voice-Based Answering with Web Speech API
- Real-time speech-to-text transcription with continuous recognition.
- Tailored for Indian English (`en-IN`) with options for US and UK accents.
- Candidate speech remains 100% editable in real time before submission.
- Built-in Text-to-Speech (TTS) engine reads interviewer questions aloud.

### 📷 2. Camera-Based Face Presence Monitoring (MediaPipe)
- Live camera preview with local browser capture.
- Real-time detection of zero, one, or multiple faces in frame.
- Automatically logs transitions to ensure session integrity.
- **Strict Privacy**: No video or audio is ever uploaded to servers or stored. All processing runs locally in the candidate's browser.

### 🧠 3. Google Gemini AI Question Generation & Evaluation
- Built using the official `@google/genai` SDK.
- Role-specific generation (Software Engineer, Frontend, Backend, Data Analyst, Machine Learning, Java, Python, HR/Behavioral, Custom roles).
- Structured JSON output schemas for guaranteed parsing reliability.
- Resilient offline fallback engine ensures zero downtime during local demos or viva exams.

### 📊 4. In-Depth Performance Analytics & Reports
- Interactive charts built with **Recharts** (Score Progression Curves, Category Mastery Bars, Track Comparisons).
- PDF Report Export via browser print stylesheets.
- Interview History with search, role filters, status badges, and 1-click session retakes.

---

## 3. Architecture & System Design

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|   React 18 + Vite | Tailwind CSS | React Router | Lucide | Recharts    |
|   Web Speech API (STT/TTS) | MediaDevices API | MediaPipe Face Detector |
+------------------------------------+------------------------------------+
                                     |
                         HTTP / REST API (Axios)
                         JSON Web Tokens (JWT)
                                     |
+------------------------------------+------------------------------------+
|                              SERVER TIER                                |
|   Node.js & Express.js | Cookie-Parser | CORS | Central Error Handler    |
|   Dual Auth Middleware (HTTP-only Cookie + Bearer Header Fallback)      |
+--------------------+-------------------------------+--------------------+
                     |                               |
             Mongoose ODM / MongoDB           @google/genai SDK
                     |                               |
+--------------------+---------------+ +-------------+--------------------+
|            DATABASE TIER           | |              AI TIER             |
|   MongoDB Atlas (Cloud Cluster)    | |   Google Gemini API              |
|   + In-Memory Zero-Config Fallback | |   (gemini-2.5-flash)             |
+------------------------------------+ +----------------------------------+
```

---

## 4. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom design tokens (Navy, Indigo, Violet, Teal, Amber)
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **Analytics Charts**: Recharts
- **HTTP Client**: Axios with request/response interceptors
- **Visual Celebration**: Canvas Confetti

### Backend
- **Runtime**: Node.js (v20+ / v24)
- **Framework**: Express.js (v4.21)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs (Salt rounds: 10)
- **Cookies**: cookie-parser with `SameSite` & `Secure` configuration
- **CORS**: Configured for local development (`localhost:5173`) and cloud deployments (`CLIENT_URL`)

### Database & Artificial Intelligence
- **Database**: MongoDB Atlas with Mongoose ODM (with automatic `mongodb-memory-server` local fallback)
- **AI SDK**: Official `@google/genai` SDK
- **Speech API**: Browser Native Web Speech API (`webkitSpeechRecognition`)
- **Vision Engine**: MediaPipe Face Detection & Native Chromium FaceDetector

---

## 5. Project Structure

```
jobify-ai/
├── client/                     # Frontend Application
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Public navigation bar
│   │   │   ├── Footer.jsx      # Public footer with privacy disclosures
│   │   │   ├── ProtectedRoute.jsx # Authentication route guard
│   │   │   └── CameraFaceMonitor.jsx # Live camera & face detection
│   │   ├── context/            # Global React Context
│   │   │   └── AuthContext.jsx # User state, login, register, logout
│   │   ├── layouts/            # Page layouts
│   │   │   └── DashboardLayout.jsx # Authenticated sidebar & header
│   │   ├── pages/              # Application views
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── CreateInterviewPage.jsx
│   │   │   ├── InterviewSessionPage.jsx
│   │   │   ├── InterviewResultsPage.jsx
│   │   │   ├── InterviewHistoryPage.jsx
│   │   │   ├── PerformanceAnalyticsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios API client with interceptors
│   │   ├── App.jsx             # Main routing configuration
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind directives & print styles
│   ├── tailwind.config.js      # Custom theme tokens & keyframes
│   ├── vite.config.js          # Vite build configuration
│   ├── vercel.json             # Vercel SPA rewrite configuration
│   └── .env.example            # Client environment blueprint
│
├── server/                     # Backend Application
│   ├── config/
│   │   └── db.js               # MongoDB connection & in-memory fallback
│   ├── controllers/
│   │   ├── authController.js   # Registration, login, logout, profile
│   │   ├── interviewController.js # Session generation, answers, AI submit
│   │   └── analyticsController.js # Real user statistics & charts
│   ├── middleware/
│   │   ├── auth.js             # Dual-mode JWT verification
│   │   └── errorHandler.js     # Centralized error formatting
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt methods
│   │   └── Interview.js        # Interview session, questions & logs
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── healthRoutes.js     # System status & diagnostics
│   ├── services/
│   │   └── geminiService.js    # @google/genai integration & evaluation
│   ├── server.js               # Express app initialization
│   └── .env.example            # Backend environment blueprint
│
├── render.yaml                 # Render cloud deployment blueprint
├── .gitignore                  # Git ignore rules (protecting secrets)
├── package.json                # Root orchestration scripts
└── README.md                   # Complete documentation
```

---

## 6. Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/jobify-ai.git
cd jobify-ai
```

### Step 2: Configure Environment Variables
Copy the `.env.example` templates to `.env`:

```bash
# Server Environment
cp server/.env.example server/.env

# Client Environment
cp client/.env.example client/.env
```

*(On Windows PowerShell, use `copy server\.env.example server\.env` and `copy client\.env.example client\.env`)*

### Step 3: Install Dependencies & Run
You can run the frontend and backend in separate terminal tabs:

**Terminal 1 (Backend Server):**
```bash
cd server
npm install
npm start
```
*The server will start on `http://localhost:5000`. If `MONGODB_URI` is left blank, it automatically starts an in-memory database instance.*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm install
npm run dev
```
*The client will start on `http://localhost:5173`.*

---

## 7. Environment Variables

### Backend (`server/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port for Express server | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/jobify` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `super_secret_jwt_key_2026` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `CLIENT_URL` | Allowed origin for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |

### Frontend (`client/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the backend REST API | `http://localhost:5000/api` |

---

## 8. Backend REST API Specifications

### Authentication Endpoints
- `POST /api/auth/register` — Register a new candidate.
  - **Body**: `{ name, email, password, confirmPassword, targetRole, experienceLevel }`
  - **Response**: Sets HTTP-only cookie + `{ success: true, token, user }`
- `POST /api/auth/login` — Authenticate candidate credentials.
  - **Body**: `{ email, password }`
  - **Response**: Sets HTTP-only cookie + `{ success: true, token, user }`
- `POST /api/auth/logout` — Invalidate user session and clear authentication cookie.
- `GET /api/auth/me` *(Protected)* — Retrieve currently logged-in candidate profile.
- `PUT /api/auth/profile` *(Protected)* — Update candidate default role and preferences.

### Interview Session Endpoints
- `POST /api/interviews` *(Protected)* — Generate new AI interview session.
  - **Body**: `{ jobRole, experienceLevel, interviewType, difficulty, questionCount, preferredMethod, cameraEnabled }`
- `GET /api/interviews` *(Protected)* — List candidate's interviews (Supports `page`, `limit`, `role`, `type`, `search`, `status`).
- `GET /api/interviews/:id` *(Protected)* — Retrieve interview session by ID (enforces strict candidate ownership).
- `PUT /api/interviews/:id/answers` *(Protected)* — Autosave in-progress answers and face monitoring events.
- `POST /api/interviews/:id/submit` *(Protected)* — Finalize session, trigger Gemini evaluation, and calculate scores.
- `DELETE /api/interviews/:id` *(Protected)* — Delete interview session.

### Analytics & System Endpoints
- `GET /api/analytics/overview` *(Protected)* — Dashboard summary (Total completed, average score, best score, trend).
- `GET /api/analytics/performance` *(Protected)* — Score trajectory, category mastery, strengths and weaknesses.
- `GET /api/health` — System status, uptime, database health, and Gemini configuration status.

---

## 9. Camera & Computer Vision Privacy

Jobify AI adheres to privacy-by-design standards:
1. **Zero Video Stored**: Camera video feeds are processed directly within the candidate's browser via canvas buffers. No video or audio is ever recorded, streamed, or uploaded to any remote server.
2. **Neutral Presence Logging**: The system only tracks numeric face counts (0, 1, or 2+) to verify candidate presence.
3. **No Biometric Templates**: No face geometry, facial embeddings, or biometric identity templates are created or stored.

---

## 10. Cloud Deployment Guide (Vercel & Render)

### Deploying Frontend on Vercel
1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Select your repository and set the **Root Directory** to `client`.
4. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://your-render-backend.onrender.com/api`
5. Click **Deploy**. The included `client/vercel.json` ensures direct URL refreshes work smoothly.

### Deploying Backend on Render
1. Log in to [Render](https://render.com) and click **New Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In **Environment Variables**, configure:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGODB_URI` = *Your MongoDB Atlas connection string*
   - `JWT_SECRET` = *A strong random 32-character string*
   - `GEMINI_API_KEY` = *Your Google Gemini API key*
   - `CLIENT_URL` = `https://your-vercel-app.vercel.app`
5. Click **Create Web Service**. Verify health via `https://your-backend.onrender.com/api/health`.

---

## 11. Academic Viva & Technical Interview Prep

Here are 10 key questions and answers designed for academic viva voce, capstone evaluations, and technical interviews:

### Q1: How does the Google Gemini integration ensure consistent JSON responses?
**Answer**: We utilize the official `@google/genai` SDK with `responseMimeType: 'application/json'` and an explicit schema in the prompt instructions. On the server, responses pass through `extractJSON()` which strips markdown fences (````json ... ````) and performs regex boundary extraction before Mongoose schema validation.

### Q2: How does authentication handle cross-origin deployments between Vercel and Render?
**Answer**: We implement a dual-transport strategy. The server sets an HTTP-only, `SameSite: None`, `Secure: true` cookie while also returning the token in the JSON response payload. The Axios client stores this in memory / localStorage and sends it via the `Authorization: Bearer <token>` header, ensuring reliable operation across third-party cookie restrictions in modern browsers.

### Q3: How is cheating prevention balanced with candidate privacy in camera monitoring?
**Answer**: Rather than streaming video to a server or running invasive facial recognition, all vision processing runs client-side using MediaPipe. Only discrete categorical events (`single_face`, `no_face`, `multiple_faces`) and timestamps are recorded in the audit log. The system explicitly treats this as a neutral audit trail rather than definitive misconduct.

### Q4: How does Web Speech API integration support Indian candidates?
**Answer**: Speech recognition is explicitly initialized with `recognition.lang = 'en-IN'` (Indian English), tuned for regional pronunciations, while offering options for `en-US` and `en-GB`. Furthermore, recognized speech is streamed into a standard textarea allowing candidates to correct technical jargon or typos before submission.

### Q5: How do the analytics handle new users without creating misleading charts?
**Answer**: Many templates fabricate dummy graphs. Jobify AI strictly queries the authenticated user's completed interviews (`completionStatus: 'completed'`). If `count === 0`, it renders informative empty states with clear calls-to-action to begin practice.

### Q6: What prevents duplicate interview submissions or corrupted scores?
**Answer**: In `submitInterview`, the controller checks `interview.completionStatus === 'completed'`. If already submitted, it returns the existing record immediately. Additionally, question scores are bounded between `0` and `10` via `Math.min(10, Math.max(0, Math.round(score)))`, and the overall score is mathematically recomputed on the backend.

### Q7: What is the benefit of the in-memory database fallback in development?
**Answer**: It eliminates the prerequisite of having a local `mongod` service running or exposing cloud Atlas credentials during local development, grading, or viva demonstrations. The system automatically boots `mongodb-memory-server` if `MONGODB_URI` is unset.

### Q8: How does the application ensure database query efficiency as interview records grow?
**Answer**: The `Interview` schema defines compound indexes on `{ userId: 1, createdAt: -1 }`. List endpoints employ cursor-based offset pagination with `.skip()` and `.limit()` and use `.select('-evaluationResults.suggestedIdealAnswer')` to avoid transferring heavy text payloads during list views.

### Q9: How are different interview tracks evaluated by the AI engine?
**Answer**: The prompt specifies evaluation criteria based on track. Technical questions are graded on conceptual correctness, algorithm trade-offs, and edge case awareness. HR and behavioral questions are evaluated using the STAR framework (Situation, Task, Action, Result) and communication clarity.

### Q10: How does the frontend handle printable PDF generation without external libraries?
**Answer**: Rather than adding heavy PDF generation libraries like `jspdf`, Jobify AI uses browser-native `window.print()` combined with custom Tailwind `@media print` stylesheets that hide navigation bars, flatten shadows, and apply `break-inside: avoid` on question breakdown cards.

---

## 12. License
Distributed under the **MIT License**. Created for academic evaluation, software engineering portfolios, and interview excellence.
