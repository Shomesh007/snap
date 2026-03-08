# SnapLearn — Pure AWS Setup Guide
> Zero Netlify. Zero third-party hosting. 100% AWS.

---

## Architecture (What You're Building)

```
Local Dev:
  Browser (localhost:3000)
       ↓ /api/*
  Express server.js (localhost:4000)  ← same code as Lambda
       ↓
  AWS Bedrock / Polly (cloud API calls)

Production:
  Browser (Amplify URL)
       ↓ /api/*
  Amazon API Gateway
       ↓
  AWS Lambda (bedrock + polly functions)
       ↓
  AWS Bedrock / Polly
```

---

## STEP 1 — AWS Account + IAM User

1. Go to **[aws.amazon.com](https://aws.amazon.com)** → Create account
2. In AWS Console → search **"IAM"** → Open IAM
3. Left sidebar → **Users** → **Create user**
   - Username: `snaplearn-dev`
4. **Next** → **Attach policies directly** → add both:
   - `AmazonBedrockFullAccess`
   - `AmazonPollyFullAccess`
5. **Create user** → click the user → **Security credentials** tab
6. **Create access key** → Use case: **Local code** → **Create**
7. **SAVE BOTH** — `Access Key ID` and `Secret Access Key` (shown only once!)

---

## STEP 2 — Enable Bedrock Model Access

> ⚠️ REQUIRED — Claude is NOT available by default

1. AWS Console → search **"Bedrock"** → Open it
2. **Top-right: Make sure region = `us-east-1`** (N. Virginia)
3. Left sidebar → **Model access** → **Modify model access**
4. Find **"Claude Sonnet"** (Anthropic) → check ✅ it
5. **Submit** → wait 1–5 mins for **"Access granted"** status

---

## STEP 3 — Fill in `.env`

Open `.env` in the project root:

```env
AWS_ACCESS_KEY_ID=AKIA...your key...
AWS_SECRET_ACCESS_KEY=...your secret...
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-5-20250514-v1:0
POLLY_VOICE_ID=Kajal
POLLY_LANGUAGE_CODE=hi-IN
```

> 🔑 `.env` is in `.gitignore` — never commit it

---

## STEP 4 — Run Locally (No Netlify Needed)

Open **two terminals** in the project folder:

**Terminal 1 — API proxy server:**
```bash
npm run server
```
You should see:
```
✅ SnapLearn Dev Server running on http://localhost:4000
   Bedrock model : anthropic.claude-sonnet-4-5-20250514-v1:0
   Polly voice   : Kajal
   AWS region    : us-east-1
```

**Terminal 2 — React frontend:**
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in Chrome.

**How it works:**
- Vite proxies `/api/*` → `localhost:4000`
- `server.js` calls AWS Bedrock and Polly using your `.env` keys
- Same code as the Lambda functions — no surprises in production

---

## STEP 5 — Quick API Tests

### ✅ Test server is up
```bash
curl http://localhost:4000/api/health
```
Expected: `{"status":"ok","region":"us-east-1",...}`

### ✅ Test Bedrock (AI)
Go to app → Chat screen → type anything → should get a Hinglish response

If fails:
- Check Terminal 1 for error messages
- Make sure `.env` keys are correct (no extra spaces)
- Make sure region is `us-east-1`
- Make sure Bedrock model access was approved (Step 2)

### ✅ Test Polly (voice)
Go to Chat → get an AI response → tap the message → should hear Kajal's voice

If silent:
- Check browser allows audio
- `POLLY_VOICE_ID=Kajal` requires `POLLY_LANGUAGE_CODE=hi-IN`

---

## STEP 6 — Deploy to AWS (Production)

### 6A — Deploy Lambda Functions

1. `npm run build` → creates `/dist` folder (frontend)
2. Go to AWS Console → search **"Lambda"** → **Create function**

**Create 2 functions:**

**`snaplearn-bedrock`:**
- Runtime: `Node.js 22.x`
- Zip `lambda/bedrock.mjs` → upload (or paste code directly)
- Configuration → General → **Timeout: 30 seconds** ← critical!
- Configuration → Environment variables → add your `.env` values

**`snaplearn-polly`:**
- Same setup, use `lambda/polly.mjs`
- **Timeout: 15 seconds**
- Configuration → Environment variables → add your `.env` values

**Add IAM permissions to each Lambda:**
- Configuration → Permissions → click Role name → Add:
  - `AmazonBedrockFullAccess`
  - `AmazonPollyFullAccess`

---

### 6B — Create API Gateway

1. AWS Console → **API Gateway** → **Create API** → **HTTP API** → **Build**
2. Name: `snaplearn-api` → **Next**
3. Add routes:
   ```
   POST   /api/bedrock  → Lambda: snaplearn-bedrock
   POST   /api/polly    → Lambda: snaplearn-polly
   ```
4. **Next** → **Next** → **Create**
5. Left sidebar → **CORS** → Configure:
   - Allow origin: `*` (or your Amplify URL)
   - Allow methods: `POST`
   - Allow headers: `Content-Type`
6. Left sidebar → **Deploy** → Stage: `$default` → Copy the **Invoke URL**

> Invoke URL looks like: `https://abc123.execute-api.us-east-1.amazonaws.com`

> For Polly audio: Go to API stage settings → **Binary media types** → add `audio/mpeg`

---

### 6C — Deploy Frontend to Amplify

1. Update Vite to use API Gateway URL for production:

   Open `vite.config.ts` and note the proxy (only affects local dev — Amplify gets the real URL via env var).

   Create `.env.production`:
   ```env
   VITE_API_BASE_URL=https://abc123.execute-api.us-east-1.amazonaws.com
   ```

2. Build:
   ```bash
   npm run build
   ```

3. AWS Console → **Amplify** → **Create new app** → **Deploy without Git**
4. Drag and drop the `dist/` folder → **Save and Deploy**
5. Your app is live at `https://main.yourappid.amplifyapp.com`

> If you want a custom domain: Amplify → Domain management → Add your domain

---

## Full AWS Stack Summary

| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| Frontend hosting | **AWS Amplify** | Serves React app (HTML/JS/CSS) |
| AI analysis (images, chat) | **AWS Bedrock** | Claude Sonnet 4.5 via Lambda |
| Text-to-speech | **AWS Polly** | Kajal neural Hindi voice via Lambda |
| API routing | **API Gateway** | Routes `/api/bedrock` and `/api/polly` |
| Backend functions | **AWS Lambda** | Node.js handlers, no servers to manage |
| Local dev proxy | **server.js** | Express wrapper — same code = no surprises |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm run server` fails | Check `.env` exists with all 5 keys filled |
| Bedrock: "Access denied" | Check IAM user has `AmazonBedrockFullAccess` |
| Bedrock: model not found | Redo Step 2 — enable Claude Sonnet in us-east-1 |
| Bedrock: wrong region | `.env` must have `AWS_REGION=us-east-1` |
| Polly: 400 error | `Kajal` voice needs `POLLY_LANGUAGE_CODE=hi-IN` |
| Camera: black screen | Refresh page. Must use Chrome. Allow camera in browser |
| Lambda timeout | Set timeout to 30s in Lambda → Configuration → General |
| API Gateway 502 | Lambda erroring — check Lambda logs in CloudWatch |
| Amplify shows old version | Clear Amplify cache or bump version and redeploy |
