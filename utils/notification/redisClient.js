import {createClient} from 'redis';

const redisClient = createClient({
  url: "redis://red-cqtphi0gph6c739v3e6g:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err))

await redisClient.connect();

export default redisClient;
