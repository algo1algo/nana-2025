// This service now securely calls our own backend API route, which then calls Gemini.
// This prevents the API key from ever being exposed in the user's browser.

const callGeneratorApi = async (type: 'wish' | 'love'): Promise<string> => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'The server responded with an error.');
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error(`Error fetching from /api/generate for type ${type}:`, error);
        // Return a specific fallback based on the error
        if (type === 'wish') {
            return "לא הצלחנו להביא רעיון, אבל אנחנו בטוחים שהברכה שלך תהיה מושלמת!";
        }
        return "האהבה אליך גדולה מדי למילים, אפילו הבינה המלאכותית נשארה חסרת מילים!";
    }
};


export const generateWishSuggestion = async (): Promise<string> => {
  return callGeneratorApi('wish');
};

export const generateLoveMessage = async (): Promise<string> => {
  return callGeneratorApi('love');
};
