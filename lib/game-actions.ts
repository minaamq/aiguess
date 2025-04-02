"use server"
import type { GeminiSettings } from "@/lib/gemini-types"
import dotenv from "dotenv"

dotenv.config()

// Define the WordDifficulty type to fix errors in Game.tsx
export type WordDifficulty = "easy" | "medium" | "hard" | "expert";

// Function to generate a word and clues using Gemini API.
// Accepts an optional array of usedWords so that the same word is not repeated.
// At the top of your module
const usedWords: string[] = []

export async function generateWordAndClues(
  dynamicDifficulty: string,
  attempt = 1,
): Promise<{ word: string; clues: string[]; riddle: string }> {
  try {
    const apiKey = process.env.API_KEY
    if (!apiKey) {
      throw new Error("Gemini API key is not configured")
    }

    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    // Use the global usedWords array
    const prompt = createGeminiPrompt(dynamicDifficulty, usedWords)
    
    const settings: GeminiSettings = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }

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
    })
    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API error:", errorData)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()

    const { word, clues, riddle } = parseGeminiResponse(data)


    // Check for duplicates (case-insensitive)
    if (usedWords.map((w) => w.toLowerCase()).includes(word.toLowerCase())) {
      console.warn(`Generated word "${word}" is already used. Attempt ${attempt}`)
      if (attempt < 3) {
        return generateWordAndClues(dynamicDifficulty, attempt + 1)
      } else {
        console.warn("Max attempts reached; using fallback word.")
        return {
          word: getDefaultWord(dynamicDifficulty),
          clues: [
            "This word has multiple letters",
            "This word starts with a letter from the English alphabet",
            "This is a commonly used word in everyday language",
          ],
          riddle: "I am a mystery waiting to be solved, what am I?"
        }
      }
    }

    // Add the new word to the global array so it persists
    usedWords.push(word)

    return { word, clues, riddle }
  } catch (error) {
    console.error("Error generating word and clues:", error)
    return {
      word: getDefaultWord(dynamicDifficulty),
      clues: [
        "This word has multiple letters",
        "This word starts with a letter from the English alphabet",
        "This is a commonly used word in everyday language",
      ],
      riddle: "I am a mystery waiting to be solved, what am I?"
    }
  }
}

// Create a prompt for Gemini based on difficulty level and list of used words.
function createGeminiPrompt(dynamicDifficulty: string, usedWords: string[] = []): string {
  // Define word length by difficulty


  // Define vocabulary level by difficulty
  const vocabularyLevel = {
    easy: "simple, universally recognized words that are commonly used in everyday language with minimal ambiguity",
    medium: "words that are familiar yet require a moment of thought, often used in everyday conversation with moderate complexity",
    hard: "words that are less frequently used, may have multiple meanings, and require creative reasoning to deduce",
    expert: "words with layered meanings, subtle nuances, and clever double entendres that challenge even the most astute players",
  }[dynamicDifficulty] || "common words used in everyday conversation";

  // If there are already used words, add an instruction to avoid them.
  const avoidInstruction = usedWords.length ? `Do not choose any of the following words: ${usedWords.join(", ")}.` : ""

  return `
Generate a word guessing game challenge with the following requirements:

1. **Word Selection**: 
   - Choose a single word from one or more of the following categories: General Vocabulary, Nature & Animals, Verbs & Actions, Adjectives & Descriptions, Food & Drink, Objects & Things, Places & Geography, Colors & Numbers, or Emotions & Feelings.
   - The selected word should match the difficulty level: ${vocabularyLevel}. Avoid ${avoidInstruction}

2. **Riddle Creation**:
   - Craft an engaging riddle that subtly hints at the chosen word without revealing it directly.
   - Ensure the riddle sparks curiosity and challenges the player’s thinking.

3. **Progressive Clues**:
   - Generate between 3 to 5 clues that progressively reveal more about the word.
   - Arrange the clues so that they move from a very subtle hint to a nearly revealing description.

4. **Output Format**:
   - Format your response as a valid JSON object with the following structure:
{
  "word": "the chosen word",
  "riddle": "a clever riddle that hints at the word",
  "clues": [
    "first clue - subtle hint",
    "second clue - more specific hint",
    "third clue - more direct hint",
    "fourth clue - very direct hint",
    "fifth clue - almost gives away the answer"
  ]
}

Requirements:
- The riddle must be creative and engaging, avoiding any obvious clues.
- Clues should progress in specificity to support a gradual reveal.
- Do not include any additional text or explanations outside of this JSON structure.
`
}

// Parse the Gemini API response to extract word, riddle, and clues.
function parseGeminiResponse(responseData: any): { word: string; clues: string[]; riddle: string } {
  try {
    // Extract the text content from the response
    const content = responseData.candidates?.[0]?.content
    if (!content) {
      throw new Error("Invalid response format")
    }

    const text = content.parts?.[0]?.text || ""

    // Find the JSON object within the text (in case there's any extra content)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON object found in response")
    }
    const jsonData = JSON.parse(jsonMatch[0])

    // Validate the response format
    if (!jsonData.word || !Array.isArray(jsonData.clues) || jsonData.clues.length === 0 || !jsonData.riddle) {
      throw new Error("Invalid data format in response")
    }

    return {
      word: jsonData.word.toLowerCase().trim(),
      clues: jsonData.clues.map((clue: string) => clue.trim()),
      riddle: jsonData.riddle.trim()
    }
  } catch (error) {
    console.error("Error parsing Gemini response:", error)
    throw new Error("Failed to parse response from Gemini API")
  }
}

// Fallback words if API fails.
function getDefaultWord(difficulty: string): string {
  const defaultWords: Record<string, string> = {
    easy: "cat",
    medium: "apple",
    hard: "elephant",
    expert: "encyclopedia",
  }

  return defaultWords[difficulty] || "puzzle"
}