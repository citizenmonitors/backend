import { sendEmail } from "../../config/email.ts";
import {
  getNewsletterUnsubscribeUrl,
  newsLetterTemplateNigeriaFakeAgenciesRealGovernment,
  podcastNotificationTemplate,
} from "../../config/emailTemplates.ts";
import schedule from "node-schedule";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import mongoose from "mongoose";
import type { Types } from "mongoose";
import AdminLog from "../../models/admin/AdminLog.ts";
import Podcast from "../../models/admin/Podcast.ts";
import CompletedUser from "../../models/CompletedUser.ts";
import { invalidateAllMobileReadCaches } from "../../utils/cache.ts";
import { dispatchMobileNotification } from "../mobile/notificationDispatchService.ts";
import { createNewsInsightArticle } from "./newsInsightAdminService.ts";

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
  adminId?: Id;
};

const NEWSLETTER_NEWS_THUMBNAIL =
  process.env.NEWSLETTER_NEWS_THUMBNAIL_URL?.trim() ||
  "https://www.citizenmonitors.com/assets/citizen-monitors-logo.png";

const ACTIVE_NEWSLETTER = {
  title: "Nigeria: Fake Agencies, Real Government?",
  excerpt:
    "How can fake institutions thrive in a country with real government institutions?",
  content: `
<p><strong>Dear Citizen Monitors,</strong></p>
<p>In recent weeks, Nigerians have watched an alarming trend unfold. Individuals with no legal authority establishing government agencies, appointed themselves officials, printed identity cards, opened offices, collected fees from unsuspecting citizens, and operated for months, sometimes years (and even be appropriated for in the national budget), before being exposed.</p>
<p><strong>How can fake institutions thrive in a country with real government institutions?</strong></p>
<p>This goes beyond fraud. It is a reflection of deeper governance challenges. When regulatory oversight is weak, enforcement agencies are reactive rather than proactive, and citizens are left without clear channels to verify information, impostors find fertile ground. Every fake agency that survives for months; is evidence that legitimate institutions are either absent, overwhelmed, or simply not paying enough attention.</p>
<p>The irony is striking. While ordinary Nigerians struggle with endless documentation, permits, taxes, and regulations from genuine government agencies, fraudulent operators are able to create parallel institutions with little resistance. It raises uncomfortable questions about coordination among security agencies, regulatory bodies, and public information systems.</p>
<h4>This is why citizen participation matters.</h4>
<p>Governance cannot be left to government alone. Citizens must actively question, verify, report, and demand accountability. Public vigilance is one of the strongest defence against fraud, corruption, and institutional failure.</p>
<h4>Technology now gives us the opportunity to do exactly that.</h4>
<p>We are pleased to announce that the <strong>Citizen Monitors App is now LIVE on Android</strong>.</p>
<p>The app enables citizens to document incidents, report governance concerns, monitor elections, and contribute credible, verifiable information that strengthens transparency and accountability across Nigeria. Democracy works best when citizens are informed and actively engaged; not just during elections, but every single day.</p>
<p>Whether it is election malpractice, abuse of office, public service failures, or suspicious activities affecting your community, your voice matters, and your evidence matters even more. The fight for accountability begins with participation. A stronger democracy emerges when citizens become active monitors.</p>
<p>Download the Citizen Monitors App today on your Android device and become part of a growing movement committed to protecting Nigeria's democracy, strengthening institutions, and ensuring that public office remains accountable to the people. And do tell everyone you know about the App. If all the Polling Units in Nigeria are manned by Citizen Monitors, the next elections, starting with the Osun gubernatorial, will be more credible.</p>
<p><strong>The future of Nigeria should never be left to fake institutions, nor passive citizens.</strong></p>
<p>Stay informed. Stay engaged. Stay accountable.</p>
<p><em>Promoting transparency, accountability and informed public discourse.</em></p>
`.trim(),
  buildEmailHtml: () => newsLetterTemplateNigeriaFakeAgenciesRealGovernment(),
};

const resolveNewsletterPublisherId = async (adminId?: Id): Promise<Id> => {
  if (adminId) return adminId;

  const envId = process.env.NEWSLETTER_SYSTEM_ADMIN_ID?.trim();
  if (envId && mongoose.Types.ObjectId.isValid(envId)) return envId;

  const admin = await CompletedUser.findOne({
    role: { $in: ["super-admin", "admin"] },
  })
    .select("_id")
    .lean();

  if (!admin?._id) {
    throw new Error(
      "No admin available to publish newsletter as News & Insight"
    );
  }

  return admin._id;
};

const publishNewsletterAsNewsInsight = async (adminId?: Id) => {
  const publisherId = await resolveNewsletterPublisherId(adminId);

  return createNewsInsightArticle({
    adminId: publisherId,
    title: ACTIVE_NEWSLETTER.title,
    excerpt: ACTIVE_NEWSLETTER.excerpt,
    content: ACTIVE_NEWSLETTER.content,
    thumbnailURLUrl: NEWSLETTER_NEWS_THUMBNAIL,
    heroImageURL: NEWSLETTER_NEWS_THUMBNAIL,
    isPublished: true,
    notifySubscribers: true,
  });
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
  adminId,
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
      "oluwaloninyo@yahoo.com",
      "yunusmustapha01@yahoo.com",
    ];


    const htmlContent = ACTIVE_NEWSLETTER.buildEmailHtml();

    const listUnsubscribeUrl = getNewsletterUnsubscribeUrl();

    // Send emails to all targeted users
    const emailPromises = userEmails.map((email) =>
      sendEmail({
        to: email,
        subject: ACTIVE_NEWSLETTER.title,
        htmlbody: htmlContent,
        listUnsubscribeUrl,
        trackClicks: false,
        trackOpens: false,
      }).catch((err) => {
        console.error(`Failed to send email to ${email}:`, err);
      })
    );

    await Promise.all(emailPromises);

    // Mirror newsletter into mobile News & Insights (DB + push in news-insight format)
    const newsInsight = await publishNewsletterAsNewsInsight(adminId);

    await dispatchNewsletterMobileInbox({
      recipients: normalizedRecipients,
      title: ACTIVE_NEWSLETTER.title,
      info: ACTIVE_NEWSLETTER.excerpt,
    });

    console.log(
      `Newsletter sent successfully to ${userEmails.length} recipients; News & Insight published (${newsInsight.slug}).`
    );
    return {
      totalRecipients: userEmails.length,
      newsInsight: {
        id: String(newsInsight._id),
        slug: newsInsight.slug,
        title: newsInsight.title,
      },
    };
  };

  if (scheduleTime) {
    const nigeriaTimeZone = "Africa/Lagos";
    const scheduledAt =
      typeof scheduleTime === "string" &&
      /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(scheduleTime) &&
      !/[zZ]|[+-]\d{2}:?\d{2}$/.test(scheduleTime.trim())
        ? zonedTimeToUtc(scheduleTime.replace("T", " "), nigeriaTimeZone)
        : new Date(scheduleTime);

    if (Number.isNaN(scheduledAt.getTime())) {
      throw new Error("Invalid scheduleTime");
    }

    const formattedTime = formatInTimeZone(
      scheduledAt,
      nigeriaTimeZone,
      "yyyy-MM-dd HH:mm:ssXXX"
    );

    if (scheduledAt.getTime() <= Date.now()) {
      throw new Error("scheduleTime must be in the future");
    }

    schedule.scheduleJob(scheduledAt, async () => {
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

