// IMPORTANT: This file should be placed in a new folder named `api` at the root of your project.
// The file path should be: /api/generate.ts

import { GoogleGenAI } from "@google/genai";

// This is a Vercel Serverless Function, which runs on a server, not in the browser.
// It can safely use environment variables.
const API_KEY = process.env.API_KEY;

// Define the structure of the incoming request body
interface RequestBody {
    type: 'wish' | 'love';
}

// Define the prompts in a structured way
const prompts = {
    wish: "כתוב ברכת יום הולדת קצרה, חמה ומכל הלב לחברה יקרה בשם שירי. הברכה צריכה להיות באורך של משפט אחד או שניים, בסגנון אישי ומרגש. כתוב בעברית.",
    love: "כתוב מסר אהבה פשוט וחם לשירי. המסר צריך להיות קצר, ישיר ומלא אהבה, ולהביע כמה היא חשובה ומוערכת. כתוב בעברית."
};

const configs = {
    wish: { temperature: 0.8, topK: 40 },
    love: { temperature: 0.9, topP: 0.95 }
};

export const POST = async (req: Request) => {
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: 'API key not configured on server.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    try {
        const { type } = (await req.json()) as RequestBody;

        if (!type || !prompts[type]) {
            return new Response(JSON.stringify({ error: 'Invalid request type.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompts[type],
            config: configs[type]
        });

        const text = response.text.trim();
        
        return new Response(JSON.stringify({ text }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error("Error in serverless function:", error);
        return new Response(JSON.stringify({ error: 'Failed to generate content.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

// Vercel Edge Runtime configuration
export const config = {
    runtime: 'edge',
};
