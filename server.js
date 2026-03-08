/**
 * SnapLearn Local Dev Server
 *
 * Pure AWS Bedrock (Amazon Nova Lite) — no Netlify needed.
 * Runs the same logic as lambda/bedrock.mjs and lambda/polly.mjs,
 * served as Express routes so Vite can proxy /api/* to it.
 *
 * Usage:
 *   node server.js          (in one terminal)
 *   npm run dev             (in another terminal)
 *
 * Or use the combined script:
 *   npm run dev:aws
 */

import 'dotenv/config';
import express from 'express';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';

const app = express();
app.use(express.json({ limit: '50mb' })); // images can be large

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    const origin = req.headers.origin || '';
    // Allow any localhost port (Vite uses 5173, CRA uses 3000, etc.)
    if (origin.startsWith('http://localhost')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// ── AWS clients (credentials from .env) ─────────────────────────────────────
const region = process.env.AWS_REGION || 'us-east-1';

const bedrock = new BedrockRuntimeClient({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const polly = new PollyClient({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const rekognition = new RekognitionClient({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// ── POST /api/rekognition ────────────────────────────────────────────────────
app.post('/api/rekognition', async (req, res) => {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
    }

    try {
        console.log('[Rekognition Request] Detecting labels...');
        const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const command = new DetectLabelsCommand({
            Image: { Bytes: imageBuffer },
            MaxLabels: 5,
            MinConfidence: 70,
        });

        const response = await rekognition.send(command);
        const labels = response.Labels?.slice(0, 3).map(label => label.Name) || [];
        const detectedObjects = labels.join(', ') || 'interesting object';

        console.log('[Rekognition Success] Detected:', detectedObjects);
        return res.json({ detectedObjects, source: 'rekognition' });
    } catch (err) {
        console.error('[Rekognition Error]', err.message);
        // Return a fallback so the client can still ask Nova for a generic observation
        return res.json({ detectedObjects: null, source: 'fallback', error: err.message });
    }
});

// ── POST /api/vision — Azure GPT-4 Vision (single or multi-image) ───────────
app.post('/api/vision', async (req, res) => {
    // extraImages: optional array of base64 strings (no data: prefix needed) for multi-photo calls
    const { imageBase64, extraImages, prompt, systemPrompt, maxTokens = 500 } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
    }

    const azureKey = process.env.AZURE_OPENAI_API_KEY;
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, '');
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview';

    if (!azureKey || !azureEndpoint || !deployment) {
        return res.status(500).json({ error: 'Azure OpenAI not configured' });
    }

    // Ensure proper data URL format for Azure (only when image is provided)
    const imageUrl = imageBase64
        ? (imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`)
        : null;

    const url = `${azureEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    // Build content: text + primary image + any extra images (Discovery Challenge sends 5)
    const hasImages = !!imageBase64 || (Array.isArray(extraImages) && extraImages.length > 0);
    const imageContent = hasImages ? [
        { type: 'text', text: prompt },
        ...(imageUrl ? [{ type: 'image_url', image_url: { url: imageUrl, detail: 'low' } }] : []),
        ...(Array.isArray(extraImages) ? extraImages.map(img => ({
            type: 'image_url',
            image_url: { url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`, detail: 'low' },
        })) : []),
    ] : prompt;

    const messages = [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: imageContent },
    ];

    if (hasImages) console.log(`[Azure Vision] Images: 1 primary + ${Array.isArray(extraImages) ? extraImages.length : 0} extra`);

    try {
        console.log('[Azure Vision] Calling GPT-4 Vision...');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': azureKey,
            },
            body: JSON.stringify({
                messages,
                max_completion_tokens: maxTokens,
                temperature: 1,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[Azure Vision Error]', response.status, errText);
            return res.status(response.status).json({ error: errText });
        }

        const data = await response.json();

        // ── Deep logging ─────────────────────────────────────────────────────
        console.log('[Azure Vision] Full response:', JSON.stringify(data, null, 2));
        console.log('[Azure Vision] finish_reason:', data.choices?.[0]?.finish_reason);
        console.log('[Azure Vision] message:', JSON.stringify(data.choices?.[0]?.message));
        console.log('[Azure Vision] content_filter_results:', JSON.stringify(data.choices?.[0]?.content_filter_results ?? data.prompt_filter_results));
        // ─────────────────────────────────────────────────────────────────────

        const choice = data.choices?.[0];
        const finishReason = choice?.finish_reason;

        // content_filter means Azure blocked the response
        if (finishReason === 'content_filter') {
            console.warn('[Azure Vision] Content filtered — retrying as text-only...');
            // Fall back: call again without image
            const textOnlyMessages = [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                { role: 'user', content: prompt },
            ];
            const retryRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api-key': azureKey },
                body: JSON.stringify({ messages: textOnlyMessages, max_completion_tokens: maxTokens, temperature: 1 }),
            });
            const retryData = await retryRes.json();
            const retryText = retryData.choices?.[0]?.message?.content ?? '';
            console.log('[Azure Vision] Retry text-only response:', retryText.slice(0, 200));
            let retryParsed = null;
            try { const m = retryText.match(/\{[\s\S]*\}/); if (m) retryParsed = JSON.parse(m[0]); } catch {}
            return res.json({ text: retryText, parsed: retryParsed });
        }

        const text = choice?.message?.content ?? '';
        console.log('[Azure Vision Success] Response text:', text.slice(0, 300));

        // Try to parse JSON
        let parsed = null;
        try {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) parsed = JSON.parse(match[0]);
        } catch { /* not JSON */ }

        return res.json({ text, parsed });
    } catch (err) {
        console.error('[Azure Vision Error]', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// ── POST /api/bedrock ─────────────────────────────────────────────────────────
app.post('/api/bedrock', async (req, res) => {
    const {
        prompt,
        systemPrompt,
        maxTokens = 1500,
    } = req.body;

    console.log('[Bedrock Request]');
    console.log('  Model:', process.env.BEDROCK_MODEL_ID);
    console.log('  Prompt length:', prompt?.length || 0);
    console.log('  System prompt:', systemPrompt ? 'yes' : 'no');
    console.log('  Max tokens:', maxTokens);

    // Text-only request for Amazon Nova
    const body = {
        inferenceConfig: {
            maxTokens: maxTokens,
        },
        messages: [{ role: 'user', content: [{ text: prompt }] }],
        ...(systemPrompt && { system: [{ text: systemPrompt }] }),
    };

    console.log('[Bedrock Body]', JSON.stringify(body, null, 2).slice(0, 500));

    try {
        const command = new InvokeModelCommand({
            modelId: process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-lite-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(body),
        });

        console.log('[Sending to Bedrock]');
        const response = await bedrock.send(command);
        console.log('[Bedrock Response received]');
        
        const decodedBody = new TextDecoder().decode(response.body);
        console.log('[Decoded body (raw)]', decodedBody);
        
        const responseBody = JSON.parse(decodedBody);
        console.log('[Parsed JSON structure]', Object.keys(responseBody));
        console.log('[Full parsed response]', JSON.stringify(responseBody, null, 2));
        
        const text = responseBody.output?.message?.content?.[0]?.text ?? '';
        console.log('[Extracted text]', text);
        console.log('[Text check - isEmpty?]', text.length === 0);

        // Try to parse JSON from text
        let parsed = null;
        try {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) parsed = JSON.parse(match[0]);
        } catch { /* not JSON — that's fine */ }

        console.log('[Bedrock Success]');
        return res.json({ text, parsed });
    } catch (err) {
        console.error('[Bedrock Error Full]', err);
        console.error('[Bedrock Error Message]', err.message);
        console.error('[Bedrock Error Stack]', err.stack);
        return res.status(500).json({ error: err.message });
    }
});

// ── POST /api/polly ───────────────────────────────────────────────────────────
app.post('/api/polly', async (req, res) => {
    const {
        text,
        voiceId = process.env.POLLY_VOICE_ID || 'Kajal',
        languageCode = process.env.POLLY_LANGUAGE_CODE || 'hi-IN',
        outputFormat = 'mp3',
        textType = 'text', // 'text' or 'ssml'
    } = req.body;

    if (!text) return res.status(400).json({ error: 'text is required' });

    try {
        const command = new SynthesizeSpeechCommand({
            Text: text.slice(0, 6000), // SSML can be longer
            TextType: textType,
            VoiceId: voiceId,
            LanguageCode: languageCode,
            OutputFormat: outputFormat,
            Engine: 'neural',
        });

        const response = await polly.send(command);

        // Stream audio back as mp3
        const chunks = [];
        for await (const chunk of response.AudioStream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.length);
        return res.send(audioBuffer);
    } catch (err) {
        console.error('[Polly Error]', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        region,
        bedrockModel: process.env.BEDROCK_MODEL_ID,
        pollyVoice: process.env.POLLY_VOICE_ID,
    });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`\n✅ SnapLearn Dev Server running on http://localhost:${PORT}`);
    console.log(`   Bedrock model : ${process.env.BEDROCK_MODEL_ID ?? '(not set)'}`);
    console.log(`   Polly voice   : ${process.env.POLLY_VOICE_ID ?? '(not set)'}`);
    console.log(`   AWS region    : ${region}`);
    console.log(`\n   Now run: npm run dev  (in a second terminal)\n`);
});
