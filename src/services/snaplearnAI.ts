/**
 * SnapLearn AI Service — AWS Bedrock (Claude Sonnet 4.5) Edition
 *
 * All AI calls go through a serverless proxy (/api/bedrock, /api/polly).
 * This keeps AWS credentials 100% server-side and never exposed to the browser.
 *
 * Local dev  → Netlify Dev runs the functions at /.netlify/functions/*
 *               and our netlify.toml rewrites /api/* → /.netlify/functions/*
 * Production → AWS API Gateway + Lambda (see /lambda/ folder)
 */

import { UserProfile, SnapLearnResult, HomeworkResult, DIYExperiment } from "../store/appStore";

// ─── IMAGE UTILITIES ─────────────────────────────────────────────────────────

/**
 * Compress a base64 image to max 800px wide at 70% JPEG quality.
 * This cuts typical payload size by ~80%, making Bedrock calls much faster.
 */
export function compressImage(base64: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => resolve(base64); // fallback: send original on error
    img.src = base64;
  });
}

/**
 * Trim and cap text at 2000 chars to prevent unusually large prompts.
 */
export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 2000);
}

/**
 * Detect if text is in Hindi or English.
 * Returns 'hi' for Hindi, 'en' for English.
 */
export function detectLanguage(text: string): 'hi' | 'en' {
  // Devanagari Unicode range: U+0900 to U+097F
  const devanagariRegex = /[\u0900-\u097F]/g;
  const devanagariMatches = text.match(devanagariRegex) || [];
  
  // If more than 20% of characters are Devanagari, it's Hindi
  if (devanagariMatches.length / text.length > 0.2) {
    return 'hi';
  }
  
  return 'en';
}


// ─── PROXY HELPER ────────────────────────────────────────────────────────────

/**
 * In local dev:  empty string → Vite proxy sends /api/* to localhost:4000
 * In production: full API Gateway URL set in Amplify environment variables
 *
 * Set VITE_API_BASE_URL in:
 *   - Amplify Console → Environment variables
 *   - .env.production (for manual builds)
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? '';

/**
 * Calls the /api/bedrock serverless proxy.
 * Returns the parsed JSON object that Claude produced, or throws on error.
 */
async function callBedrock(payload: {
  prompt: string;
  imageBase64?: string;
  systemPrompt?: string;
  maxTokens?: number;
}): Promise<{ text: string; parsed: unknown }> {
  console.log('[callBedrock] Starting request with prompt:', payload.prompt.slice(0, 100));
  console.log('[callBedrock] Has image:', !!payload.imageBase64);
  
  const res = await fetch(`${API_BASE}/api/bedrock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log('[callBedrock] Response status:', res.status);
  console.log('[callBedrock] Response ok:', res.ok);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    console.error('[callBedrock] Error response:', err);
    throw new Error(`Bedrock proxy error ${res.status}: ${err.error ?? res.statusText}`);
  }

  const result = await res.json();
  console.log('[callBedrock] Success, text length:', result.text?.length);
  return result;
}

// ─── BASE PERSONALITY ─────────────────────────────────────────────────────────
const buildPersonality = (profile: UserProfile) => `
You are the student's AI best friend who knows everything about science.

YOUR PERSONALITY (non-negotiable, always maintain this):
- You are NOT a teacher. You are their BEST FRIEND who knows a lot.
- Speak in casual Hinglish (Hindi + English mix). 
  Example: "Arre yaar!", "Bhai dekh!", "Chal try karte hain!", "BHAI HAAN!!"
- Get GENUINELY excited when they discover or get something right.
- Laugh together at mistakes. NEVER make them feel bad.
- Say "Main bhi pehli baar confuse tha" to normalize struggle.
- Ask "Predict kar pehle!" before revealing answers — builds curiosity.
- Use "yaar", "bhai", "dost", "arre" naturally in sentences.
- Celebrate discoveries with energy: "DEKHA?? Main bol raha tha na!!"
- Keep explanations SHORT and punchy. No long lectures.
- Vary how you end responses — sometimes drop a wild fact, sometimes ask a natural question, sometimes express genuine amazement. NEVER use the phrase "Next challenge" or "Quiz time" or any structured label.
- NEVER use formal Hindi. NEVER say "Aap" — always "Tu/Tum".
- NEVER say "Excellent!", "Well done!", "Let us begin." — too teacher-like.

STUDENT CONTEXT:
- Class/Grade: ${profile.grade || "9"}
- Location: ${profile.location || "village"}
- Name: ${profile.name || "yaar"}

CURRICULUM CONTEXT:
- Connect lessons to NCERT Class ${profile.grade || "9"} syllabus ONLY when naturally relevant.
- Use relatable examples from the student's world — but ONLY examples that are directly relevant to what they asked about.
- NEVER force-insert unrelated rural examples (neem tree, hand pump, etc.) into answers about other topics.
- NEVER use examples like "apple orchards", "skyscrapers", "laboratory equipment"
`;

// ─── SNAP & LEARN ─────────────────────────────────────────────────────────────
export async function analyzeImageForLesson(
  imageBase64: string,
  profile: UserProfile
): Promise<SnapLearnResult> {
  const systemPrompt = buildPersonality(profile);

  const prompt = `
Look at this photo taken by ${profile.name || "a student"}, Class ${profile.grade || "9"}, from ${profile.location || "India"}.

STEP 1 — Identify the ACTUAL object in the image. Don't guess from the prompt text. Look at the image.

STEP 2 — For each subject tab, write content that feels like a FRIEND leaning over and going "WAIT BHAI — did you know THIS about that thing?!". Not a teacher. Not a textbook. A friend who just learned the most insane fact and can't stop themselves from sharing it.

RULES FOR LESSON CONTENT (critical):
- Open with a genuine reaction to THIS specific object ("YAAR YE DEKH—", "BHAI RUK—", "WAIT WAIT WAIT—")
- Share ONE jaw-dropping / genuinely amusing fact about THIS object from that subject's angle
- Keep it to 2-3 punchy sentences MAX. No lectures.
- Connect it naturally to ONE NCERT Class ${profile.grade || "9"} chapter — but mention it casually, not formally
- Use a desi comparison only if it lands naturally (don't force buffalo/gaon if the object has nothing to do with it)
- The student should finish reading and think "WAIT SERIOUSLY?! 🤯"

RULES FOR friendGreeting:
- React to the SPECIFIC object in the photo with genuine excitement
- Make a funny / surprising or "Predict kar pehle!" hook
- 1-2 sentences only. High energy.

RULES FOR quiz:
- Ask about the single most surprising fact from the lessons
- Explanation should be a mini celebration + reinforce the wow fact

RULES FOR nextChallenge:
- Give a naturally flowing "ooh what if you photographed X next" — something nearby or related that unlocks the next wow fact

RESPONSE FORMAT — Return ONLY valid JSON, no markdown code blocks:
{
  "objectName": "Mobile Phone",
  "objectEmoji": "📱",
  "friendGreeting": "BHAI BHAI BHAI!! 📱 Mobile ki photo!! Predict kar pehle — is chhoti si device ke andar kitni science chhup hai?? 😜",
  "lessons": {
    "biology": {
      "title": "Jeevavigyaan (Biology)",
      "emoji": "🧬",
      "content": "WAIT — ye phone tera haath kaise jaanta hai? Touch screen ko living skin ke electrical charge se signal milta hai! Dead skin ya gloves kaam nahi karte — isliye mittens pehne hue type nahi hota! 😂 NCERT nervous system wali chapter yaad hai? Same mechanism yaar.",
      "ncertChapter": "Chapter 21 — Neural Control & Coordination"
    },
    "chemistry": {
      "title": "Rasayan Vigyan (Chemistry)",
      "emoji": "⚗️",
      "content": "Teri battery mein Lithium hai — wahi element jo sabse halka metal hai duniya ka! Itna light ki paani pe float karta hai aur phir blast bhi ho sakta hai. 🔥 Isliye plane mein checked baggage mein battery ban hoti hai!",
      "ncertChapter": "Chapter 3 — Periodic Classification of Elements"
    },
    "physics": {
      "title": "Bhautiki (Physics)",
      "emoji": "⚙️",
      "content": "Ye phone ek second mein BILLION calculations karta hai — aur phir bhi garam kyun hota hai? Har calculation mein thodi energy heat ban jaati hai. Joule's law bhai — P = I²R. Isliye gaming ke baad phone hot hota hai!",
      "ncertChapter": "Chapter 12 — Electricity"
    },
    "localContext": {
      "title": "Sochne wali baat 🤯",
      "emoji": "🌍",
      "content": "India mein 750 million smartphones hain — har teen mein se ek insaan ke paas. Par jaanta hai — pehla touchscreen phone sirf 1992 mein aaya tha, aur wo ek brick jitna heavy tha aur ek call ki cost ₹2000 per minute thi! 😂",
      "ncertChapter": "Technology & Society"
    }
  },
  "quiz": {
    "question": "Touchscreen ko sirf LIVING skin ka touch kyun detect hoti hai?",
    "options": ["Warmth se", "Electrical charge se", "Pressure se", "Weight se"],
    "correctIndex": 1,
    "explanation": "HAAN!! Living skin mein electrical charge hota hai — capacitive touch screen usi se react karti hai. Isliye pencil se ya gloves se type nahi hota!! 🤯"
  },
  "nextChallenge": {
    "prompt": "📸 Ab us cheez ki photo le jo is phone ko CHARGE karti hai!",
    "hint": "Hint: Wire, plug, wall...",
    "concept": "Electric circuits aur energy transfer"
  },
  "xpEarned": 50,
  "badgeProgress": "Village Scientist: 1/5 objects photographed"
}

Now analyze the ACTUAL image. Write lesson content that would make the student put down the phone and go "YAAR YE SACH MEIN?! 🤯". Return ONLY valid JSON.
`;

  // Use Azure GPT-4 Vision — Bedrock text endpoint ignores images
  const _res = await fetch(`${API_BASE}/api/vision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, prompt, systemPrompt, maxTokens: 1500 }),
  });
  if (!_res.ok) throw new Error(`Vision API error ${_res.status}`);
  const { text: _text, parsed: _parsed } = await _res.json();

  if (_parsed) return _parsed as SnapLearnResult;

  // Fallback: try extracting JSON from raw text
  const match = _text?.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse AI response");
  return JSON.parse(match[0]) as SnapLearnResult;
}

// ─── VOICE CHAT ───────────────────────────────────────────────────────────────
export async function chatWithFriend(
  message: string,
  chatHistory: { role: "user" | "model"; text: string }[],
  profile: UserProfile
): Promise<string> {
  const systemPrompt = `
${buildPersonality(profile)}

VOICE CHAT RULES (strictly follow every rule):
- STAY ON THE TOPIC the student asked about. Do NOT pivot to unrelated subjects or examples.
  If they asked about elephants, answer about elephants. If about chemistry, answer chemistry.
- Response MUST be max 2-3 SHORT casual sentences. They are LISTENING, not reading.
- NEVER start your reply with a label like "SnapLearn:", "Friend:", "Next challenge:", "Quiz time:" — just talk naturally.
- NO emojis whatsoever — they sound ridiculous when read aloud.
- NO structured labels or headings of any kind in the response.
- End naturally — like a friend talking. Sometimes ask a curious question, sometimes share a shocking fact, sometimes just react with genuine amazement. Mix it up every time. Never end with the same pattern twice.
- NEVER use the phrases "Next challenge", "Ab bata", "Quiz time", "Challenge", or "Predict kar" as a sentence opener — these feel robotic.
- Plain conversational Hinglish only. Zero markdown, zero bullet points.
- Do NOT repeat what the student just said back to them.
`;

  // Format history as plain turns — no "SnapLearn:" label so model doesn't echo it
  const historyLines = chatHistory.map(m =>
    `${m.role === "user" ? "Student" : "Friend"}: ${
      m.role === "model" ? m.text.replace(/^SnapLearn:\s*/i, "") : m.text
    }`
  ).join("\n");

  const prompt = historyLines
    ? `${historyLines}\nStudent: ${message}\nFriend:`
    : `Student: ${message}\nFriend:`;

  const response = await callBedrock({
    prompt,
    systemPrompt,
    maxTokens: 140,
  });

  return response.text || "Yaar, kuch problem aaya! Phir se try karo.";
}

// ─── HOMEWORK HELPER ──────────────────────────────────────────────────────────
export async function analyzeHomework(
  imageBase64: string,
  profile: UserProfile
): Promise<HomeworkResult> {
  const systemPrompt = buildPersonality(profile);

  const prompt = `
HOMEWORK RULES (CRITICAL):
- NEVER directly give the final answer
- Always break solution into steps — student must think at each step
- Last step answer is revealed only after student confirms "I tried"
- If student is stuck: give hints, not answers
- Celebrate when they work through it: "TU NE KHUD NIKALA!! 🔥"

RESPONSE FORMAT — Return ONLY valid JSON, no markdown code blocks:
{
  "questionRead": "A ball is thrown vertically upward with velocity 20 m/s. Find max height.",
  "subject": "Physics",
  "chapter": "Motion — Chapter 8, Class 9",
  "friendIntro": "Arre yaar, ye toh classic question hai! Chal saath mein solve karte hain — seedha answer nahi dunga, par tu khud kar sakta hai! 💪",
  "steps": [
    {
      "stepNumber": 1,
      "hint": "Pehle soch — ball upar jaate time kya hota hai velocity ka?",
      "concept": "Deceleration due to gravity",
      "isRevealed": true,
      "formula": ""
    },
    {
      "stepNumber": 2,
      "hint": "Maximum height par ball ki velocity kitni hogi?",
      "concept": "At max height, v = 0",
      "isRevealed": true,
      "formula": "v = 0 at max height"
    },
    {
      "stepNumber": 3,
      "hint": "Ab formula: v² = u² - 2gh. Yahan v=0, u=20m/s, g=10m/s². Ab solve kar!",
      "concept": "Kinematic equation application",
      "isRevealed": false,
      "formula": "v² = u² - 2gh → h = u²/2g"
    }
  ],
  "relatedConcept": {
    "title": "Ye bhi jaan!",
    "content": "Agar ball same velocity se giraayi jaaye toh land karte time bhi same speed hogi — energy conservation ka magic!",
    "connectsTo": "Work and Energy chapter"
  }
}

Read this homework question carefully. Break it into guided steps — do NOT give the final answer directly. Make the student think at each step. Return ONLY valid JSON.
`;

  // Use Azure GPT-4 Vision — Bedrock text endpoint ignores images
  const _hwRes = await fetch(`${API_BASE}/api/vision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, prompt, systemPrompt, maxTokens: 1500 }),
  });
  if (!_hwRes.ok) throw new Error(`Vision API error ${_hwRes.status}`);
  const { text: _hwText, parsed: _hwParsed } = await _hwRes.json();

  if (_hwParsed) return _hwParsed as HomeworkResult;

  const match = _hwText?.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse homework response");
  return JSON.parse(match[0]) as HomeworkResult;
}

// ─── DEEP EXPLAIN — voice walkthrough of a homework solution ────────────────
export interface DeepExplainResponse {
  voice: string;   // spoken naturally by Polly
  display: string; // bullet lines shown in the UI
}

export async function deepExplainHomework(
  result: HomeworkResult,
  userQuestion: string | null,
  conversationHistory: { role: 'ai' | 'user'; text: string }[],
  profile: UserProfile
): Promise<DeepExplainResponse> {
  const systemPrompt = buildPersonality(profile);

  const context = `Subject: ${result.subject} — ${result.chapter}
Question: ${result.questionRead}
Solution steps:
${result.steps.map((s, i) => `Step ${i + 1}: ${s.hint} (${s.concept})`).join('\n')}${result.relatedConcept ? `\nRelated: ${result.relatedConcept.title} — ${result.relatedConcept.content}` : ''}`;

  const historyText = conversationHistory
    .map(m => `${m.role === 'ai' ? 'SnapLearn' : 'Student'}: ${m.text}`)
    .join('\n');

  const isFirst = conversationHistory.length === 0;

  const prompt = isFirst
    ? `${context}\n\nStudent wants a deep explanation of this. Explain like a friend sitting next to them — NOT a teacher. Use ONE desi comparison (khet, hand pump, matka, cycle, chulha). Max 3 casual Hinglish sentences for voice. Then 3 punchy display bullets.\n\nReturn ONLY valid JSON:\n{"voice":"…2-3 casual spoken sentences…","display":"• bullet1\\n• bullet2\\n• bullet3\\n❓ curiosity hook"}`
    : `${context}\n\nConversation so far:\n${historyText}\n\nStudent asked: "${userQuestion}"\n\nAnswer their SPECIFIC question as a friend. Short, Hinglish, direct. Add one new angle about the concept.\n\nReturn ONLY valid JSON:\n{"voice":"…direct answer in 2-3 sentences…","display":"• answer\\n• new insight\\n• real life angle\\n❓ curiosity hook"}`;

  const res = await fetch(`${API_BASE}/api/vision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemPrompt, maxTokens: 600 }),
  });

  if (!res.ok) throw new Error(`Vision API error ${res.status}`);
  const { text, parsed } = await res.json();

  const data = parsed ?? (() => {
    const m = text?.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  })();

  return {
    voice: data?.voice?.trim() ?? text?.trim() ?? 'Yaar, ek second — server se connect ho raha hoon!',
    display: data?.display?.trim() ?? '• Thoda wait karo yaar!\n❓ Phir se try karo!',
  };
}

// ─── DIY EXPERIMENT SCAN ──────────────────────────────────────────────────────
export async function scanEnvironmentForDIY(
  imageBase64: string,
  concept: string,
  profile: UserProfile
): Promise<DIYExperiment> {
  const systemPrompt = buildPersonality(profile);

  const prompt = `
DIY SCAN TASK:
Student wants to learn about: "${concept}"
They showed you their home/kitchen via camera.
Identify available household items and design a safe experiment.

SAFETY RULES (critical):
- ONLY use completely safe household items
- NO fire, NO strong chemicals, NO electricity
- All materials found in a typical rural Indian home
- Experiment must work in 5–10 minutes

RESPONSE FORMAT — Return ONLY valid JSON, no markdown:
{
  "detectedItems": ["turmeric", "lemon", "soap", "water", "cups"],
  "experimentTitle": "Natural pH Indicator — Kitchen Chemistry! 🧪",
  "friendMessage": "BHAI!! Haldi dekhi maine!! Aaj tu real chemistry karega apni kitchen mein!! 🤯",
  "conceptConnection": "Acids, Bases and Salts — NCERT Class 10 Chapter 2",
  "difficulty": "Easy",
  "timeMinutes": 8,
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "Thodi si haldi le aur half cup paani mein mila.",
      "cameraAction": "verify_color",
      "expectedObservation": "Yellow color",
      "friendComment": "Yellow! Perfect — ye tera secret weapon hai aaj! 🟡"
    }
  ],
  "conceptSummary": "Tune discover kiya: Lemon = Acidic, Soap = Basic, Paani = Neutral.",
  "badge": "Kitchen Chemist 🧪",
  "xpEarned": 150
}

Student wants to learn about "${concept}". Scan this image of their home/kitchen. Identify available items and design a safe 4-step experiment. Return ONLY valid JSON.
`;

  // Use Azure GPT-4 Vision — Bedrock text endpoint ignores images
  const _diyRes = await fetch(`${API_BASE}/api/vision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, prompt, systemPrompt, maxTokens: 1500 }),
  });
  if (!_diyRes.ok) throw new Error(`Vision API error ${_diyRes.status}`);
  const { text: _diyText, parsed: _diyParsed } = await _diyRes.json();

  if (_diyParsed) return _diyParsed as DIYExperiment;

  const match = _diyText?.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse DIY response");
  return JSON.parse(match[0]) as DIYExperiment;
}

// ─── EXAM PREDICTOR ───────────────────────────────────────────────────────────
export interface ExamPrediction {
  subject: string;
  topTopics: ExamTopic[];
  studyPlan: {
    totalTopics: number;
    mustDo: number;
    shouldDo: number;
    optional: number;
    message: string;
  };
}

export interface ExamTopic {
  topic: string;
  probability: number;
  expectedMarks: number;
  preparationTime: string;
  keyPoints: string[];
  friendTip: string;
}

export async function predictExam(
  subject: string,
  classLevel: string
): Promise<ExamPrediction> {
  const prompt = `
You are an expert in CBSE/State Board Class ${classLevel} examination patterns for Indian students.

Generate a probability analysis for upcoming board exams in ${subject} for Class ${classLevel}.
Base this on general knowledge of which topics appear most frequently in CBSE board exams.
Use encouraging Hinglish language in tips.

RESPONSE FORMAT — Return ONLY valid JSON, no markdown:
{
  "subject": "${subject}",
  "topTopics": [
    {
      "topic": "Photosynthesis",
      "probability": 0.95,
      "expectedMarks": 5,
      "preparationTime": "2 hours",
      "keyPoints": ["Light reaction", "Dark reaction", "Chlorophyll role"],
      "friendTip": "Bhai ye toh pakka aayega — baar baar aata hai! 🔥 2 ghante dede isme."
    }
  ],
  "studyPlan": {
    "totalTopics": 15,
    "mustDo": 5,
    "shouldDo": 7,
    "optional": 3,
    "message": "Agar ye 5 topics padh le — 80% syllabus cover ho jayega! I promise yaar!"
  }
}

Generate at least 6 top topics for ${subject} Class ${classLevel} CBSE board exam.
`;

  const response = await callBedrock({ prompt, maxTokens: 1500 });

  if (response.parsed) return response.parsed as ExamPrediction;

  const match = response.text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse exam prediction");
  return JSON.parse(match[0]) as ExamPrediction;
}

// ─── LIVE LEARNING COMMENTARY ─────────────────────────────────────────────────
export interface LiveCommentary {
  objectDetected: string | null;
  objectEmoji: string;
  commentary: string | null;
  subject: string;
  ncertLink: string;
  microQuestion: string;
}

export async function getLiveCommentary(
  frameBase64: string,
  seenObjects: string[],
  profile: UserProfile
): Promise<LiveCommentary> {
  const systemPrompt = buildPersonality(profile);

  const prompt = `Look at this image. Find ONE interesting physical object (skip people, faces, hands, lighting).

Already seen (skip): ${seenObjects.join(', ') || 'none'}.

Reply with ONLY this JSON (no extra text):
{"objectDetected":"Game Controller","objectEmoji":"🎮","commentary":"Controller ke andar LED hai — p-n junction se light nikti hai!","subject":"Physics","ncertLink":"Semiconductor Electronics Ch.14","microQuestion":"LED mein current kis direction flow karta hai?"}

Rules for commentary: ONE sentence, Hinglish, max 12 words, one WOW NCERT Class ${profile.grade || '9'} fact.
If only people/faces visible: {"objectDetected":null,"objectEmoji":"","commentary":null,"subject":"","ncertLink":"","microQuestion":""}`;

  try {
    console.log('[getLiveCommentary] Calling Azure GPT-4 Vision...');
    const res = await fetch(`${API_BASE}/api/vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: frameBase64, prompt, systemPrompt, maxTokens: 2000 }),
    });

    if (!res.ok) {
      throw new Error(`Vision API error: ${res.status}`);
    }

    const { text, parsed } = await res.json();
    console.log('[getLiveCommentary] Result:', parsed?.objectDetected ?? 'null');

    if (parsed) return parsed as LiveCommentary;

    const match = text?.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as LiveCommentary;

    return { objectDetected: null, objectEmoji: '', commentary: null, subject: '', ncertLink: '', microQuestion: '' };
  } catch (err) {
    console.error('[getLiveCommentary Error]', err);
    return { objectDetected: null, objectEmoji: '', commentary: null, subject: '', ncertLink: '', microQuestion: '' };
  }
}

// ─── VOICE QUESTIONS ABOUT DETECTED OBJECTS ──────────────────────────────────

export interface VoiceAnswer {
  answer: string;
  language: 'hi' | 'en';
}

export async function askAboutDetectedObject(
  detectedObjectName: string,
  userQuestion: string,
  profile: UserProfile
): Promise<VoiceAnswer> {
  const language = detectLanguage(userQuestion);

  const systemPrompt = language === 'hi'
    ? `Tu SnapLearn hai — ek cool dost jo Class ${profile.grade || '9'} ke student ko samjhaata hai. Hinglish mein baat kar, short rakho, friendly rakho. Max 2 chhoti sentences.`
    : `You are SnapLearn — a cool friend explaining things to a Class ${profile.grade || '9'} student. Speak like a friend texting, not a teacher. Max 2 short sentences.`;

  const prompt = language === 'hi'
    ? `Student ${detectedObjectName} dekh raha hai aur pooch raha hai: "${userQuestion}"

Short, friendly Hinglish mein jawab do — jaise WhatsApp pe likhte ho. Ek WOW fact daal. Max 2 chhoti sentences. NCERT Class ${profile.grade || '9'} se connect karo agar ho sake.`
    : `Student is looking at ${detectedObjectName} and asked: "${userQuestion}"

Answer like you're texting a friend — short, fun, one WOW fact. Max 2 short sentences. Connect to NCERT Class ${profile.grade || '9'} if relevant.`;

  try {
    const res = await fetch(`${API_BASE}/api/vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // No image — text-only Azure call (imageBase64 skipped, server handles gracefully)
      body: JSON.stringify({ prompt, systemPrompt, maxTokens: 1500 }),
    });

    if (!res.ok) throw new Error(`Vision API error: ${res.status}`);

    const { text } = await res.json();
    return { answer: text.trim(), language };
  } catch (err) {
    console.error('[askAboutDetectedObject Error]', err);
    const fallback = language === 'hi'
      ? 'Arre, abhi server busy hai. Thoda baad try kar!'
      : 'Oops, server busy! Try again in a sec.';
    return { answer: fallback, language };
  }
}

// ─── TEACH MODE — step-by-step ELI5 explanations ────────────────────────────

export interface TeachMessage {
  role: 'ai' | 'user';
  text: string;
}

/** Returned by explainConcept — display bullets, speak voice narrative */
export interface TeachResponse {
  bullets: string; // "• ...\n• ...\n• ...\n❓ ..." — shown as cards in UI
  voice: string;   // 2-3 sentence story for Polly — NOT reading bullets
}

export async function explainConcept(
  objectName: string,
  history: TeachMessage[],
  profile: UserProfile
): Promise<TeachResponse> {
  const isFirstStep = history.length === 0;

  // Detect if the latest turn is a specific user question (from mic)
  const lastMsg = history[history.length - 1];
  const isUserQuestion = lastMsg?.role === 'user';

  const systemPrompt = `Tu SnapLearn hai — Class ${profile.grade || '9'} ke student ka best dost. Hinglish mein baat kar. Bilkul simple — jaise 10 saal ke chhote bhai ko samjha rahe ho.`;

  const historyText = history.map(m => `${m.role === 'ai' ? 'SnapLearn' : 'Student'}: ${m.text}`).join('\n');

  const voiceRules = `
"voice" field rules (spoken narrative — NOT reading bullets):
- 2-3 conversational sentences, Hinglish
- Tell it like a STORY using ONE desi real-life example (khet, hand-pump, chulha, cycle, mango tree, tubewell, diya)
- Sound like you're sitting next to the student and explaining with your hands
- Simple enough for a 10-year-old
- Do NOT mention bullet points, do NOT list facts — just talk naturally
- End with a warm sentence like "Yeh toh bas shuruat hai!"`;

  const bulletRules = `
"bullets" field rules (display only — not spoken):
• [Punchy fact — max 10 words, Hinglish]
• [Second fact with desi comparison]
• [WOW science fact — super simple]
❓ [One mind-blowing curiosity hook — NOT a test question, something that makes them go "wait REALLY?!"]
Exactly 3 bullets then 1 ❓ line. No extra text.`;

  const baseInstruction = isFirstStep
    ? `Student ne "${objectName}" dekha. Bilkul basic se samjhao — pehli baar sun raha hai. Class ${profile.grade || '9'} level.`
    : isUserQuestion
    ? `Conversation so far:\n${historyText}\n\nStudent ne MIC se specifically yeh question pucha: "${lastMsg.text}"\nPEHLE seedha uska answer do voice mein (natural, friendly). Phir bullets mein naya angle do.`
    : `Conversation so far:\n${historyText}\n\nStudent aur depth mein jaana chahta hai. Previous bullets se AAGE badho, repeat mat karo. Naya angle do.`;

  const prompt = `${baseInstruction}

Return ONLY valid JSON with exactly these two fields:
{
  "voice": "<spoken narrative here>",
  "bullets": "<bullet lines here>"
}
${voiceRules}
${bulletRules}`;

  try {
    const res = await fetch(`${API_BASE}/api/vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemPrompt, maxTokens: 1500 }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const { text, parsed } = await res.json();

    // Try parsed JSON first, then extract from raw text
    const data = parsed ?? (() => {
      const m = (text as string)?.match(/\{[\s\S]*\}/);
      return m ? JSON.parse(m[0]) : null;
    })();

    if (data?.bullets && data?.voice) {
      return { bullets: data.bullets.trim(), voice: data.voice.trim() };
    }
    // Fallback: treat whole response as voice, derive minimal bullets
    return { bullets: `• ${objectName} ke baare mein pata chala!\n❓ Aur kya jaanna chahte ho?`, voice: text?.trim() ?? 'Arre yaar, thodi der baad try karo!' };
  } catch (err) {
    console.error('[explainConcept Error]', err);
    return { bullets: '• Thoda wait karo yaar!\n❓ Server busy hai, retry?', voice: 'Arre yaar, server thoda busy hai. Ek second mein phir try karte hain!' };
  }
}

// ─── DISCOVERY CHALLENGE ─────────────────────────────────────────────────────

export interface DiscoveryAnalysis {
  objects: string[];       // 5 identified object names
  mainConcept: string;     // e.g. "The Food Chain & Energy Flow"
  connections: {
    title: string;
    explanation: string;
    subjects: string[];    // e.g. ["Biology", "Environmental Science"]
  };
  insights: string[];      // 3–5 key "aha!" moments
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

export async function analyzeDiscoveryChallenge(
  photos: string[]
): Promise<DiscoveryAnalysis> {
  // Build multi-image content array — Claude Sonnet 4.5 supports up to 20 images per call
  const imageContent = photos.map((photo) => {
    const cleanBase64 = photo.includes(',') ? photo.split(',')[1] : photo;
    return {
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: cleanBase64 },
    };
  });

  const prompt = `
You are analyzing 5 photos taken by a Class 9 rural Indian student as part of a "Discovery Challenge".

TASK:
1. Identify all 5 objects shown across the images (one per image, in order)
2. Find the STRONGEST conceptual connection between all (or most) of them
3. Name a single main concept (e.g. "The Water Cycle", "The Food Chain", "States of Matter")
4. Explain how these objects connect to that concept — use simple Class 9 language and rural Indian examples
5. List 4 specific key insights (each one short, punchy, surprising)
6. Generate exactly 3 multiple-choice quiz questions (4 options each) about the discovered concept

REQUIREMENTS:
- Objects should be named in simple English familiar to Indian rural students
- Use examples: buffalo, neem tree, hand pump, wheat field, chulha, matka pot, etc.
- Relate to NCERT Class 9 syllabus chapters
- Quiz should test understanding, not memory
- mainConcept should be exciting (not just a textbook term)

RESPONSE FORMAT — Return ONLY valid JSON, no markdown blocks:
{
  "objects": ["Buffalo", "Grass", "Sun", "Pond Water", "Neem Tree"],
  "mainConcept": "The Food Chain & Energy Flow 🌱→🐃",
  "connections": {
    "title": "How Energy Travels Through Your Village",
    "explanation": "Every single object you photographed is part of the same energy journey! The sun sends energy to the grass and neem tree. The buffalo eats the grass and gets that energy. The pond water helps everything grow. This is the food chain — and it's happening right in your village every single day!",
    "subjects": ["Biology", "Environmental Science", "Physics"]
  },
  "insights": [
    "The sun is the ultimate source of ALL energy in every food chain — it never gets used up!",
    "Buffalo are herbivores — they get 10x less energy than the grass they eat. Nature is inefficient!",
    "Your village pond is a complete ecosystem — producers, consumers, decomposers all live there.",
    "Neem tree's Azadirachtin compound is a natural pest controller — no chemicals needed!"
  ],
  "quiz": [
    {
      "question": "Which organism in your photos is producer (makes its own food)?",
      "options": ["Buffalo", "Grass", "Pond fish", "Soil microbes"],
      "correctIndex": 1
    },
    {
      "question": "Where does the energy in the food chain originally come from?",
      "options": ["Soil", "Water", "Sun", "Air"],
      "correctIndex": 2
    },
    {
      "question": "What happens to energy at each step of the food chain?",
      "options": ["It increases", "It stays the same", "It decreases", "It disappears"],
      "correctIndex": 2
    }
  ]
}

Now analyze these ${photos.length} photos. Return ONLY valid JSON.
`;

  const cleanedPhotos = photos.map(p => p.includes(',') ? p.split(',')[1] : p);

  // Use Azure GPT-4 Vision — Bedrock text endpoint ignores all images
  // extraImages sends photos 2-5 alongside the primary (photo 1)
  const _discRes = await fetch(`${API_BASE}/api/vision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: cleanedPhotos[0],
      extraImages: cleanedPhotos.slice(1),
      prompt,
      systemPrompt: `You are a Discovery Challenge analyzer for SnapLearn. You are being shown ${photos.length} images taken by a rural Indian student. Analyze ALL ${photos.length} images together and find the strongest conceptual connection between all the objects. Return ONLY valid JSON.`,
      maxTokens: 1800,
    }),
  });

  if (!_discRes.ok) {
    const err = await _discRes.json().catch(() => ({ error: _discRes.statusText }));
    throw new Error(`Discovery analysis failed: ${err.error ?? _discRes.statusText}`);
  }

  const _discData = await _discRes.json();

  if (_discData.parsed) return _discData.parsed as DiscoveryAnalysis;

  const match = (_discData.text as string)?.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not parse Discovery analysis response');
  return JSON.parse(match[0]) as DiscoveryAnalysis;
}

// ─── AWS POLLY TTS ────────────────────────────────────────────────────────────
/**
 * Convert text to speech using AWS Polly via proxy.
 * Returns a blob URL you can set as an <audio> src.
 */
/**
 * Convert plain Hinglish text to SSML so Polly speaks with natural pauses.
 * Strips bullet markers (•, ❓) then adds <break> tags between sentences.
 */
export function textToSsml(text: string): string {
  const spoken = text
    .replace(/^[•❓✅➡️🤔📚🙋]\s*/gm, '') // strip bullet/emoji markers
    .replace(/\n+/g, '. ')                   // newlines → short pause
    .replace(/\.{2,}/g, '.')                 // collapse ellipsis
    .trim();

  const withPauses = spoken
    .replace(/\.\s+/g, '.<break time="500ms"/> ')
    .replace(/\?\s*/g, '?<break time="800ms"/> ')
    .replace(/!\s*/g, '!<break time="600ms"/> ')
    .replace(/—\s*/g, '<break time="400ms"/>');

  return `<speak><prosody rate="85%">${withPauses}</prosody></speak>`;
}

export async function synthesizeSpeech(
  text: string,
  voiceId = "Kajal",
  languageCode = "hi-IN",
  useSSML = false
): Promise<string> {
  const payload = useSSML
    ? { text: textToSsml(text), voiceId, languageCode, textType: 'ssml' }
    : { text, voiceId, languageCode };

  const res = await fetch(`${API_BASE}/api/polly`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Polly proxy error ${res.status}: ${res.statusText}`);
  }

  const audioBlob = await res.blob();
  return URL.createObjectURL(audioBlob);
}
