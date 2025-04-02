//app/api/get-player
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const playerName = request.cookies.get("playerName")?.value || null
    const userId = request.cookies.get("userId")?.value || null
    console.log("userId:",userId, "playername:",playerName)
    return NextResponse.json({ 
      playerName, 
      userId, 
      success: true 
      
    })
   
  } catch (error) {
    console.error("Error getting player:", error)
    return NextResponse.json({ 
      playerName: null, 
      error: "Failed to get player", 
      success: false 
    })
  }
}
