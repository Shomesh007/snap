/**
 * AWS Lambda handler for AWS Bedrock (Amazon Nova Lite)
 *
 * Deploy this behind API Gateway with:
 *   Route: POST /api/bedrock
 *   Integration: Lambda Proxy
 *
 * Required Lambda environment variables:
 *   BEDROCK_MODEL_ID      (defaults to us.amazon.nova-lite-v1:0)
 *   AWS_ACCESS_KEY_ID     (or use an IAM Role — preferred)
 *   AWS_SECRET_ACCESS_KEY (or use an IAM Role — preferred)
 */

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
    region: "us-east-1",
    // If running on Lambda with an IAM execution role, credentials are picked
    // up automatically — you don't need to pass them explicitly.
    // Only add credentials here if you are NOT using an IAM role:
    // credentials: {
    //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // },
});

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
};

export const handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    let body;
    try {
        body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } catch {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: "Invalid JSON body" }),
        };
    }

    try {
        const { prompt, systemPrompt, maxTokens = 1500 } = body;

        const command = new InvokeModelCommand({
            modelId: process.env.BEDROCK_MODEL_ID || "us.amazon.nova-lite-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                inferenceConfig: {
                    maxTokens: maxTokens,
                },
                ...(systemPrompt && { system: [{ text: systemPrompt }] }),
                messages: [{ role: "user", content: [{ text: prompt }] }],
            }),
        });

        const response = await client.send(command);
        const result = JSON.parse(new TextDecoder().decode(response.body));
        const text = result.output?.message?.content?.[0]?.text ?? '';

        let parsed = null;
        try {
            parsed = JSON.parse(text);
        } catch {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                try { parsed = JSON.parse(match[0]); } catch { parsed = null; }
            }
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ text, parsed }),
        };
    } catch (error) {
        console.error("Bedrock Lambda error:", error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
