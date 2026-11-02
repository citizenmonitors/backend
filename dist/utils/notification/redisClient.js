import dotenv from "dotenv";
import { createClient } from "redis";
dotenv.config();
const redisUrl = process.env.REDIS_URL;
const redisClient = createClient({
    ...(redisUrl ? { url: redisUrl } : {}),
    // While disconnected, fail commands immediately instead of queueing them until a
    // reconnect. Queued commands made cached API requests hang with no response.
    disableOfflineQueue: true,
    // Keep idle connections alive (hosted Redis often drops idle sockets).
    pingInterval: 30_000,
    socket: {
        connectTimeout: 5_000,
        reconnectStrategy: (retries) => Math.min(250 * 2 ** retries, 10_000),
    },
});
redisClient.on("error", (err) => console.error("Redis Client Error", err));
async function connectRedis() {
    if (!redisUrl) {
        console.log("REDIS_URL not set; Redis cache disabled for this environment.");
        return;
    }
    try {
        await redisClient.connect();
        console.log("Redis connected successfull");
    }
    catch (err) {
        console.error("Failed to connect to redis", err);
    }
}
void connectRedis();
export default redisClient;
//# sourceMappingURL=redisClient.js.map