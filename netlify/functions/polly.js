import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

export default async function handler(req, context) {
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

    const { text, voiceId = "Kajal", languageCode = "hi-IN" } = body;

    if (!text) {
        return new Response(JSON.stringify({ error: "text is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const polly = new PollyClient({
        region: "us-east-1", // Kajal neural voice is available in us-east-1
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    try {
        const command = new SynthesizeSpeechCommand({
            Text: text,
            OutputFormat: "mp3",
            VoiceId: voiceId,
            LanguageCode: languageCode,
            Engine: "neural",
        });

        const response = await polly.send(command);

        // Collect all audio chunks from the stream
        const chunks = [];
        for await (const chunk of response.AudioStream) {
            chunks.push(chunk);
        }

        const audioBuffer = Buffer.concat(chunks);

        return new Response(audioBuffer, {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error("Polly error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
