import { GoogleGenAI, Type } from "@google/genai";

// Fix: Per coding guidelines, the API key must be obtained exclusively from the environment variable `process.env.API_KEY`. The fallback logic has been removed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        answer: {
            type: Type.STRING,
            description: "A detailed answer to the user's question based only on the provided context.",
        },
        sources: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
            description: "The exact sentences from the context that directly support the answer.",
        },
    },
    required: ["answer", "sources"],
};


export async function getAnswerFromContext(context: string, question: string): Promise<{ answer: string; sources: string[] }> {
    const prompt = `
    Context:
    ---
    ${context}
    ---

    Question: ${question}

    Based strictly on the provided context, answer the question. Also, identify the exact sentences from the context that support your answer.
    If you cannot answer the question based on the context, state that in the 'answer' field and provide an empty array for 'sources'.
    Do not use any information outside of the provided context.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            },
        });

        const jsonText = response.text.trim();
        // Basic validation in case the model doesn't return perfect JSON
        if (!jsonText.startsWith("{") || !jsonText.endsWith("}")) {
            // If the response is not a JSON object, treat it as a plain text answer.
            return { answer: jsonText, sources: [] };
        }
        
        const parsedResponse = JSON.parse(jsonText);
        
        if (typeof parsedResponse.answer === 'string' && Array.isArray(parsedResponse.sources)) {
            return {
                answer: parsedResponse.answer,
                sources: parsedResponse.sources.filter((s: unknown) => typeof s === 'string'),
            };
        } else {
             throw new Error("Invalid JSON structure in AI response.");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get response from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
}
