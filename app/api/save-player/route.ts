// app/api/save-player/route.ts
import { type NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { playerName } = await request.json();

    // Validate the player name
    if (!playerName || typeof playerName !== "string" || !playerName.trim()) {
      return NextResponse.json({ error: "Invalid player name" }, { status: 400 });
    }
    
    // Check for an existing unique browser identifier; if not present, generate one.
    let userId = request.cookies.get("userId")?.value;
    if (!userId) {
      userId = uuidv4();
    }

    // Save player data in Redis using the unique userId as key.
    await redis.hset(`player:${userId}`, { playerName: playerName.trim() });

    // Create response and set cookies with a far-future expiration.
    const response = NextResponse.json({ success: true });
    response.cookies.set("playerName", playerName.trim(), {
      expires: new Date('9999-12-31T23:59:59Z'),
      path: "/",
    });
    response.cookies.set("userId", userId, {
      expires: new Date('9999-12-31T23:59:59Z'),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error saving player:", error);
    return NextResponse.json({ error: "Failed to save player" }, { status: 500 });
  }
}
