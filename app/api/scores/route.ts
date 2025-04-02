import { type NextRequest, NextResponse } from "next/server"
import redis, { persistentSet } from "@/lib/redis"

export async function GET() {
  try {
    // Get all scores from Redis
    const scoresRaw = await redis.get("leaderboard");

    // Handle different possible cases
    let scores = [];
    if (scoresRaw) {
      try {
        scores = typeof scoresRaw === 'string' ? JSON.parse(scoresRaw) : scoresRaw;
      } catch (parseError) {
        console.error("Error parsing scores from Redis:", parseError);
        // Reset to empty array if parsing fails
        scores = [];
      }
    }

    return NextResponse.json(scores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const scoreData = await request.json();

    // Validate the score data
    if (!scoreData || !scoreData.name || typeof scoreData.score !== "number") {
      return NextResponse.json({ error: "Invalid score data" }, { status: 400 });
    }

    // Get existing scores with proper error handling
    let existingScores = [];
    const existingScoresRaw = await redis.get("leaderboard");
    if (existingScoresRaw) {
      try {
        existingScores = typeof existingScoresRaw === 'string' 
          ? JSON.parse(existingScoresRaw) 
          : existingScoresRaw;
      } catch (parseError) {
        console.error("Error parsing existing scores:", parseError);
        existingScores = [];
      }
    }

    // Ensure existingScores is an array
    if (!Array.isArray(existingScores)) {
      existingScores = [];
    }

    // Add new score
    const updatedScores = [...existingScores, scoreData];

    // Save back to Redis with persistence (no expiration)
    await persistentSet("leaderboard", JSON.stringify(updatedScores));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving score:", error);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}