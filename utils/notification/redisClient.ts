import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const redisUrl = process.env.REDIS_URL;
const redisClient = createClient({
  ...(redisUrl ? { url: redisUrl } : {}),
});

redisClient.on("error", (err: unknown) =>
  console.error("Redis Client Error", err)
);

async function connectRedis(): Promise<void> {
  if (!redisUrl) {
    console.log("REDIS_URL not set; Redis cache disabled for this environment.");
    return;
  }
  try {
    await redisClient.connect();
    console.log("Redis connected successfull");
  } catch (err: unknown) {
    console.error("Failed to connect to redis", err);
  }
}

void connectRedis();

export default redisClient;

