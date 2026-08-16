interface ChatMessagePart {
  text: string;
}

export interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: ChatMessagePart[];
}

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Backend service for managing communication with Google Gemini API
 */
export class GeminiAiService {
  private static getApiKey(): string {
    const key = process.env['GEMINI_API_KEY'];
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is not configured on the backend server.');
    }
    return key;
  }

  /**
   * Sends user prompt with history context to Gemini API
   */
  static async generateResponse(prompt: string, history: HistoryMessage[] = []): Promise<string> {
    try {
      const apiKey = this.getApiKey();

      // Map chat history roles from frontend ('assistant' -> 'model') to Gemini API specs
      const contents: GeminiChatMessage[] = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Append the current active prompt to the thread
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error details:', errorText);
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as any;
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        throw new Error('No candidate content text found in Gemini response.');
      }

      return reply;
    } catch (err: any) {
      console.error('GeminiService Error:', err);
      throw err;
    }
  }
}
