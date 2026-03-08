# 🛡️ AWS Migration Guide: Securely Using Your $100 Credits

This guide explains how to move from **Google Gemini** to **AWS Bedrock (Claude 4.5 Sonnet)** and **AWS Polly** without leaking your secret keys to the public.

---

## 🛑 The "DANGER" Zone: Why we can't just use `.env` in the browser
You asked: *"Can't I just put the env variables in Vercel/Netlify and use them directly?"*

**The Answer:** 
*   **Gemini:** Yes, Google designed it for browser use.
*   **Azure OpenAI:** Yes, it supports browser calls (CORS).
*   **AWS Bedrock/Polly:** **NO.** 

**Here is why:**
1.  **Key Theft:** If you use `import.meta.env.VITE_AWS_SECRET_KEY` in your React code, Vite **burns that key into the final JavaScript file**. Anyone who visits your site can open "Inspect Element" → "Sources," search for "VITE_AWS," and steal your $100 credits.
2.  **CORS Block:** Even if you tried, AWS would reject the request. It expects requests from a secure server, not a browser like Chrome or Safari.

---

## ✅ The "SAFE" Zone: The Serverless Proxy Method
This is the "pro" way to use AWS while keeping your 100% React project.

**The Flow:**
1.  **Browser:** Calls your own site: `fetch('/api/bedrock', { image })`
2.  **Serverless Function (The Backend):** This is a small Node.js file that lives in an `/api` folder. It runs on Vercel/Netlify's servers for 1 second.
3.  **AWS Bedrock:** Responds to the serverless function (because it's a server, not a browser).
4.  **Browser:** Gets the JSON back and shows the lesson.

---

## 🛠️ Step 1: Prepare the Dependencies
When you are ready, run this to install the AWS SDK:
```bash
npm install @aws-sdk/client-bedrock-runtime @aws-sdk/client-polly
```

---

## 🛠️ Step 2: Create the "Bodyguard" (The API Proxy)
Create a file at `api/bedrock.js` (for Vercel) or `netlify/functions/bedrock.js` (for Netlify).

### `api/bedrock.js`
```javascript
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export default async function handler(req, res) {
  const client = new BedrockRuntimeClient({
    region: "us-east-1",   // ← Must be us-east-1 for Claude
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const { prompt, imageBase64, systemPrompt, maxTokens = 1000 } = req.body;

    const content = [];
    if (imageBase64) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
        }
      });
    }
    content.push({ type: "text", text: prompt });

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-sonnet-4-5-20250514-v1:0",  // ← Correct model (Claude 4.5)
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: maxTokens,
        system: systemPrompt || "",
        messages: [{ role: "user", content }]
      })
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const text = result.content[0].text;

    // Try to parse as JSON, fallback to raw text (Claude fallback)
    try {
      res.status(200).json({ text, parsed: JSON.parse(text) });
    } catch {
      // Extract JSON if Claude added extra text around it
      const match = text.match(/\{[\s\S]*\}/);
      res.status(200).json({ text, parsed: match ? JSON.parse(match[0]) : null });
    }

  } catch (error) {
    console.error("Bedrock error:", error);
    res.status(500).json({ error: error.message });
  }
}
```

---

## 🛠️ Step 3: Use the Proxy in your Frontend
Update `src/services/snaplearnAI.ts` to call your new API instead of Gemini.

```typescript
// Replace call to Gemini with call to your own Serverless function
export async function analyzeImageWithBedrock(imageBase64: string, prompt: string) {
  const response = await fetch('/api/bedrock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageBase64 })
  });
  
  const data = await response.json();
  // Use data.parsed if it's available, otherwise use data.text
  return data.parsed || data.text;
}
```

---

## 🎁 Bonus: Using AWS Polly for the "Kajal" Voice
To get the best Hindi voice in the world, use a similar proxy for Polly.

### `api/polly.js`
```javascript
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

export default async function handler(req, res) {
  const polly = new PollyClient({
    region: "us-east-1",   // ← us-east-1, not ap-south-1
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });

  try {
    const command = new SynthesizeSpeechCommand({
      Text: req.body.text,
      OutputFormat: "mp3",
      VoiceId: "Kajal",
      LanguageCode: "hi-IN",
      Engine: "neural"
    });

    const response = await polly.send(command);
    const chunks = [];
    for await (const chunk of response.AudioStream) chunks.push(chunk);
    const audioBuffer = Buffer.concat(chunks);

    res.setHeader("Content-Type", "audio/mpeg");
    res.status(200).send(audioBuffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## 🚀 Final Recommendation: Switching to Bedrock
**This is an AWS hackathon. Judges are from AWS.**

Using Gemini on demo day = losing points.
**Switch to Bedrock NOW, not later.**
This is literally the most important thing for winning. The hackathon is called "AI for Bharat — Powered by AWS." Gemini is Google. Don't demo Google to AWS judges.

---

### 📝 Summary of Migration Fixes
| Guide Feature | Reality / Update | Why it matters |
| :--- | :--- | :--- |
| **Security Concept** | ✅ Correct | Proxy pattern is required for AWS. |
| **Model ID** | ❌ Old version | Use `claude-sonnet-4-5-20250514-v1:0`. |
| **AWS Region** | ❌ Mumbai (ap-south-1) | Must use `us-east-1` for Bedrock Claude access. |
| **Demo Day Advice** | ❌ Keep Gemini | Switch to Bedrock NOW to impress AWS judges. |
| **Polly Credentials** | ❌ Missing | Added explicit credentials to client config. |
| **Error Handling** | ❌ Fragile | Added regex fallback for JSON parsing. |
