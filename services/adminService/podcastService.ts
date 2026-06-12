import { sendEmail } from "../../config/email.ts";
import {
  getNewsletterUnsubscribeUrl,
  newsLetterTemplate72HoursDemocracyWhatNext,
  podcastNotificationTemplate,
} from "../../config/emailTemplates.ts";
import schedule from "node-schedule";
import { utcToZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import mongoose from "mongoose";
import type { Types } from "mongoose";
import AdminLog from "../../models/admin/AdminLog.ts";
import Podcast from "../../models/admin/Podcast.ts";
import CompletedUser from "../../models/CompletedUser.ts";
import { invalidateAllMobileReadCaches } from "../../utils/cache.ts";
import { dispatchMobileNotification } from "../mobile/notificationDispatchService.ts";

type Id = string | Types.ObjectId;
type RecipientRole = "all" | "super-admin" | "admin" | "observer" | "volunteer";
type MobileDispatchRole =
  | "all"
  | "super-admin"
  | "admin"
  | "observer"
  | "volunteer"
  | "public-viewer";

const toMobileDispatchRecipients = (
  recipients: RecipientRole[]
): MobileDispatchRole[] => {
  if (recipients.includes("all")) return ["all"];
  return recipients as MobileDispatchRole[];
};

const dispatchNewsletterMobileInbox = async (input: {
  recipients: RecipientRole[];
  title: string;
  info?: string;
}) => {
  const mobileRecipients = toMobileDispatchRecipients(input.recipients);
  if (mobileRecipients.length === 0) return;

  await dispatchMobileNotification({
    type: "newsletter",
    preferenceKey: "newsletter",
    body: input.title,
    info: input.info ?? "",
    recipients: mobileRecipients,
  });
};
type UserEmailOnly = { email: string };
type PodcastReadByShape = { readBy?: Types.ObjectId[] };

const toObjectId = (id: Id): Types.ObjectId =>
  id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);

const requireId = (id: Id | undefined, field: string): Id => {
  if (!id) throw new Error(`${field} is required`);
  return id;
};


const normalizeRecipients = (
  recipients: RecipientRole[] | RecipientRole
): RecipientRole[] => {
  const normalized = typeof recipients === "string" ? [recipients] : recipients;
  if (normalized.includes("all") && normalized.length > 1) {
    throw new Error("Cannot combine 'all' with specific roles. Choose either 'all' or specific roles.");
  }
  return normalized;
};

type SendPodcastInput = {
  title: string;
  content: string;
  recipients: RecipientRole[] | RecipientRole;
  adminId: Id | undefined;
};
type EditPodcastInput = {
  podcastId: Id;
  updates: {
    title?: string;
    content?: string;
    recipients?: RecipientRole[] | RecipientRole;
  };
  adminId: Id | undefined;
};
type SendNewsletterInput = {
  recipients: RecipientRole[] | RecipientRole;
  scheduleTime?: string | Date;
};


export const sendPodcastService = async ({
  title,
  content,
  recipients,
  adminId,
}: SendPodcastInput) => {
  const senderId = requireId(adminId, "adminId");
  const normalizedRecipients = normalizeRecipients(recipients);

  const podcast = await Podcast.create({
    title,
    content,
    recipients: normalizedRecipients,
    sender: senderId,
  });

  const userQueries = normalizedRecipients.map((role) => {
    const query: Record<string, unknown> = { "notifications.email.inbox": true };
    if (role !== "all") {
      query.role = role;
    }
    return CompletedUser.find(query, "email").lean();
  });

  const usersGroups = await Promise.all(userQueries);
  const allUserEmails = usersGroups.flat().map((user) => user.email);
  // const allUserEmails = ["yunusmustapha2@gmail.com"];
  const totalTargetedUsers = allUserEmails.length;

  const htmlcontent = podcastNotificationTemplate(title, content);

  const emailPromises = allUserEmails.map((email) =>
    sendEmail({
      to: email,
      subject: `New Podcast: ${title}`,
      htmlbody: htmlcontent,
    }).catch((err) => {
      console.error(`Failed to send email to ${email}:`, err);
    })
  );

  await Promise.all(emailPromises);

  await dispatchNewsletterMobileInbox({
    recipients: normalizedRecipients,
    title: `New podcast: ${title}`,
    info: content.slice(0, 200),
  });

  await AdminLog.create({
    admin: senderId,
    action: "Sent Podcast",
    details: {
      title,
      contentPreview: content.slice(0, 50),
      recipients: normalizedRecipients,
      estimatedRecipients: totalTargetedUsers,
    },
    timestamp: new Date(),
  });

  await invalidateAllMobileReadCaches();

  return podcast;
};

export const editPodcastService = async ({
  podcastId,
  updates,
  adminId,
}: EditPodcastInput) => {
  const editorId = requireId(adminId, "adminId");
  const { title, content, recipients, } = updates;
  const updateFields: {
    title?: string;
    content?: string;
    recipients?: RecipientRole[];
  } = {};

  if (title) updateFields.title = title;
  if (content) updateFields.content = content;

  if (recipients) {
    updateFields.recipients = normalizeRecipients(recipients);
  }

  const podcast = await Podcast.findByIdAndUpdate(
    podcastId,
    { $set: updateFields },
    { new: true }
  );

  if (!podcast) throw new Error("Podcast not found");

  await AdminLog.create({
    admin: editorId,
    action: "Edited Podcast",
    details: {
      podcastId,
      updates: updateFields,
    },
    timestamp: new Date(),
  });

  await invalidateAllMobileReadCaches();

  return podcast;
};

export const getAllPodcastsService = async () => {
  return await Podcast.find().sort({ createdAt: -1 });
};

export const getSinglePodcastService = async (id: Id, userId: Id | undefined) => {
  const currentUserId = requireId(userId, "userId");
  const user = await CompletedUser.findById(currentUserId).lean();
  if (!user || !user.role) throw new Error("User not found or role missing");

  const role = user.role.toLowerCase();

  const podcastWithoutReadBy = await Podcast.findById(id).lean();
  if (!podcastWithoutReadBy) throw new Error("Podcast not found");

  // Check if user's role is among recipients
  if (!podcastWithoutReadBy.recipients.includes("all") && !podcastWithoutReadBy.recipients.includes(role)) {
    throw new Error("You do not have access to this podcast.");
  }

  // Exclude readBy before returning
  const { readBy, ...podcast } = podcastWithoutReadBy;
  return podcast;
};

export const deletePodcastService = async (id: Id, adminId: Id | undefined) => {
  const deleterId = requireId(adminId, "adminId");
  const deleted = await Podcast.findByIdAndDelete(id);
  if (!deleted) throw new Error("Podcast not found");
  // Log the admin action
  await AdminLog.create({
    admin: deleterId,
    action: "Delete Podcast",
    details: {
      podcastId: id,
    },
    timestamp: new Date(),
  });
  await invalidateAllMobileReadCaches();
  return { message: "Podcast deleted successfully" };
};

export const getUserInboxService = async (userId: Id | undefined) => {
  const currentUserId = requireId(userId, "userId");
  const user = await CompletedUser.findById(currentUserId).lean();
  if (!user || !user.role) throw new Error("User not found or role missing");

  const role = user.role.toLowerCase();

  const inbox = await Podcast.find({
    recipients: { $in: ["all", role] },
  })
    .sort({ createdAt: -1 })
    .lean();

  const podcast = inbox.map((inboxWithReadStatus) => {
    const doc = inboxWithReadStatus as typeof inboxWithReadStatus & PodcastReadByShape;
    const read = doc.readBy
      ? doc.readBy.some((readerId) => readerId.toString() === currentUserId.toString())
      : false;

    const { readBy, ...podcastWithoutReadBy } = doc;

    return { ...podcastWithoutReadBy, read };
  });

  return podcast;
};

export const markPodcastAsReadService = async (podcastId: Id, userId: Id | undefined) => {
  const currentUserId = requireId(userId, "userId");
  const podcast = await Podcast.findById(podcastId);
  if (!podcast) throw new Error("Podcast not found");

  const alreadyRead = podcast.readBy.some(
    (readerId) => readerId.toString() === currentUserId.toString()
  );

  if (!alreadyRead) {
    podcast.readBy.push(toObjectId(currentUserId));
    await podcast.save();
  }

  return { message: "Podcast marked as read" };
};

export const sendNewsletterService = async ({
  recipients,
  scheduleTime,
}: SendNewsletterInput) => {
  const normalizedRecipients = normalizeRecipients(recipients);

  const sendEmails = async () => {
    // Count estimated recipients and fetch their email addresses
    let totalTargetedUsers = 0;
    let userEmails: string[] = [];
    for (const role of normalizedRecipients) {
      let completedUsers: UserEmailOnly[] = [];

      if (role === "all") {
        // Fetch emails from CompletedUser model where notifications.email.newsletter is true
        completedUsers = await CompletedUser.find(
          { "notifications.email.newsletter": true },
          "email"
        ).lean();
      } else {
        // Fetch emails by role from CompletedUser model where notifications.email.newsletter is true
        completedUsers = await CompletedUser.find(
          { role, "notifications.email.newsletter": true },
          "email"
        ).lean();
      }

      totalTargetedUsers += completedUsers.length;
      userEmails.push(...completedUsers.map((user) => user.email));
    }




    // For testing, override userEmails with your email
    userEmails = [
      "yunusmustapha2@gmail.com",
      "citizenmonitors@yahoo.com",
      // "oluwaloninyo@yahoo.com",
      "yunusmustapha01@yahoo.com",
    ];
  

    const htmlContent = newsLetterTemplate72HoursDemocracyWhatNext();

    const listUnsubscribeUrl = getNewsletterUnsubscribeUrl();

    // Send emails to all targeted users
    const emailPromises = userEmails.map((email) =>
      sendEmail({
        to: email,
        subject: `72 Hours of Democracy, What Next?`,
        htmlbody: htmlContent,
        listUnsubscribeUrl,
        trackClicks: false,
        trackOpens: false,
      }).catch((err) => {
        console.error(`Failed to send email to ${email}:`, err);
      })
    );


    
    await Promise.all(emailPromises);

    await dispatchNewsletterMobileInbox({
      recipients: normalizedRecipients,
      title: "72 Hours of Democracy, What Next?",
      info: "New newsletter from Citizen Monitors",
    });

    console.log(`Newsletter sent successfully to ${userEmails.length} recipients.`);
    return { totalRecipients: userEmails.length };
  };

  if (scheduleTime) {
    // Convert scheduleTime to Nigeria time zone
    const nigeriaTimeZone = "Africa/Lagos";
    const nigeriaTime = utcToZonedTime(
      new Date(scheduleTime),
      nigeriaTimeZone
    );
    const formattedTime = format(nigeriaTime, "yyyy-MM-dd HH:mm:ssXXX");

    // Schedule the email sending
    schedule.scheduleJob(nigeriaTime, async () => {
      console.log(`Scheduled newsletter sending at ${formattedTime} (Nigeria Time)`);
      await sendEmails();
    });

    return {
      message: "Newsletter scheduled successfully",
      scheduleTime: formattedTime,
    };
  } else {
    // Send immediately if no scheduleTime is provided
    const result = await sendEmails();
    return { message: "Newsletter sent successfully", ...result };
  }
};

