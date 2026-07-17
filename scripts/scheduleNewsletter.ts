import dotenv from "dotenv";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import { connectDB } from "../config/db.ts";
import { sendNewsletterService } from "../services/adminService/podcastService.ts";

dotenv.config();

const NIGERIA_TZ = "Africa/Lagos";

const resolveScheduleTime = (): Date => {
  const fromEnv = process.env.NEWSLETTER_SCHEDULE_AT?.trim();
  if (fromEnv) {
    return new Date(fromEnv);
  }

  const lagosToday = formatInTimeZone(new Date(), NIGERIA_TZ, "yyyy-MM-dd");
  return zonedTimeToUtc(`${lagosToday} 10:00:00`, NIGERIA_TZ);
};

const main = async () => {
  await connectDB();

  const scheduledAt = resolveScheduleTime();
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("Invalid NEWSLETTER_SCHEDULE_AT");
  }

  const formatted = formatInTimeZone(
    scheduledAt,
    NIGERIA_TZ,
    "yyyy-MM-dd HH:mm:ss zzz"
  );

  if (scheduledAt.getTime() <= Date.now()) {
    throw new Error(
      `Schedule time ${formatted} is in the past. Set NEWSLETTER_SCHEDULE_AT to a future time.`
    );
  }

  const result = await sendNewsletterService({
    recipients: "all",
    scheduleTime: scheduledAt.toISOString(),
  });

  console.log("Newsletter scheduled:", result);
  console.log(`Will send at ${formatted} (Nigeria time). Keeping process alive...`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
