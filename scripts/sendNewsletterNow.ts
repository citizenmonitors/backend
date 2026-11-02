import dotenv from "dotenv";
import { connectDB } from "../config/db.ts";
import { sendNewsletterService } from "../services/adminService/podcastService.ts";

dotenv.config();

const main = async () => {
  await connectDB();

  const result = await sendNewsletterService({
    recipients: "all",
  });

  console.log("Newsletter send result:", result);
  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
