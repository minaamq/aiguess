import { type NextRequest, NextResponse } from "next/server"
import redis from "@/lib/redis"

export async function GET(request: NextRequest) {
  try {
    const playerName = request.nextUrl.searchParams.get("name")

    if (!playerName) {
      return NextResponse.json({ error: "Player name is required" }, { status: 400 })
    }
    
    // Get player stats from Redis
    const playerKey = `player:${playerName}`
    const stats = (await redis.hgetall(playerKey)) || {}

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching player stats:", error)
    return NextResponse.json({ error: "Failed to fetch player stats" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { playeruserid, stats } = await request.json()
    console.log("playerKey", stats, "playeruserid",playeruserid)
    if (!playeruserid || !stats) {
      return NextResponse.json({ error: "Invalid player stats data" }, { status: 400 })
    }

    // Save player stats to Redis with persistence
    const playerKey = `player:${playeruserid}`

    // Using hset without expiration ensures data persistence
    await redis.hset(playerKey, stats)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving player stats:", error)
    return NextResponse.json({ error: "Failed to save player stats" }, { status: 500 })
  }
}

