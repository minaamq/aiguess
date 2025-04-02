import { Redis } from "@upstash/redis"


// Initialize Redis client from environment variables
// All data stored with this client will persist indefinitely unless explicitly deleted
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})


// Helper function to ensure data persistence when needed
export const persistentSet = async (key: string, value: any) => {
  // Using set without an expiration time ensures the data persists indefinitely
  return await redis.set(key, value)
}

export default redis

