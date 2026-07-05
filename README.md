---
title: Offerbudddy
emoji: 🐠
colorFrom: green
colorTo: red
sdk: docker
pinned: false
hf_oauth: true
---
# OfferBuddy AI
> **One Platform. Four AI Experts. One Dream Job.**
> *Final Year Academic Capstone Project — Department of Computer Science & Engineering*

---

## 🚀 Project Overview

**OfferBuddy AI** is an end-to-end, AI-powered Placement Preparation Platform engineered to guide graduating students from base resume optimization to final interview readiness. By unifying four specialized AI advisor workflows under a high-intelligence system prompt layer, OfferBuddy AI ensures candidate evaluation metrics are computed in real time.

### The Four AI Experts
1. **ATS Resume Reviewer:** Computes real-time resume parsing score, visual formatting audits, grammar findings, and strong action-verb bullet rewrites.
2. **Skill Gap Analyst:** Maps active CV contents against selected high-paying positions, outputting specific skill gaps, custom development project ideas, and an expandable 4-week learning curriculum.
3. **Mock Interview Trainer:** Simulates mock interviews (Technical, behavioral, culture-fit) with an interactive voice simulator, providing immediate score matrices and feedback on answer responses.
4. **Code Evaluation Engine:** Offers an in-browser DSA practice compiler reviewing solution correctness, time/space complexity analysis, and clean refactoring targets.

---

## 🏗️ System Architecture

OfferBuddy AI employs a high-performance **Full-Stack (React SPA + Express Server)** architecture, providing lightning-fast builds, zero client-exposed API keys, and seamless local character extractions:

```
                  +-----------------------------------+
                  |        Client Browser             |
                  |  (Vite + React + Tailwind CSS)    |
                  +-----------------+-----------------+
                                    |
                            HTTP / JSON REST
                                    |
                  +-----------------v-----------------+
                  |      Express Node.js Server       |
                  |     (tsx + CJS esbuild bundle)    |
                  +-----------------+-----------------+
                                    |
                             @google/genai SDK
                                    |
                  +-----------------v-----------------+
                  |         Gemini 3.5 Flash          |
                  |      (Structural JSON Schema)     |
                  +-----------------------------------+
```

---

## 📂 Project Folder Structure

```
├── .env.example              # Environment variables template
├── index.html                # Entry HTML skeleton
├── metadata.json             # AI Studio deployment definitions
├── package.json              # Dependency declarations & build scripts
├── server.ts                 # Full-stack Express backend server
├── vite.config.ts            # Vite asset router configuration
├── tsconfig.json             # TypeScript compiler rules
├── src/
│   ├── main.tsx              # React bootstrap entrypoint
│   ├── index.css             # Tailwind CSS & Typography custom declarations
│   ├── types.ts              # Unified domain TypeScript interfaces
│   └── components/
│       ├── LandingPage.tsx   # Premium SaaS introductory viewport
│       ├── AuthPage.tsx      # Dual login/register student portal
│       ├── DashboardView.tsx # Central preparation stats, SVG line charts
│       ├── ResumeReviewView.tsx # Resume pasting & upload ATS scoring
│       ├── SkillGapView.tsx     # Role gaps mapping & learning roadmap
│       ├── MockInterviewView.tsx # Question-by-question mock recruiter
│       ├── CodingEvaluationView.tsx # DSA interactive compiler IDE simulator
│       ├── ProfileView.tsx   # Academic degree & target roles updater
│       └── SettingsView.tsx  # Testing-database clear resets controller
```

---

## 🛠️ Installation & Local Setup

### Prerequisites
- **Node.js** (v18.x or higher)
- **NPM** (v9.x or higher)

### 1. Extract Project Files
Unzip the downloaded project archive and navigate to the root directory.

### 2. Configure Environment Secrets
Create a `.env` file in the root directory (using `.env.example` as a template) and supply your Gemini API Key:
```env
GEMINI_API_KEY="AIzaSyYourSecretKeyHere"
```

### 3. Install Dependencies
Run the package installer from the root directory:
```bash
npm install
```

### 4. Run Development Server
Boot the Express API and Vite dev servers in tandem:
```bash
npm run dev
```
The application will start running at `http://localhost:3000`.

### 5. Build for Production Compilation
Compile the frontend static assets and bundle the server into a fast, standalone CommonJS CJS file:
```bash
npm run build
```
Launch the compiled production bundle:
```bash
npm run start
```

---

## 🔌 API Documentation

### 🛡️ Authentication Routes
- **`POST /api/auth/register`**
  - Creates a new student record and stores target role parameters.
- **`POST /api/auth/login`**
  - Authenticates student credentials and returns an isolated session user object.
- **`POST /api/auth/update-role`**
  - Modifies active target role specifications.

### 📄 Resume Review Routes
- **`POST /api/resume/upload`**
  - Parses incoming text, validates grammar, extracts missing items, and calculates the ATS score using Gemini 3.5.
- **`GET /api/resume/latest`**
  - Returns the latest completed resume audit.

### 🗺️ Skill Gap Routes
- **`POST /api/skill-gap/analyze`**
  - Compares CV with the target position to compile missing skills, suggested project scopes, and a weekly learning curriculum.
- **`GET /api/skill-gap/latest`**
  - Returns the latest computed skill roadmap.

### 🎙️ Mock Interview Routes
- **`POST /api/interview/start`**
  - Spins up 5 tailored placement questions (Technical, Behavioral, and HR).
- **`POST /api/interview/answer`**
  - Submits user response for evaluation and increments active questions.
- **`GET /api/interview/latest`**
  - Pulls current mock interview statistics.

### 💻 Code Evaluation Routes
- **`POST /api/coding/submit`**
  - Evaluates algorithmic solution, analyzing logic, edge cases, time/space complexities, and star ratings.
- **`GET /api/coding/latest`**
  - Fetches last evaluated coding metrics.

---

## 🎨 Design System & Styling Decisions

- **Color Palette:** Dominated by a deep Cosmic Slate (`bg-slate-950`) canvas accented with glowing Emerald Greens (`#10b981`) and deep Indigo Blues.
- **Typography:** Configured **Plus Jakarta Sans** for display headings ensuring a modern, high-contrast, professional feel, combined with **Fira Code** for monospaced debugger panels.
- **Responsiveness:** Fluid grid controls, absolute mobile menu toggles, and scalable SVG vectors ensure a consistent experience across desktop, tablet, and mobile browsers.

---
*OfferBuddy AI — Built to empower the next generation of engineers to unlock elite career opportunities.*

