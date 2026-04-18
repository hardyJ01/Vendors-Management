import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: 'AIzaSyC0MdHFpxoP5hsAr_vCB3LjXvCxx-2BPH0'});

/**
 * Sends a structured prompt to Google GenAI and returns the parsed JSON response.
 * All AI features in this project funnel through this single function.
 *
 * @param {string} systemPrompt  - Role / instructions for Google GenAI
 * @param {string} userPrompt    - The actual data / question
 * @returns {Object}             - Parsed JSON object from Google GenAI
 */
const askGoogleGenAI = async (systemPrompt, userPrompt) => {
    const message = await client.messages.create({
        model: "gemini-3-flash-preview",
        messages: [{ role: "user", content: userPrompt }],
        system: systemPrompt,
    });

    // Google GenAI returns an array of content blocks; grab the first text block
    const rawText = message.content.find((block) => block.type === "text")?.text;

    if (!rawText) {
        throw new Error("Google GenAI returned an empty response");
    }

    // Strip markdown code fences if Google GenAI wraps output in ```json ... ```
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        throw new Error(`Google GenAI response was not valid JSON: ${rawText}`);
    }
};

export { askGoogleGenAI };