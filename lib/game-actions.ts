"use server"
import { GeminiSettings } from "@/lib/gemini-types";
import dotenv from 'dotenv'; 

dotenv.config();

// Function to generate a word and clues using Gemini API.
// Accepts an optional array of usedWords so that the same word is not repeated.
// At the top of your module
let usedWords: string[] = [];

export async function generateWordAndClues(
  difficulty: string,
  attempt: number = 1
): Promise<{ word: string; clues: string[] }> {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured");
    }

    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    // Use the global usedWords array
    const prompt = createGeminiPrompt(difficulty, usedWords);
   
    const settings: GeminiSettings = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: settings,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }
    const data = await response.json();

    const { word, clues } = parseGeminiResponse(data);

    // Check for duplicates (case-insensitive)
    if (usedWords.map(w => w.toLowerCase()).includes(word.toLowerCase())) {
      console.warn(`Generated word "${word}" is already used. Attempt ${attempt}`);
      if (attempt < 3) {
        return generateWordAndClues(difficulty, attempt + 1);
      } else {
        console.warn("Max attempts reached; using fallback word.");
        return {
          word: getDefaultWord(difficulty),
          clues: [
            "This word has multiple letters",
            "This word starts with a letter from the English alphabet",
            "This is a commonly used word in everyday language",
          ],
        };
      }
    }

    // Add the new word to the global array so it persists
    usedWords.push(word);

    return { word, clues };
  } catch (error) {
    console.error("Error generating word and clues:", error);
    return {
      word: getDefaultWord(difficulty),
      clues: [
        "This word has multiple letters",
        "This word starts with a letter from the English alphabet",
        "This is a commonly used word in everyday language",
      ],
    };
  }
}



// Create a prompt for Gemini based on difficulty level and list of used words.
function createGeminiPrompt(difficulty: string, usedWords: string[] = []): string {
  // Define word length by difficulty
  const wordLength = {
    easy: "3-4",
    medium: "5-7",
    hard: "8-10",
    expert: "11+",
  }[difficulty] 

  // Define vocabulary level by difficulty
  const vocabularyLevel = {
    easy: "simple, everyday words appropriate for young children",
    medium: "common words used in everyday conversation",
    hard: "more complex words that might require some thought",
    expert: "advanced vocabulary, possibly technical or academic terms",
  }[difficulty] ;

  // If there are already used words, add an instruction to avoid them.
  const avoidInstruction = usedWords.length
    ? ` Do not choose any of the following words: ${usedWords.join(", ")}.`
    : "";
  return `
Generate a word guessing game challenge with the following requirements:

1. Select a single word that is approximately ${wordLength} alphabets long and falls into the category of ${vocabularyLevel}. ${avoidInstruction}
2. Create 3 unique, increasingly helpful clues about this word.
3. The first clue should be subtle and give only a hint.
4. The second clue should provide more specific information.
5. The third clue should be quite direct, almost giving away the answer.

Format your response as a valid JSON object with the following structure:
{
  "word": "the chosen word",
  "clues": [
    "first clue - subtle hint",
    "second clue - more specific information",
    "third clue - very direct hint"
  ]
}

Do not include any explanations or additional text outside of this JSON structure.
`;
}

// Parse the Gemini API response to extract word and clues.
function parseGeminiResponse(responseData: any): { word: string; clues: string[] } {
  try {
    // Extract the text content from the response
    const content = responseData.candidates?.[0]?.content;
    if (!content) {
      throw new Error("Invalid response format");
    }

    const text = content.parts?.[0]?.text || "";
    console.log(text)
    // Find the JSON object within the text (in case there's any extra content)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }
    const jsonData = JSON.parse(jsonMatch[0]);

    // Validate the response format
    if (!jsonData.word || !Array.isArray(jsonData.clues) || jsonData.clues.length === 0) {
      throw new Error("Invalid data format in response");
    }

    return {
      word: jsonData.word.toLowerCase().trim(),
      clues: jsonData.clues.map((clue: string) => clue.trim()),
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to parse response from Gemini API");
  }
}

// Fallback words if API fails.
function getDefaultWord(difficulty: string): string {
  const defaultWords: Record<string, string> = {
    easy: "cat",
    medium: "apple",
    hard: "elephant",
    expert: "encyclopedia",
  };

  return defaultWords[difficulty] || "puzzle";
}
