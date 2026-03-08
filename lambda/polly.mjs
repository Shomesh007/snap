/**
 * AWS Lambda handler for AWS Polly (Hindi TTS — Kajal neural voice)
 *
 * Deploy this behind API Gateway with:
 *   Route: POST /api/polly
 *   Integration: Lambda Proxy
 *   Binary media types: audio/mpeg (add this in API Gateway settings)
 */

import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const polly = new PollyClient({
    region: "us-east-1", // Kajal neural voice is only available in us-east-1
    // credentials auto-picked from IAM execution role on Lambda
});

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    let body;
    try {
        body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } catch {
        return {
            statusCode: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Invalid JSON body" }),
        };
    }

    const { text, voiceId = "Kajal", languageCode = "hi-IN" } = body;

    if (!text) {
        return {
            statusCode: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            body: JSON.stringify({ error: "text is required" }),
        };
    }

    try {
        const command = new SynthesizeSpeechCommand({
            Text: text,
            OutputFormat: "mp3",
            VoiceId: voiceId,
            LanguageCode: languageCode,
            Engine: "neural",
        });

        const response = await polly.send(command);

        // Collect audio chunks
        const chunks = [];
        for await (const chunk of response.AudioStream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        return {
            statusCode: 200,
            headers: {
                ...CORS_HEADERS,
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.length.toString(),
            },
            body: audioBuffer.toString("base64"),
            isBase64Encoded: true, // Required for binary responses via API Gateway
        };
    } catch (error) {
        console.error("Polly Lambda error:", error);
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
