// Client-side cookie utility functions

export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined

  const cookies = document.cookie.split(";")
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    // Check if this cookie string begins with the name we want
    if (cookie.substring(0, name.length + 1) === name + "=") {
      return decodeURIComponent(cookie.substring(name.length + 1))
    }
  }
  return undefined
}

export function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") return

  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

