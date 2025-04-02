import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path is an API route that needs protection
  if (path.startsWith("/api/") &&
  !path.startsWith("/api/save-player") &&
  !path.startsWith("/api/get-player")) {
    // Get the player name from the request headers or cookies
    const playerName = request.cookies.get("playerName")?.value

    // If no player name is found, redirect to the home page
    if (!playerName) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
  const { pathname } = request.nextUrl
  
  // Only apply to /game and other protected routes
  if (pathname.startsWith('/game')) {
    // Check if playerName cookie exists
    const playerName = request.cookies.get('playerName')?.value

    // If no playerName cookie, redirect to home page
    if (!playerName) {
      const url = new URL('/', request.url)
      return NextResponse.redirect(url)
    }
  }


  return NextResponse.next()
}

// Configure the paths that should be matched by this middleware
export const config = {
  matcher: ["/api/:path*", "/game", "/leaderboard", '/'],
}

