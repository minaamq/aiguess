import redis from "./redis"

async function testRedis() {
  await redis.set("testKey", "Hello Upstash!")
  const value = await redis.get("testKey")
  console.log("Redis Value:", value)
}

testRedis()