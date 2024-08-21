import {createClient} from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err))


async function connectRedis(){
  try {
    await redisClient.connect();
    console.log("Redis connected successfull");
    
  } catch (err) {
    console.error("Failed to connect to redis", err);
  }
}
connectRedis();

export default redisClient;
