# SnapLearn — Complete Workspace Documentation
> AI-Powered Education App for Rural Indian Students | AI for Bharat — Powered by AWS Hackathon 2025

---

## 🧭 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Setup & Environment](#setup--environment)
5. [How the App Works](#how-the-app-works)
6. [Every Screen Explained](#every-screen-explained)
7. [AI Service Architecture](#ai-service-architecture)
8. [Backend Proxy Architecture](#backend-proxy-architecture)
9. [State Management](#state-management)
10. [Gamification System](#gamification-system)
11. [Navigation Flow](#navigation-flow)
12. [AWS Deployment Guide](#aws-deployment-guide)
13. [What Was Built (Session Log)](#what-was-built-session-log)
14. [Demo Day Checklist](#demo-day-checklist)

---

## 🎯 Project Overview

**SnapLearn** is an AI-powered mobile-first web application designed for **156 million rural Indian students**. It acts as an "AI best friend" that speaks Hinglish, connects school curriculum to everyday rural life, and makes learning feel like play.

### Core Problem
Rural students struggle with:
- Textbooks full of irrelevant city examples (skyscrapers, labs, etc.)
- No access to tutors or personalized learning
- Rote memorization with zero real-world connection
- Demotivation and learning dropouts

### SnapLearn Solution
- 📸 **Snap anything** → Instant multi-subject lesson from the photo
- 🎙️ **Chat in Hinglish** → Talk to AI like a friend, not a teacher
- 🧪 **DIY Experiments** → Use kitchen items to do real science
- 📚 **Homework Helper** → Step-by-step guidance without giving direct answers
- 🎥 **Live Learning** → Walk around and AI explains everything you see
- 🎯 **Exam Predictor** → AI predicts high-probability board exam topics
- 🏆 **Gamification** → XP, levels, streaks, badges to keep students engaged

---

## 🛠️ Tech Stack

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | TailwindCSS v4 |
| Animations | Motion (Framer Motion v12) |
| Icons | Lucide React |
| State | Custom localStorage store (`appStore.ts`) |
| Speech Input | Browser Web Speech API (FREE, Hindi support) |
| Text-to-Speech | AWS Polly via `/api/polly` proxy (Kajal neural) |
| Camera | Browser `getUserMedia` API |

### Backend (Serverless Proxy)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| AI — Vision + Chat | **AWS Bedrock — Claude Sonnet 4.5** | All image analysis, chat, homework, DIY, live learning |
| AI — Exam Predictor | **AWS Bedrock — Claude Sonnet 4.5** | Exam topic predictions (text-only call) |
| TTS | **AWS Polly — Kajal neural voice** | Best Hindi TTS voice available anywhere |
| Local Dev Proxy | **Netlify Functions** (`netlify/functions/`) | Run backend locally alongside Vite |
| Production Proxy | **AWS Lambda** (`lambda/`) | Deploy behind API Gateway |
| Hosting | **AWS Amplify** | Hosts the React frontend |
| API Routing | **Amazon API Gateway** | Routes `/api/*` to Lambda |
| Storage (optional) | **Amazon S3** | Captured learning images |
| Database (optional) | **Amazon DynamoDB** | User profiles, XP, badges |

> **Why a proxy?** AWS credentials cannot live in browser code — Vite bundles them into public JS files where anyone can steal them. All Bedrock/Polly calls go through a serverless function that runs on AWS infrastructure, keeping credentials 100% server-side.

---

## 📁 Folder Structure

```
snap/
├── .env                           # AWS credentials (server-side only — never VITE_ prefix)
├── .env.example                   # Template for env vars
├── .gitignore                     # Includes .env
├── netlify.toml                   # Netlify config: /api/* → functions, SPA fallback
├── vite.config.ts                 # Vite: dev proxy /api/* → localhost:8888
├── package.json                   # Dependencies (includes @aws-sdk/client-bedrock-runtime, polly)
├── tsconfig.json
├── index.html
├── SNAPLEARN_MASTER_GUIDE.md      # Original product specification
├── WORKSPACE.md                   # This file
├── AWS_MIGRATION_GUIDE.md         # Security guide explaining the proxy pattern
│
├── netlify/
│   └── functions/
│       ├── bedrock.js             # 🖥️ Local dev proxy → AWS Bedrock (Claude 4.5)
│       └── polly.js               # 🔊 Local dev proxy → AWS Polly (Kajal voice)
│
├── lambda/
│   ├── bedrock.mjs                # ☁️ AWS Lambda handler → Bedrock (production)
│   └── polly.mjs                  # ☁️ AWS Lambda handler → Polly (production)
│
└── src/
    ├── App.tsx                    # 🔁 Main app router + AI flow orchestration
    ├── types.ts                   # TypeScript types + Screen navigation union type
    ├── index.css                  # Design tokens, Tailwind theme, utilities
    ├── main.tsx                   # React entry point
    │
    ├── store/
    │   └── appStore.ts            # 💾 Central state: profile, XP, badges, cross-screen data
    │
    ├── services/
    │   ├── snaplearnAI.ts         # 🤖 ALL AI calls → /api/bedrock + /api/polly proxy
    │   └── gemini.ts              # (Legacy, unused — kept for reference)
    │
    └── components/
        ├── WelcomeScreen.tsx      # Onboarding: Welcome
        ├── ClassSelectScreen.tsx  # Onboarding: Pick class/grade
        ├── SubjectSelectScreen.tsx # Onboarding: Pick subjects
        ├── ProfileSetupScreen.tsx # Onboarding: Name + location
        ├── HomeScreen.tsx         # 🏠 Main dashboard
        ├── ChatScreen.tsx         # 💬 Hinglish AI chat + voice
        ├── VoiceOverlay.tsx       # 🎙️ Voice chat overlay
        ├── CameraScreen.tsx       # 📸 Snap & Learn camera capture
        ├── ProcessingScreen.tsx   # ⏳ AI analysis loading screen
        ├── AnalysisScreen.tsx     # 📊 Multi-subject lesson results
        ├── DIYPickerScreen.tsx    # 🧪 Choose experiment concept
        ├── DIYScanScreen.tsx      # 🔍 AI scans kitchen/home
        ├── DIYStepScreen.tsx      # 🪜 Step-by-step experiment guide
        ├── DiscoveryChallengeScreen.tsx # 🎯 3-min / 5-photo Discovery Challenge
        ├── DiscoveryProcessingScreen.tsx # ⏳ Multi-photo AI analysis loader
        ├── DiscoveryRevealScreen.tsx    # 🎉 AI-revealed connections + quiz
        ├── SuccessScreen.tsx      # 🏆 Completion + XP reward
        ├── HomeworkCaptureScreen.tsx  # 📷 Capture homework question
        ├── HomeworkSolutionScreen.tsx # 📖 Step-by-step guided solution
        ├── DeepExplainScreen.tsx  # 🔊 AI talks through explanation
        ├── LiveLearningScreen.tsx # 🎥 Real-time environment AI commentary
        ├── ExamPredictorScreen.tsx # 🎯 Board exam topic predictions
        └── ProfileScreen.tsx      # 👤 User profile + badges + stats
```

---

## ⚙️ Setup & Environment

### Required `.env` Variables

```env
# ── AWS Credentials (SERVER-SIDE ONLY — do NOT add VITE_ prefix) ──
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# ── AWS Bedrock ────────────────────────────────────────────────────
# Claude is ONLY available in us-east-1 — do NOT change this region
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-5-20250514-v1:0

# ── AWS Polly ─────────────────────────────────────────────────────
# Kajal neural voice is only available in us-east-1
POLLY_VOICE_ID=Kajal
POLLY_LANGUAGE_CODE=hi-IN

# ── AWS S3 (optional) ─────────────────────────────────────────────
S3_BUCKET_NAME=snaplearn-user-images
S3_REGION=ap-south-1

# ── AWS DynamoDB (optional) ───────────────────────────────────────
DYNAMODB_TABLE_USERS=SnapLearn-Users
DYNAMODB_TABLE_LESSONS=SnapLearn-Lessons
DYNAMODB_TABLE_EXPERIMENTS=SnapLearn-Experiments
DYNAMODB_REGION=ap-south-1
```

### Local Development

**Prerequisites:** Node.js 18+
```bash
# Install dependencies (includes all AWS SDKs)
cd c:\Users\gurug\Desktop\webapps\snap
npm install

# Install Netlify CLI globally (for local function dev)
npm install -g netlify-cli

# Start both Vite (port 3000) + Netlify functions (port 8888) together
npx netlify dev
```

> `vite.config.ts` proxies `/api/*` → `http://localhost:8888/.netlify/functions/*` automatically — no changes needed in the frontend code.

### Production Build
```bash
npm run build
# Deploy /dist to AWS Amplify
```

---

## 🔄 How the App Works

### The Complete User Flow

```
User Opens App
     ↓
[Onboarding] → Name, Class, Subjects, Location
     ↓ (saved to localStorage)
[Home Screen]
     ↓
  ┌──────────────────────────────────────┐
  │         Choose a Mode                │
  └──────────────────────────────────────┘
     │           │           │           │           │
     ↓           ↓           ↓           ↓           ↓
  [Chat]    [Snap &     [DIY Mode]  [Homework]  [Live &
  (AI       Learn]      (Kitchen    (Photo +    Exam]
  Friend)   (Photo +    Experiment) AI Steps)
             AI lesson)
```

### AI Integration Pattern (after AWS migration)

```
User Action (photo / text / voice)
          ↓
 AI Service Call (snaplearnAI.ts)
          ↓
 fetch('/api/bedrock')  ← always relative URL
          ↓
 Netlify Function (local) OR Lambda (production)
          ↓
 AWS Bedrock — Claude Sonnet 4.5
          ↓
 JSON response returned to frontend
          ↓
 State saved (appStore.ts)
          ↓
 Screen renders with AI data
          ↓
 XP awarded + badges checked
```

---

## 📱 Every Screen Explained

### 1. WelcomeScreen
**File:** `src/components/WelcomeScreen.tsx`
- Landing page with SnapLearn branding
- "Shuru Karo!" button starts onboarding
- Animated glowing logo

### 2. ClassSelectScreen
**File:** `src/components/ClassSelectScreen.tsx`
- Grid of class levels (Class 6–12)
- Selection saved to profile
- Tailors all AI responses to the appropriate NCERT level

### 3. SubjectSelectScreen
**File:** `src/components/SubjectSelectScreen.tsx`
- Multi-select subjects (Science, Maths, English, Social, Hindi)
- Subjects affect AI lesson personalization

### 4. ProfileSetupScreen
**File:** `src/components/ProfileSetupScreen.tsx`
- Name input
- Location type (Village / Town / City)
- Language preference (Hindi / English)
- Triggers localStorage save → goes to Home

### 5. HomeScreen ⭐
**File:** `src/components/HomeScreen.tsx`
- Central dashboard with:
  - Profile avatar + name + streak
  - XP bar showing level progress
  - Big Voice Chat mic button (center piece)
  - 4 mode cards: Snap & Learn, DIY, Homework, Live Learning
  - Exam Predictor banner
  - Stats strip (objects snapped, experiments, badges)
- Bottom nav: Home | Snap | DIY (FAB) | Exam | Profile

### 6. ChatScreen ⭐
**File:** `src/components/ChatScreen.tsx`
**AI Used:** `chatWithFriend()` → `/api/bedrock` → Claude Sonnet 4.5

Features:
- Real AI responses in Hinglish personality
- **Voice input** via `SpeechRecognition` API (Hindi language)
- **Text-to-speech** → tap any AI message to hear it (via AWS Polly)
- Subject quick-buttons ("🧬 Bio", "⚗️ Chem" etc.) to jump-start topics
- Typing indicator (3 bouncing dots)
- Chat history sent with each message (last 8 messages for context)

### 7. CameraScreen
**File:** `src/components/CameraScreen.tsx`

Features:
- Rear camera (`facingMode: 'environment'`)
- Rotating animated hints ("Kuch bhi photo karo! 📸")
- Gallery upload button (for devices without camera access)
- Corner brackets viewfinder UI
- Error handling with fallback to gallery

### 8. ProcessingScreen
**File:** `src/components/ProcessingScreen.tsx`

Features:
- Animated spinner with Sparkles icon
- Rotating Hinglish messages while AI works
- Progress bar (visual animation up to 90%)
- Motivational Hinglish quote at bottom
- Different messages for Snap mode vs Homework mode

### 9. AnalysisScreen ⭐
**File:** `src/components/AnalysisScreen.tsx`
**AI Used:** `analyzeImageForLesson()` → `/api/bedrock` → Claude vision

Features:
- Background: blurred captured photo
- Bottom sheet layout with:
  - Object name + emoji + XP earned badge
  - Friend greeting from AI
  - **4 subject tabs**: Biology | Chemistry | Physics | Local Context
  - Each tab shows NCERT chapter link
  - **Interactive quiz** with 4 options, auto-reveals explanation
  - **Next challenge** card (what to photograph next)
- Actions: Take Another Photo | Continue to Success

### 10. DIYPickerScreen
**File:** `src/components/DIYPickerScreen.tsx`

Features:
- 6 experiment concepts with emoji cards
- Difficulty badges (EASY / MEDIUM)
- Tap experiment → bottom sheet preview with details
- Selected concept stored for AI scan step

### 11. DIYScanScreen ⭐
**File:** `src/components/DIYScanScreen.tsx`
**AI Used:** `scanEnvironmentForDIY()` → `/api/bedrock` → Claude vision

Features:
- Camera feed with orange scanning grid overlay
- Shows selected concept name in header
- "Scan & Design Experiment" button captures frame
- AI analyzes available items → generates 4-step safe experiment
- Gallery fallback for devices without camera
- Loading state while AI processes

### 12. DIYStepScreen ⭐
**File:** `src/components/DIYStepScreen.tsx`
**AI Used:** (uses pre-generated `DIYExperiment` from scan step)

Features:
- Split view: camera (top 40%) + step card (bottom 60%)
- Progress dots for all steps
- Step instruction + expected observation + camera action hint
- "Sahi! Agla Step →" button advances through steps
- **Text-to-speech** reads friend comment on step completion (AWS Polly)
- Final step triggers XP award (+150 XP) and experiments count
- Fallback UI if experiment data not loaded

### 13. SuccessScreen
**File:** `src/components/SuccessScreen.tsx`

Features:
- Animated confetti emoji floating up
- Trophy with glow animation
- XP earned badge + Badge unlocked display
- Experiment stats (total XP, experiments count, badges)
- "Ghar Chalte Hain!" → back to home

### 14. HomeworkCaptureScreen
**File:** `src/components/HomeworkCaptureScreen.tsx`

Features:
- Purple-themed camera (vs green for Snap)
- Document frame dashed border overlay
- Gallery upload option
- Tip card: "AI step-by-step guide karega — answer nahi dega!"

### 15. HomeworkSolutionScreen ⭐
**File:** `src/components/HomeworkSolutionScreen.tsx`
**AI Used:** `analyzeHomework()` → `/api/bedrock` → Claude vision

Features:
- Subject + chapter info display
- Captured homework image thumbnail
- AI "friend intro" card
- Question text as AI read it
- **Progressive step revelation**: steps unlock one by one
- Confirm mechanic: "Haan, samjha!" unlocks next step
- **Locked final answer**: blur + "Maine try kiya!" button
- Related concept card at bottom
- Actions: "Aur Explain Karo" | "Naya Sawaal"

### 16. DeepExplainScreen
**File:** `src/components/DeepExplainScreen.tsx`

Features:
- Animated audio waveform visualization
- AI voice explanation display
- Quick follow-up buttons
- Related concept navigation

### 17. LiveLearningScreen ⭐
**File:** `src/components/LiveLearningScreen.tsx`
**AI Used:** `getLiveCommentary()` → `/api/bedrock` → Claude vision (every 4 seconds)

Features:
- Full-screen camera feed
- LIVE badge + session XP counter
- Floating detected object labels (left side)
- AI commentary bubble (bottom) with:
  - Object emoji + name + subject
  - 2-sentence Hinglish commentary
  - NCERT chapter link
  - Micro-question to keep student thinking
- **Text-to-speech** auto-reads each commentary (AWS Polly — Kajal voice)
- 4-second interval analysis
- De-duplication: won't comment on same object twice
- +5 XP per discovery

### 18. ExamPredictorScreen ⭐
**File:** `src/components/ExamPredictorScreen.tsx`
**AI Used:** `predictExam()` → `/api/bedrock` → Claude text

Features:
- Subject selector (Science, Maths, English, Social, Hindi)
- CBSE board exam pattern analysis
- Results show:
  - Smart Study Plan (Must Do / Should Do / Optional counts)
  - Ranked topic list with probability bars
  - Color-coded bars (green = high, yellow = medium, orange = lower)
  - Expandable topic cards showing:
    - Key bullet points
    - Preparation time
    - Marks expected
    - Friend tip in Hinglish
- "Doosra Subject Try Karo" reset button

### 19. ProfileScreen
**File:** `src/components/ProfileScreen.tsx`

Features:
- Profile avatar with gradient (first letter of name)
- XP progress bar with level name
- 3 stat cards: Objects Snapped | Experiments Done | Day Streak
- Selected subjects chips
- **Badges grid**: 4 badges (earned glow vs faded locked)
- Account info: Language, Location, Class
- "Profile Reset Karo" → clears localStorage → back to Welcome

---

## 🤖 AI Service Architecture

**File:** `src/services/snaplearnAI.ts`

All AI calls go through a single shared helper `callBedrock()`:

```typescript
async function callBedrock(payload: {
  prompt: string;
  imageBase64?: string;
  systemPrompt?: string;
  maxTokens?: number;
}): Promise<{ text: string; parsed: unknown }> {
  const res = await fetch('/api/bedrock', {   // ← always relative URL
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
```

All functions share a **base personality prompt** defining the "AI best friend" character:

```typescript
const buildPersonality = (profile: UserProfile) => `
You are SnapLearn — the student's AI best friend...
- Speak in casual Hinglish (Hindi + English mix)
- Get GENUINELY excited when they discover something
- Use "yaar", "bhai", "dost" naturally
- NEVER use formal Hindi. Use "Tu/Tum" not "Aap"
- Always connect to NCERT Class ${profile.grade} syllabus
- Use rural Indian examples (farms, buffalo, neem trees)
`;
```

### Exported AI Functions

| Function | Input | Output | Notes |
|----------|-------|--------|-------|
| `analyzeImageForLesson()` | photo base64 + profile | `SnapLearnResult` | 4-subject lesson + quiz + next challenge |
| `chatWithFriend()` | message + history + profile | Hinglish string (max 4 sentences) | Builds history as plain text |
| `analyzeHomework()` | homework photo base64 + profile | `HomeworkResult` | Progressive steps, locked final answer |
| `scanEnvironmentForDIY()` | frame base64 + concept + profile | `DIYExperiment` | 4-step safe experiment |
| `getLiveCommentary()` | frame base64 + seenObjects + profile | `LiveCommentary` | 2-sentence commentary, deduped |
| `predictExam()` | subject + classLevel | `ExamPrediction` | Ranked topics with probability |
| `analyzeDiscoveryChallenge()` | photos: string[] (5 base64) | `DiscoveryAnalysis` | Multi-image Bedrock call — all 5 photos sent in one request via `extraImages[]` |
| `synthesizeSpeech()` | text + voiceId + languageCode | Blob URL (audio/mpeg) | Calls `/api/polly` |

### JSON Response Pattern
All AI functions enforce strict JSON output:
1. Prompt ends with: `"Return ONLY valid JSON, no markdown code blocks"`
2. Primary parse: `response.parsed` (already parsed server-side by the proxy)
3. Fallback: `text.match(/\{[\s\S]*\}/)` regex extraction
4. TypeScript interfaces enforce the expected shape
5. Fallback/demo UI shown if parsing fails

---

## 🛡️ Backend Proxy Architecture

### Why a Proxy is Required

```
❌ WRONG (exposed to everyone):
Browser → VITE_AWS_SECRET_KEY burned into bundle → AWS Direct

✅ CORRECT (credentials never leave server):
Browser → /api/bedrock → Netlify/Lambda (has AWS keys) → AWS Bedrock
```

### Local Dev: Netlify Functions

**Files:** `netlify/functions/bedrock.js`, `netlify/functions/polly.js`

These use the Netlify v2 function signature (`Request` → `Response`). The `netlify.toml` maps `/api/*` → `/.netlify/functions/*`, and `vite.config.ts` proxies the Vite dev server to port 8888 where Netlify Dev runs the functions.

```toml
# netlify.toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Production: AWS Lambda + API Gateway

**Files:** `lambda/bedrock.mjs`, `lambda/polly.mjs`

These use the Lambda event handler signature. Deploy each `.mjs` file as a separate Lambda function (Node.js 22.x runtime), attach the `SnapLearnLambdaRole` IAM role, and route from API Gateway:

```
API Gateway
  POST /api/bedrock  →  Lambda: snaplearn-bedrock
  POST /api/polly    →  Lambda: snaplearn-polly
```

> For Polly binary audio responses, set **Binary Media Types** = `audio/mpeg` in API Gateway settings.

---

## 💾 State Management

**File:** `src/store/appStore.ts`

Uses **localStorage** directly (no external state library needed).

### AppState Interface

```typescript
interface AppState {
  // Profile (persists across sessions)
  profile: UserProfile;        // name, grade, subjects, location, language

  // Gamification (persists across sessions)
  xp: number;                  // Total XP earned
  level: number;               // Calculated from XP
  streak: number;              // Daily streak count
  lastActiveDate: string;      // For streak calculation
  badges: Badge[];             // Earned badges array
  snapsCount: number;          // For Village Scientist badge trigger
  experimentsCount: number;    // For Kitchen Chemist badge trigger

  // Cross-screen data (ephemeral per flow)
  capturedImage: string | null;        // Snap & Learn photo
  snapLearnResult: SnapLearnResult | null; // AI lesson data
  homeworkImage: string | null;        // Homework photo
  homeworkResult: HomeworkResult | null;   // AI solution data
  diyExperiment: DIYExperiment | null; // AI experiment data
}
```

### Exported Utilities

| Utility | Purpose |
|---------|---------|
| `loadState()` | Read from localStorage, merge with defaults |
| `saveState(partial)` | Merge partial state and write to localStorage |
| `clearState()` | Delete all stored data (used by profile reset) |
| `addXP(amount)` | Add XP, recalculate level, save |
| `updateStreak()` | Increment/reset daily streak |
| `checkAndUnlockBadges()` | Check all triggers and unlock new badges |
| `getLevelFromXP(xp)` | Map XP total → level number (1–5) |
| `getXPToNextLevel(xp)` | Return `{current, needed, levelXP}` for progress bar |

---

## 🏆 Gamification System

### XP System
| Activity | XP Earned |
|----------|-----------|
| Snap & Learn photo | +50 XP |
| DIY Experiment completed | +150 XP |
| Live Learning discovery | +5 XP per object |

### Levels
| Level | Name | XP Required |
|-------|------|-------------|
| 1 | Curious Learner | 0 |
| 2 | Village Explorer | 1,000 |
| 3 | Junior Scientist | 2,500 |
| 4 | Senior Scientist | 5,000 |
| 5 | SnapLearn Master | 10,000 |

### Badges
| Badge | Condition | Emoji |
|-------|-----------|-------|
| Pehli Nazar | First snap ever | 👀 |
| Village Scientist | 5 objects photographed | 🌿 |
| Kitchen Chemist | First DIY experiment | 🧪 |
| Week Warrior | 7 day streak | 🔥 |

---

## 🗺️ Navigation Flow

```
welcome
  └→ class-select
      └→ subject-select
          └→ profile-setup
              └→ home ←─────────────────────────────────────────────┐
                  ├→ chat                                            │
                  ├→ camera → processing → analysis → success → (home)
                  ├→ diy-picker → diy-scan → diy-step → success → (home)
                  ├→ homework-capture → processing → homework-solution → deep-explain
                  ├→ live-learning
                  ├→ exam-predictor
                  ├→ discovery-challenge → discovery-processing → discovery-reveal ─┘
                  └→ profile → (reset → welcome)
```

```
home
  ├→ discovery-challenge → discovery-processing → discovery-reveal → (home or retry)
```

All navigation managed in `src/App.tsx` via `Screen` union type and a `renderScreen()` switch statement.

---

## ☁️ AWS Deployment Guide

### Full Architecture

```
📱 React App (AWS Amplify)
      │
      ├──── POST /api/bedrock ──→ API Gateway ──→ Lambda: snaplearn-bedrock ──→ AWS Bedrock
      ├──── POST /api/polly ────→ API Gateway ──→ Lambda: snaplearn-polly ───→ AWS Polly
      ├──── Images ────────────→ Amazon S3
      └──── User data ──────────→ Amazon DynamoDB
```

### Required AWS Services

| Service | Region | Purpose |
|---------|--------|---------|
| AWS Amplify | ap-south-1 | Host React frontend |
| API Gateway | us-east-1 | Route /api/* to Lambda |
| Lambda: bedrock | us-east-1 | Claude Sonnet 4.5 proxy |
| Lambda: polly | us-east-1 | Kajal TTS proxy |
| AWS Bedrock | us-east-1 | Claude Sonnet 4.5 model |
| AWS Polly | us-east-1 | Kajal neural voice |
| S3 | ap-south-1 | Image storage (optional) |
| DynamoDB | ap-south-1 | User progress (optional) |

### IAM Role for Lambda (SnapLearnLambdaRole)
Attach these policies:
- `AmazonBedrockFullAccess`
- `AmazonPollyFullAccess`
- `AmazonS3FullAccess` (if using S3)
- `AmazonDynamoDBFullAccess` (if using DynamoDB)

### Deployment Steps

1. **Deploy Lambda functions** — zip `lambda/bedrock.mjs` + `node_modules/`, upload to Lambda (Node.js 22.x, 30s timeout)
2. **Create API Gateway** — HTTP API, routes `POST /api/bedrock` + `POST /api/polly` → respective Lambdas. Enable CORS. Add binary media type `audio/mpeg`.
3. **Build frontend** — `npm run build`, deploy `/dist` to Amplify
4. Set `VITE_API_BASE_URL` in Amplify env vars to your API Gateway URL

---

## 🏗️ What Was Built (Session Log)

### Session 1 — Initial Planning
- Reviewed `SNAPLEARN_MASTER_GUIDE.md`
- Assessed existing codebase state
- Identified: UI shells existed but zero real AI integration

### Session 2 — Full Implementation (Gemini Phase)
**Created from scratch:**
- `src/store/appStore.ts` — Complete state management with gamification
- `src/services/snaplearnAI.ts` — All 6 AI functions with full prompt engineering (Gemini)
- `src/components/LiveLearningScreen.tsx` — NEW screen
- `src/components/ExamPredictorScreen.tsx` — NEW screen
- `src/components/ProfileScreen.tsx` — NEW screen

**Completely rewritten:**
- `src/App.tsx`, `src/types.ts`, `src/components/HomeScreen.tsx`
- `src/components/CameraScreen.tsx`, `ProcessingScreen.tsx`, `AnalysisScreen.tsx`
- `src/components/ChatScreen.tsx`, `HomeworkCaptureScreen.tsx`, `HomeworkSolutionScreen.tsx`
- `src/components/DIYPickerScreen.tsx`, `DIYScanScreen.tsx`, `DIYStepScreen.tsx`
- `src/components/SuccessScreen.tsx`, `src/index.css`, `.env`

### Session 3 — AWS Migration (Current)
**Why:** Hackathon is "AI for Bharat — Powered by AWS". Using Gemini would lose points with AWS judges.

**Security fix:**
- Removed all `VITE_GEMINI_API_KEY` and direct browser→AWS calls
- Implemented the serverless proxy pattern (browser → `/api/*` → Lambda → AWS)

**Created:**
- `netlify/functions/bedrock.js` — Local dev proxy for Bedrock
- `netlify/functions/polly.js` — Local dev proxy for Polly (Kajal voice)
- `lambda/bedrock.mjs` — Production AWS Lambda handler for Bedrock
- `lambda/polly.mjs` — Production AWS Lambda handler for Polly
- `netlify.toml` — Netlify config with `/api/*` redirect + SPA fallback

**Modified:**
- `src/services/snaplearnAI.ts` — **Fully rewritten**: removed all Gemini SDK, all calls now go to `/api/bedrock` and `/api/polly`. Added `synthesizeSpeech()` for Polly TTS.
- `vite.config.ts` — Added dev server proxy `/api/*` → `localhost:8888`, removed Gemini key define
- `.env` — Updated to correct values: region `us-east-1`, full model ID `anthropic.claude-sonnet-4-5-20250514-v1:0`, removed Gemini/Azure vars
- `package.json` — Added `@aws-sdk/client-polly`

### Session 4 — Discovery Challenge Feature

**New screens (created from scratch):**
- `src/components/DiscoveryChallengeScreen.tsx` — Pre-start splash → 3-min countdown timer → 5-photo collector with flash animation, thumbnail strip, motivational messages, gallery fallback
- `src/components/DiscoveryProcessingScreen.tsx` — Animated orb with rotating step messages while AI analyzes all 5 photos
- `src/components/DiscoveryRevealScreen.tsx` — Confetti reveal, connected photo gallery, connection explanation card, insight cards, interactive multi-choice quiz, Share + retry actions

**New AI function:**
- `analyzeDiscoveryChallenge(photos: string[])` in `snaplearnAI.ts` — sends all 5 photos to AWS Bedrock in a single multi-image Claude call using the `extraImages[]` field to pass photos 2–5

**Updated files:**
- `netlify/functions/bedrock.js` — Added `extraImages[]` support so multiple images can be passed in a single Bedrock call
- `src/types.ts` — Added `discovery-challenge`, `discovery-processing`, `discovery-reveal` to the `Screen` union
- `src/components/HomeScreen.tsx` — Added pulsing blue/purple hero card at the top with ⚡ NEW badge and +200 XP label
- `src/App.tsx` — Added `discoveryPhotos` + `discoveryAnalysis` state, `handleDiscoveryStart()` async handler (navigates to processing, calls AI, awards 200 XP, navigates to reveal), 3 new switch cases
- `WORKSPACE.md` — Updated to reflect all changes

### Session 4b — Discovery Challenge Intro Reframe

**Goal:** Shift framing from "game" to "revolutionary educational innovation" to make the value proposition immediately clear to both rural students and hackathon judges.

**Changed:** `src/components/DiscoveryChallengeScreen.tsx` — intro splash only (camera mechanics unchanged)

| Before | After |
|--------|-------|
| Headline: "Discovery Challenge" | Headline: **"Learn From YOUR World"** |
| Subtext: "Photo 5 objects in 3 minutes" | Subtext: "Rural textbooks show city examples you've never seen…" |
| Gamey 🏆 XP badge emphasis | Educational 3-step how-it-works flow |
| Single CTA: "Start Challenge →" | Primary CTA: **"Start Learning From My World →"** |
| No problem framing | Side-by-side Textbook vs SnapLearn comparison cards |
| No social proof | Testimonial: *"Finally, science makes sense!" — Priya, Class 9, Bihar* |
| Missing impact statement | **"No labs. No expensive equipment. Your village IS your classroom."** |


---

## ✅ Demo Day Checklist

### App Features to Demo
- [ ] **Onboarding Flow**: Welcome → Class → Subjects → Profile → Home
- [ ] **Discovery Challenge** ⭐ — Photo 5 objects → AI reveals connections → quiz
- [ ] **Snap & Learn**: Photo a plant/object → show 4-subject lesson + quiz
- [ ] **Chat**: Ask "photosynthesis kya hai?" in Hinglish
- [ ] **Voice Chat**: Use mic button, speak Hindi → AI responds
- [ ] **DIY Mode**: Select pH Indicator → scan kitchen → follow 4 steps
- [ ] **Homework Helper**: Photo a textbook question → see guided steps
- [ ] **Live Learning**: Walk around room → AI narrates everything
- [ ] **Exam Predictor**: Select Science → see ranked prediction list
- [ ] **Profile**: Show XP progress, earned badges, streak

### Before Demo (Local)
1. Add AWS credentials to `.env`
2. Run `npx netlify dev` (starts Vite + Lambda functions together)
3. Grant camera + microphone permissions in browser
4. Complete onboarding once (saves to localStorage)

### Before Demo (Production — AWS)
1. Deploy `lambda/bedrock.mjs` + `lambda/polly.mjs` to AWS Lambda
2. Create API Gateway with routes for both functions
3. Deploy React app to AWS Amplify
4. Set `VITE_API_BASE_URL` env var in Amplify to your API Gateway URL

### Key USPs to Highlight to Judges
1. **Full AWS stack** — Amplify + Lambda + API Gateway + Bedrock + Polly + S3 + DynamoDB
2. **"Yaar" personality** — Not a teacher, a friend. Hinglish. Rural examples.
3. **No lab needed** — Kitchen as a chemistry lab
4. **Secure by design** — AWS credentials never touch the browser
5. **Progressive Homework UI** — Steps unlock one by one, answer requires "I tried"

---

## 🔐 Security Notes

- **Never prefix AWS keys with `VITE_`** — Vite embeds `VITE_*` vars into public JS bundles
- `.env` is in `.gitignore` — never commit it
- For production, use an **IAM Role** on Lambda (no hard-coded credentials at all)
- API Gateway CORS is restricted to your Amplify domain in production

---

*Built with ❤️ for AI for Bharat — Powered by AWS Hackathon 2025*
*Target: 156 million rural Indian students — Class 6–12*
