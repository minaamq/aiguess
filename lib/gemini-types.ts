// Type definitions for Gemini API
export interface GeminiSettings {
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
  }
  
  export interface GeminiResponse {
    candidates: {
      content: {
        parts: {
          text: string;
        }[];
      };
      finishReason: string;
      index: number;
      safetyRatings: {
        category: string;
        probability: string;
      }[];
    }[];
    promptFeedback: {
      safetyRatings: {
        category: string;
        probability: string;
      }[];
    };
  }