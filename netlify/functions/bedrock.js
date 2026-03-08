import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export default async function handler(req, context) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const client = new BedrockRuntimeClient({
        region: "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

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

        // Try to parse as JSON; fallback to raw text
        let parsed = null;
        try {
            parsed = JSON.parse(text);
        } catch {
            // Claude sometimes adds extra text around JSON — extract it
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    parsed = JSON.parse(match[0]);
                } catch {
                    parsed = null;
                }
            }
        }

        return new Response(JSON.stringify({ text, parsed }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Bedrock error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
