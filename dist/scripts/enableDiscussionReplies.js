/**
 * One-time helper: turn on discussion reply notifications for users who still
 * have the old schema default (false). Safe to re-run; only updates false → true.
 *
 * Run: npx tsx scripts/enableDiscussionReplies.ts
 */
import "dotenv/config";
import { connectDB } from "../config/db.js";
import CompletedUser from "../models/CompletedUser.js";
const run = async () => {
    await connectDB();
    const result = await CompletedUser.updateMany({ "notifications.mobile.discussionReplies": false }, { $set: { "notifications.mobile.discussionReplies": true } });
    console.log(`Updated ${result.modifiedCount} user(s) to discussionReplies=true (matched ${result.matchedCount}).`);
    process.exit(0);
};
run().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=enableDiscussionReplies.js.map