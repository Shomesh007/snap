# SnapLearn — Complete AWS Architecture & Features Guide
### AI for Bharat Hackathon 2025 · Team #1125 · Gurusabarivasan M

---

## Table of Contents
1. [App Overview](#1-app-overview)
2. [All Features](#2-all-features)
3. [AWS Services Used](#3-aws-services-used)
4. [Complete Workflow & Architecture](#4-complete-workflow--architecture)
5. [AWS Service Deep Dives](#5-aws-service-deep-dives)
6. [Security Architecture](#6-security-architecture)
7. [Local Dev vs Production](#7-local-dev-vs-production)

---

## 1. App Overview

**SnapLearn** is an AI-powered learning app for Indian students (Class 6–12) that turns everyday objects into interactive science lessons. It speaks Hinglish, follows the NCERT curriculum, and runs on AWS.

**Target Users:** Rural/urban Indian students with smartphones  
**Core Idea:** Point your camera at anything → get a science lesson from your "AI best friend"

---

## 2. All Features

### 🏠 Onboarding Flow
| Screen | File | What it does |
|--------|------|-------------|
| Welcome Screen | `WelcomeScreen.tsx` | First-launch splash, starts onboarding |
| Class Select | `ClassSelectScreen.tsx` | Student picks their grade (6–12) |
| Subject Select | `SubjectSelectScreen.tsx` | Student picks their subjects |
| Profile Setup | `ProfileSetupScreen.tsx` | Name + location (Village/Town/City) |

---

### 📸 Mode 1 — Snap & Learn (Core Feature)
**Flow:** `HomeScreen → CameraScreen → ProcessingScreen → AnalysisScreen`

| Screen | File | What it does |
|--------|------|-------------|
| Camera Screen | `CameraScreen.tsx` | Opens device camera, captures photo |
| Processing Screen | `ProcessingScreen.tsx` | Shows loading animation while AI runs |
| Analysis Screen | `AnalysisScreen.tsx` | Displays lesson with 4 subject tabs |

**How it works:**
1. Student snaps a photo of any object (leaf, phone, rust, candle flame, etc.)
2. Image is compressed to 800px wide at 70% JPEG quality (cuts payload ~80%)
3. Image + prompt sent to **AWS Bedrock** via `/api/bedrock`
4. Bedrock (Amazon Nova Lite) analyzes the image and returns a JSON lesson
5. Lesson displayed in 4 tabs: Biology, Chemistry, Physics, Local Context
6. Includes a quiz question + "next challenge" suggestion
7. XP and badges awarded for each snap

**Example Output:**
```
Object detected: Mobile Phone 📱
├── Biology tab: How touchscreen detects living skin's electrical charge
├── Chemistry tab: Lithium battery — lightest metal in the world
├── Physics tab: Why phone heats up during gaming (Joule's law)
└── Local Context: 750 million smartphones in India
```

---

### 🔧 Mode 2 — DIY Experiments
**Flow:** `HomeScreen → DIYPickerScreen → DIYScanScreen → DIYStepScreen → SuccessScreen`

| Screen | File | What it does |
|--------|------|-------------|
| DIY Picker | `DIYPickerScreen.tsx` | Student picks an experiment type |
| DIY Scan | `DIYScanScreen.tsx` | Camera scans available household items |
| DIY Step | `DIYStepScreen.tsx` | Step-by-step experiment instructions |
| Success Screen | `SuccessScreen.tsx` | Celebration + XP reward |

**How it works:**
1. Student points camera at their desk/kitchen
2. **Amazon Rekognition** detects objects (detects labels with 70%+ confidence, top 5)
3. Detected items sent to **AWS Bedrock** to generate a matching DIY experiment
4. AI generates step-by-step instructions using only those available items
5. Each step connects to an NCERT chapter

---

### 📝 Mode 3 — Homework Helper
**Flow:** `HomeScreen → HomeworkCaptureScreen → HomeworkSolutionScreen → DeepExplainScreen`

| Screen | File | What it does |
|--------|------|-------------|
| Homework Capture | `HomeworkCaptureScreen.tsx` | Photos the homework question |
| Homework Solution | `HomeworkSolutionScreen.tsx` | Shows step-by-step hints (NOT answers) |
| Deep Explain | `DeepExplainScreen.tsx` | Expanded concept explanation |

**How it works:**
1. Student photographs their homework question
2. Image sent to **AWS Bedrock** which performs OCR + understands the problem
3. Returns progressive hints (not direct answers) to build understanding
4. Each hint reveals a concept, not the solution
5. "Deep Explain" button calls Bedrock again for a full conceptual breakdown
6. Links hints to specific NCERT chapters

---

### 🎙️ Mode 4 — Kuch Bhi Pocho (Ask Anything / Voice Chat)
**Flow:** `HomeScreen → KuchBhiPochoScreen`

| Screen | File | What it does |
|--------|------|-------------|
| Kuch Bhi Pocho | `KuchBhiPochoScreen.tsx` | Free-form voice/text Q&A with AI |
| Voice Overlay | `VoiceOverlay.tsx` | Animated microphone UI during speech |

**How it works:**
1. Student types or speaks any question in Hindi or English
2. Language auto-detected (Devanagari Unicode detection — if >20% chars are Devanagari → Hindi)
3. Question sent to **AWS Bedrock** as a conversational prompt
4. AI responds in Hinglish as a best-friend persona
5. Response is spoken aloud using **Amazon Polly** (Kajal neural voice, Hindi)
6. Audio streamed back as MP3 and played in browser

---

### 🔬 Mode 5 — Discovery Challenge
**Flow:** `HomeScreen → DiscoveryChallengeScreen → DiscoveryProcessingScreen → DiscoveryRevealScreen`

| Screen | File | What it does |
|--------|------|-------------|
| Discovery Challenge | `DiscoveryChallengeScreen.tsx` | Challenges student to photograph a specific concept |
| Discovery Processing | `DiscoveryProcessingScreen.tsx` | Multi-photo processing animation |
| Discovery Reveal | `DiscoveryRevealScreen.tsx` | Reveals findings + concept explanation |

**How it works:**
1. AI gives a weekly discovery challenge ("Find something that rusts!")
2. Student captures up to 5 photos across different days
3. All photos batched and sent to **AWS Bedrock** (multi-image analysis)
4. AI compares photos and identifies change/pattern (rust progression, plant growth, etc.)
5. Reveals the hidden science concept behind what they observed

---

### 📺 Mode 6 — Live Learning
**Flow:** `HomeScreen → LiveLearningScreen`

| Screen | File | What it does |
|--------|------|-------------|
| Live Learning | `LiveLearningScreen.tsx` | Real-time frame-by-frame camera analysis |

**How it works:**
1. Student holds camera in front of a scene
2. Frames captured periodically and sent to **AWS Bedrock**
3. AI narrates what it sees in real-time in Hinglish
4. Designed for science demonstrations, experiments, nature observation

---

### 📊 Mode 7 — Exam Predictor
**Flow:** `HomeScreen → ExamPredictorScreen`

| Screen | File | What it does |
|--------|------|-------------|
| Exam Predictor | `ExamPredictorScreen.tsx` | Predicts likely exam questions based on chapter |

**How it works:**
1. Student selects class, subject, chapter
2. Request sent to **AWS Bedrock** to predict high-probability exam questions
3. AI analyzes past NCERT patterns and generates questions with explanations
4. Questions ranked by predicted probability

---

### 👤 Profile & Gamification
| Screen | File | What it does |
|--------|------|-------------|
| Profile Screen | `ProfileScreen.tsx` | Shows XP, level, streak, badges |

**Gamification system (localStorage based):**
- **XP Points** — earned per snap, homework, challenge
- **Levels** — calculated from total XP
- **Streak** — daily activity tracking
- **Badges** — unlocked on milestones (first snap, 10 snaps, etc.)
- **Counters** — snapsCount, experimentsCount
- State persisted via `localStorage` using `appStore.ts`

---

## 3. AWS Services Used

### ✅ Services Currently Implemented & Active

| Service | Status | Where Used |
|---------|--------|-----------|
| **AWS Lambda** | ✅ Implemented | `lambda/bedrock.mjs`, `lambda/polly.mjs` |
| **Amazon Bedrock** | ✅ Implemented | All AI analysis (core brain of the app) |
| **Amazon Polly** | ✅ Implemented | Hindi TTS for Kuch Bhi Pocho voice feature |
| **Amazon Rekognition** | ✅ Implemented | Object detection in DIY mode |
| **Amazon API Gateway** | ✅ Designed | Routes `/api/bedrock` and `/api/polly` to Lambda |

### 📐 Services Designed / Planned in Architecture

| Service | Status | Where Designed |
|---------|--------|---------------|
| **Amazon DynamoDB** | 📐 Planned | User progress, XP, badges, sessions |
| **Amazon S3** | 📐 Planned | Image storage, cached AI lessons |
| **AWS Amplify** | 📐 Planned | Frontend hosting + CI/CD deployment |
| **Amazon EC2** | 📐 Planned | Alternative backend hosting (vs Lambda) |
| **Amazon ECS** | 📐 Planned | Container-based backend option |
| **AWS Cognito** | 📐 Planned | Auth (anonymous + social login) |
| **AWS CloudFront** | 📐 Planned | CDN for fast content delivery across India |
| **AWS Transcribe** | 📐 Planned | Hindi speech-to-text (currently uses browser STT) |
| **AWS CloudWatch** | 📐 Planned | Logs and monitoring |

---

## 4. Complete Workflow & Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         STUDENT (Browser)                        │
│                    React + Vite SPA (TypeScript)                 │
└────────────────────────────┬─────────────────────────────────────┘
                             │  fetch('/api/bedrock')
                             │  fetch('/api/polly')
                             │  fetch('/api/rekognition')
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      PROXY / API LAYER                           │
│                                                                  │
│  Local Dev:        Netlify Dev:         Production:              │
│  server.js         netlify/functions/   AWS API Gateway          │
│  (Express on       bedrock.js           + AWS Lambda             │
│   port 4000)       polly.js             (lambda/*.mjs)           │
│                                                                  │
│  Vite proxy → http://localhost:4000                              │
│  netlify.toml → /.netlify/functions/:splat                       │
└──────────┬────────────────────────────────────────────┬──────────┘
           │                                            │
           ▼                                            ▼
┌─────────────────────────┐              ┌──────────────────────────┐
│   Amazon Bedrock        │              │   Amazon Polly           │
│   (Nova Lite model)     │              │   Kajal neural voice     │
│   us-east-1             │              │   hi-IN (Hindi)          │
│                         │              │   OutputFormat: mp3      │
│   Used for:             │              │                          │
│   • Image analysis      │              │   Used for:              │
│   • Lesson generation   │              │   • Speaking lessons     │
│   • Homework help       │              │   • Reading AI replies   │
│   • DIY planning        │              │   • Voice feedback       │
│   • Discovery challenge │              └──────────────────────────┘
│   • Exam prediction     │
│   • Voice Q&A           │              ┌──────────────────────────┐
└─────────────────────────┘              │   Amazon Rekognition     │
                                         │   DetectLabels API       │
                                         │   MaxLabels: 5           │
                                         │   MinConfidence: 70%     │
                                         │                          │
                                         │   Used for:              │
                                         │   • DIY item detection   │
                                         │   • Backup object detect │
                                         └──────────────────────────┘

PLANNED ADDITIONS:
┌─────────────────────────┐   ┌────────────────────┐   ┌──────────┐
│   Amazon DynamoDB       │   │   Amazon S3        │   │ Amplify  │
│   • User profiles       │   │   • Image cache    │   │ • Hosting│
│   • XP / badges         │   │   • Lesson cache   │   │ • CI/CD  │
│   • Streaks             │   │   • Static assets  │   │ • Env    │
│   • Sessions            │   └────────────────────┘   └──────────┘
└─────────────────────────┘
```

---

## 5. AWS Service Deep Dives

---

### 🧠 Amazon Bedrock (Nova Lite)
**Files:** `lambda/bedrock.mjs`, `netlify/functions/bedrock.js`, `server.js`, `src/services/snaplearnAI.ts`

**Model:** `us.amazon.nova-lite-v1:0` (default), originally designed for `anthropic.claude-sonnet-4-5-20250514-v1:0`
**Region:** `us-east-1`

**What it does:**
- The entire AI brain of SnapLearn
- Handles both image understanding AND text generation in one call
- Receives base64-encoded compressed image + structured prompt
- Returns JSON with lessons, quiz, friend greeting, next challenge

**How a request flows:**

```
1. Student takes photo
   ↓
2. compressImage() — scales to 800px, 70% JPEG quality (~80% smaller)
   ↓
3. callBedrock({ prompt, imageBase64, systemPrompt, maxTokens })
   ↓
4. fetch('/api/bedrock') — goes to proxy (Lambda in prod)
   ↓
5. Lambda: BedrockRuntimeClient.send(InvokeModelCommand)
   Body: { inferenceConfig, system, messages: [{ role: 'user', content: [{ text: prompt }] }] }
   ↓
6. Bedrock returns: output.message.content[0].text (raw text)
   ↓
7. Lambda tries JSON.parse() → falls back to regex match /\{[\s\S]*\}/
   ↓
8. Returns { text, parsed } to frontend
   ↓
9. Frontend renders lesson tabs
```

**Prompts used per feature:**
| Feature | Bedrock Call | Max Tokens |
|---------|-------------|-----------|
| Snap & Learn | Image + personality prompt | 1500 |
| Homework Helper | Image (OCR) + step-hint prompt | 1500 |
| Kuch Bhi Pocho | Text Q&A + personality prompt | 1500 |
| DIY Mode | Text (detected items) + experiment prompt | 1500 |
| Discovery Challenge | Multi-image + comparison prompt | 1500 |
| Exam Predictor | Text (chapter info) + prediction prompt | 1500 |

**AI Personality System:**
- All prompts include a `buildPersonality(profile)` system prompt
- Persona: "AI best friend who speaks Hinglish"
- Uses student's name, grade, and location to personalize
- Examples: "BHAI RUK—", "Arre yaar!", "DEKHA?? Main bol raha tha na!!"
- Connected to NCERT Class 9/10/11/12 chapters

**CORS Headers set by Lambda:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Methods: POST, OPTIONS
```

---

### 🔊 Amazon Polly (Kajal Neural Voice)
**Files:** `lambda/polly.mjs`, `netlify/functions/polly.js`, `server.js`

**Voice:** `Kajal` — AWS's premium Hindi neural voice
**Region:** `us-east-1` (Kajal is ONLY available in us-east-1)
**Engine:** `neural` (higher quality than standard)
**Language:** `hi-IN`
**Output:** `audio/mpeg` (MP3)

**What it does:**
- Converts AI-generated text into spoken Hindi audio
- Used in Kuch Bhi Pocho screen to speak AI responses
- The browser plays the MP3 audio blob directly

**How a request flows:**

```
1. AI generates a Hinglish response text
   ↓
2. fetch('/api/polly', { text, voiceId: 'Kajal', languageCode: 'hi-IN' })
   ↓
3. Lambda: PollyClient.send(SynthesizeSpeechCommand)
   { Text, OutputFormat: 'mp3', VoiceId: 'Kajal', LanguageCode: 'hi-IN', Engine: 'neural' }
   ↓
4. Polly streams back AudioStream (async iteratable chunks)
   ↓
5. Lambda collects all chunks → Buffer.concat(chunks)
   ↓
6. Returns raw audio/mpeg binary (not JSON)
   ↓
7. Frontend creates Blob URL → new Audio(url).play()
```

**Text limit:** 6000 characters (server.js enforces `.slice(0, 6000)`)  
**API Gateway note:** Binary media type `audio/mpeg` must be added in API Gateway settings for base64 passthrough to work

---

### 👁️ Amazon Rekognition
**Files:** `server.js` (route: `POST /api/rekognition`)

**API:** `DetectLabelsCommand`  
**Region:** `us-east-1`

**What it does:**
- Detects objects in photos for the DIY Experiment feature
- Returns top 5 labels with 70%+ confidence
- Output fed into Bedrock to generate a relevant experiment

**How a request flows:**

```
1. Student scans their desk/kitchen in DIYScanScreen
   ↓
2. fetch('/api/rekognition', { imageBase64 })
   ↓
3. server.js: strips data: prefix → Buffer.from(base64Data, 'base64')
   ↓
4. RekognitionClient.send(DetectLabelsCommand)
   { Image: { Bytes: imageBuffer }, MaxLabels: 5, MinConfidence: 70 }
   ↓
5. Returns top 3 labels as detectedObjects string
   ↓
6. detectedObjects string passed to Bedrock
   "I have these items: bottle, salt, vinegar. Generate an experiment."
   ↓
7. Bedrock generates step-by-step DIY experiment
   ↓
8. Displayed in DIYStepScreen
```

**Fallback:** If Rekognition fails, returns `{ detectedObjects: null, source: 'fallback' }` so the app can still ask Bedrock to generate a generic experiment.

---

### ⚡ AWS Lambda
**Files:** `lambda/bedrock.mjs`, `lambda/polly.mjs`

**Runtime:** Node.js (ES Modules — `.mjs`)
**Architecture:** Lambda Proxy Integration with API Gateway

**What it does:**
- Hosts the secure backend that holds AWS credentials
- Keeps `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` server-side
- Never exposed to the browser (prevents credential theft)

**Two Lambda functions:**

#### `lambda/bedrock.mjs` — Bedrock Proxy
```
Trigger: POST /api/bedrock via API Gateway
Handler: exports.handler
Env vars needed:
  - BEDROCK_MODEL_ID (default: us.amazon.nova-lite-v1:0)
  - AWS credentials (or IAM execution role — preferred)

Input: { prompt, systemPrompt, maxTokens }
Output: { text: string, parsed: object | null }
```

#### `lambda/polly.mjs` — Polly TTS Proxy  
```
Trigger: POST /api/polly via API Gateway
Handler: exports.handler
Env vars needed:
  - AWS credentials (or IAM execution role)

Input: { text, voiceId, languageCode }
Output: audio/mpeg binary stream
API Gateway: Binary media type 'audio/mpeg' must be enabled
```

**IAM Best Practice used in code:**
```javascript
// Preferred: IAM execution role (no hard-coded keys)
const client = new BedrockRuntimeClient({ region: "us-east-1" });
// Credentials picked up automatically from Lambda's execution role
```

**CORS handling:**
Both Lambda functions handle `OPTIONS` preflight requests and return CORS headers on every response.

---

### 🌐 Amazon API Gateway
**Designed for Production:**

```
POST /api/bedrock  → Lambda (bedrock.mjs)
POST /api/polly    → Lambda (polly.mjs)

Integration type: Lambda Proxy
Binary media types: audio/mpeg (for Polly)
```

**How the frontend knows which URL to use:**
```typescript
// src/services/snaplearnAI.ts
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? '';

// Empty string in local dev (Vite proxy handles it)
// Full API Gateway URL in production (set in Amplify env vars)
fetch(`${API_BASE}/api/bedrock`, ...)
```

---

### 🗄️ Amazon DynamoDB (Planned)
**Designed in architecture, not yet implemented in code.**  
Currently replaced by `localStorage` via `appStore.ts`.

**Tables planned:**

| Table | Partition Key | Data |
|-------|--------------|------|
| `users` | `userId` | profile, grade, location |
| `progress` | `userId` | XP, level, streak, badges |
| `sessions` | `sessionId` | conversation history |
| `lessons_cache` | `imageHash` | cached Bedrock responses |

**Why it's needed:**
- `localStorage` is lost if student clears browser
- DynamoDB would persist progress across devices
- Enables leaderboards across school/district

---

### 🪣 Amazon S3 (Planned)
**Designed in architecture, not yet implemented in code.**

**Buckets planned:**

| Bucket | Contents |
|--------|---------|
| `snaplearn-images` | Student-captured images |
| `snaplearn-lessons` | Cached AI lesson JSON (avoid re-calling Bedrock) |
| `snaplearn-static` | Static assets, icons, offline content |
| `snaplearn-audio` | Cached Polly MP3s for common phrases |

**Why it's needed:**
- Cache lesson results: same object photographed → return cached lesson instantly
- Reduces Bedrock API costs dramatically
- Offline lesson packs stored as static JSON

---

### 🚀 AWS Amplify (Planned for Production)
**Designed in architecture, documented in `SNAPLEARN_MASTER_GUIDE.md`.**

**Role:**
- Hosts the React frontend (Vite build → `dist/` folder)
- CI/CD: push to GitHub → auto-deploy
- Environment variable management (`VITE_API_BASE_URL`)
- Custom domain support

**Configured in:**
- `netlify.toml` — currently used for Netlify (same concept, different platform)
- `vite.config.ts` — `VITE_API_BASE_URL` env var read for API base

**Build command:** `npm run build`  
**Publish directory:** `dist`

---

### 🖥️ Amazon EC2 (Alternative Backend)
**Designed as an alternative to Lambda for the `server.js` Express backend.**

**Use case:**
- Run `server.js` (Express app) as a persistent server
- More cost-effective if request volume is consistently high
- Same API surface as Lambda (`/api/bedrock`, `/api/polly`, `/api/rekognition`)

**The `server.js` file is already EC2-ready:**
```javascript
app.listen(PORT, () => { ... })  // Binds to port 4000
```

**Recommended EC2 type:** `t3.micro` (free tier eligible)

---

### 🐳 Amazon ECS (Container Option)
**Designed as a containerized deployment option.**

**Use case:**
- Containerize `server.js` with a `Dockerfile`
- Deploy to ECS Fargate (serverless containers)
- Better for auto-scaling under hackathon demo load

**Why ECS over Lambda:**
- Lambda has 15-minute timeout (fine for this app)
- ECS better for long-running WebSocket connections (Live Learning feature)
- ECS allows bundling all routes in one container

---

## 6. Security Architecture

### The Proxy Pattern (Why it exists)

```
❌ INSECURE (what we DON'T do):
Browser → AWS Bedrock directly
Problem: AWS_SECRET_ACCESS_KEY visible in JS bundle
Anyone can: Open DevTools → Sources → search "VITE_AWS" → steal keys

✅ SECURE (what we DO):
Browser → /api/bedrock (our own server) → AWS Bedrock
AWS credentials only live on the server (Lambda / server.js)
```

### Security measures implemented:
1. **No credentials in frontend code** — zero AWS keys in `src/`
2. **IAM execution roles** — Lambda uses attached IAM role, no hard-coded keys
3. **Input sanitization** — `sanitizeInput()` trims and caps input at 2000 chars
4. **Image size limits** — express set to `50mb` max body, images compressed before send
5. **CORS locked** — only `localhost` origins allowed in local dev server
6. **Text size limits** — Polly capped at 6000 chars, Bedrock tokens capped at 1500

---

## 7. Local Dev vs Production

### Environment Modes

| Mode | Command | API Calls go to |
|------|---------|----------------|
| **Local Dev (AWS)** | `node server.js` + `npm run dev` | `localhost:4000` (Express) |
| **Local Dev (Netlify)** | `netlify dev` | `/.netlify/functions/*` |
| **Production (AWS)** | Deploy Lambda | API Gateway URL |
| **Production (Netlify)** | `git push` | Netlify Functions |

### Vite Proxy Config (`vite.config.ts`):
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:4000',  // Forwards to server.js
    changeOrigin: true,
  }
}
```

### Netlify Rewrite (`netlify.toml`):
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Production (`VITE_API_BASE_URL` env var):
```
VITE_API_BASE_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod
```
Set in: Amplify Console → Environment Variables OR `.env.production`

---

## 8. AWS SDK Packages Used

```json
{
  "@aws-sdk/client-bedrock-runtime": "^3.1000.0",
  "@aws-sdk/client-polly": "^3.1000.0",
  "@aws-sdk/client-rekognition": "^3.1000.0"
}
```

All three are in `package.json` `dependencies` (not devDependencies) because `server.js` uses them at runtime.

---

## 9. Feature ↔ AWS Service Map

```
FEATURE                   AWS SERVICES USED
──────────────────────────────────────────────────────────────────
Snap & Learn         →    Bedrock (image + text)
                          Lambda + API Gateway (proxy)
                          S3 (planned: lesson cache)

Homework Helper      →    Bedrock (OCR + hint generation)
                          Lambda + API Gateway

Kuch Bhi Pocho       →    Bedrock (conversational AI)
                          Polly (Kajal voice TTS)
                          Lambda + API Gateway

DIY Mode             →    Rekognition (object detection)
                          Bedrock (experiment generation)
                          Lambda + API Gateway

Discovery Challenge  →    Bedrock (multi-image analysis)
                          S3 (planned: photo storage)
                          Lambda + API Gateway

Live Learning        →    Bedrock (frame analysis)
                          Lambda + API Gateway

Exam Predictor       →    Bedrock (question prediction)
                          Lambda + API Gateway

User Progress        →    localStorage (current)
                          DynamoDB (planned: persistence)

Authentication       →    None (current)
                          Cognito (planned: anonymous + social)

Hosting              →    Netlify (current)
                          Amplify (planned: AWS-native)
```

---

## 10. Cost Snapshot (AWS Free Tier Breakdown)

| Service | Free Tier | SnapLearn Usage |
|---------|-----------|----------------|
| Lambda | 1M req/month | ~100 req/day in demo = FREE |
| Bedrock Nova Lite | Pay per token | ~$0.0002/image analysis |
| Polly Neural | 1M chars/month | ~500 chars/response = FREE |
| Rekognition | 1000 images/month | DIY scans only = FREE |
| API Gateway | 1M calls/month | = FREE |
| S3 | 5GB storage | = FREE |
| DynamoDB | 25GB + 25 RCU/WCU | = FREE |

**Estimated demo day cost:** < $1 for 100 students using the app

---

*Last updated: March 2026 | SnapLearn v1.0 | AWS AI for Bharat Hackathon*
