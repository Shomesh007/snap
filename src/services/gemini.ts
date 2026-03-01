import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getGemini = () => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeImage = async (base64Image: string, prompt: string) => {
  const ai = getGemini();
  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } },
          { text: prompt }
        ]
      }
    ]
  });
  return result.text;
};

export const chatWithGemini = async (messages: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const ai = getGemini();
  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: messages,
  });
  return result.text;
};
