import { type NextRequest, NextResponse } from "next/server"
import redis from "@/lib/redis"

// This endpoint can be called periodically via a cron job to create data backups
export async function GET(request: NextRequest) {
  try {
    // Only allow authorized access (you can implement proper auth)
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all important data
    const leaderboard = (await redis.get("leaderboard")) || "[]"
    const players = (await redis.smembers("players")) || []

    // Create a backup timestamp
    const timestamp = new Date().toISOString()

    // Store backup in Redis with timestamp (creates a history of backups)
    await redis.hset(`backup:${timestamp}`, {
      leaderboard,
      players: JSON.stringify(players),
      timestamp,
    })

    // Keep track of all backups
    await redis.sadd("backups", timestamp)

    return NextResponse.json({
      success: true,
      message: "Backup created successfully",
      timestamp,
    })
  } catch (error) {
    console.error("Error creating backup:", error)
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 })
  }
}

