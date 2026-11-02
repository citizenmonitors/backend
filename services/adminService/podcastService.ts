import { ACTIVE_NEWSLETTER_EDITION } from "../../config/activeNewsletterEdition.ts";
import { sendEmail } from "../../config/email.ts";
import {
  getNewsletterUnsubscribeUrl,
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
import {
  embedNewsletterCoverInContent,
  pickNewsletterCover,
} from "../../utils/newsletterCover.ts";
import { buildNewsletterFromPaste, buildComposePreview } from "../../utils/newsletterFromPaste.ts";
import { dispatchMobileNotification } from "../mobile/notificationDispatchService.ts";
import { createNewsInsightArticle } from "./newsInsightAdminService.ts";

type Id = string | Types.ObjectId;
const RECIPIENT_ROLES = [
  "all",
  "super-admin",
  "admin",
  "observer",
  "volunteer",
  "public-viewer",
] as const;
type RecipientRole = (typeof RECIPIENT_ROLES)[number];

const dispatchNewsletterMobileInbox = async (input: {
  recipients: RecipientRole[];
  title: string;
  info?: string;
}) => {
  if (input.recipients.length === 0) return;

  await dispatchMobileNotification({
    type: "newsletter",
    preferenceKey: "newsletter",
    body: input.title,
    info: input.info ?? "",
    recipients: input.recipients,
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
  const list: unknown[] = Array.isArray(recipients) ? recipients : [recipients];
  const normalized = [
    ...new Set(list.map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean)),
  ];
  const invalid = normalized.filter(
    (r) => !(RECIPIENT_ROLES as readonly string[]).includes(r)
  );
  if (invalid.length > 0) {
    throw new Error(
      `Invalid recipients: ${invalid.join(", ")}. Allowed: ${RECIPIENT_ROLES.join(", ")}`
    );
  }
  if (normalized.length === 0) {
    throw new Error("recipients is required");
  }
  if (normalized.includes("all") && normalized.length > 1) {
    throw new Error("Cannot combine 'all' with specific roles. Choose either 'all' or specific roles.");
  }
  return normalized as RecipientRole[];
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
  recipients?: RecipientRole[] | RecipientRole;
  scheduleTime?: string | Date;
  adminId?: Id;
  /** When false, skip email send. Default: true. */
  sendEmail?: unknown;
  /** When false, send email only — skip News & Insight. Default: true. */
  publishAsNewsInsight?: unknown;
  /**
   * When true:
   * - emails go only to `testEmails` (required)
   * - mobile notifications (inbox + news-insight push) are skipped
   */
  isTest?: unknown;
  /** One or more emails for test sends. Required when isTest is true and sendEmail is true. */
  testEmails?: unknown;
  /**
   * Frontend compose page: paste the full draft (with or without Subject:),
   * or send title + content separately.
   */
  paste?: unknown;
  title?: unknown;
  content?: unknown;
  excerpt?: unknown;
  /** Optional cover override for News & Insight thumbnail + in-article image. */
  thumbnailURLUrl?: unknown;
};

type NewsletterPayload = {
  title: string;
  excerpt: string;
  content: string;
  buildEmailHtml: () => string;
  source: "paste" | "active-edition";
};

const toBooleanFlag = (value: unknown, defaultValue: boolean): boolean => {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return defaultValue;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Default test recipients when isTest is true and testEmails is omitted. */
const DEFAULT_NEWSLETTER_TEST_EMAILS = [
  "yunusmustapha2@gmail.com",
  "citizenmonitors@yahoo.com",
  "oluwaloninyo@yahoo.com",
  "yunusmustapha01@yahoo.com",
  "olajumoke@citizenmonitors.com",
  "yunus@citizenmonitors.com",
] as const;



const normalizeTestEmails = (value: unknown): string[] => {
  if (value === undefined || value === null || value === "") return [];
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,;\s]+/)
      : [];
  const emails = list
    .map((item) => String(item ?? "").trim().toLowerCase())
    .filter((email) => email.length > 0);
  const invalid = emails.filter((email) => !EMAIL_PATTERN.test(email));
  if (invalid.length > 0) {
    throw new Error(`Invalid testEmails: ${invalid.join(", ")}`);
  }
  return [...new Set(emails)];
};

const resolveTestEmails = (value: unknown): string[] => {
  const fromRequest = normalizeTestEmails(value);
  if (fromRequest.length > 0) return fromRequest;

  const fromEnv = normalizeTestEmails(
    process.env.NEWSLETTER_TEST_EMAILS?.trim() || ""
  );
  if (fromEnv.length > 0) return fromEnv;

  return [...DEFAULT_NEWSLETTER_TEST_EMAILS];
};

const getActiveNewsletter = (): NewsletterPayload => {
  const newsInsight = ACTIVE_NEWSLETTER_EDITION.getNewsInsight();
  return {
    title: newsInsight.title,
    excerpt: newsInsight.excerpt,
    content: newsInsight.content,
    buildEmailHtml: ACTIVE_NEWSLETTER_EDITION.buildEmailHtml,
    source: "active-edition",
  };
};

const resolveNewsletterPayload = (input?: {
  paste?: unknown;
  title?: unknown;
  content?: unknown;
  excerpt?: unknown;
}): NewsletterPayload => {
  const hasPaste = String(input?.paste ?? "").trim().length > 0;
  const hasTitle = String(input?.title ?? "").trim().length > 0;
  const hasContent = String(input?.content ?? "").trim().length > 0;

  if (hasPaste || hasTitle || hasContent) {
    const built = buildNewsletterFromPaste({
      paste: input?.paste,
      title: input?.title,
      content: input?.content,
      excerpt: input?.excerpt,
    });
    return {
      title: built.title,
      excerpt: built.excerpt,
      content: built.content,
      buildEmailHtml: () => built.emailHtml,
      source: "paste",
    };
  }

  return getActiveNewsletter();
};

/**
 * Frontend compose page Step 1:
 * paste draft → dual preview (newsletter email + News & Insight).
 */
export const composeNewsletterPreviewService = async (input: {
  paste?: unknown;
  title?: unknown;
  content?: unknown;
  excerpt?: unknown;
  thumbnailURLUrl?: unknown;
}) => {
  const preview = buildComposePreview(input);
  const cover = await pickNewsletterCover({
    title: preview.title,
    excerpt: preview.excerpt,
    overrideUrl: String(input.thumbnailURLUrl ?? "").trim() || undefined,
  });
  const newsInsightContent = embedNewsletterCoverInContent(
    preview.newsInsight.content,
    cover,
    preview.title
  );

  return {
    ...preview,
    newsInsight: {
      ...preview.newsInsight,
      content: newsInsightContent,
      thumbnailURLUrl: cover.url,
      heroImageURL: cover.url,
    },
    cover,
    nextStep: {
      endpoint: "POST /api/admin/newsletter",
      description:
        "Reuse the same paste/title/content, then set isTest true (test) or false (live).",
      testExample: {
        paste: "<same paste>",
        isTest: true,
        testEmails: ["you@example.com"],
        sendEmail: true,
        publishAsNewsInsight: true,
      },
      liveExample: {
        paste: "<same paste>",
        recipients: "all",
        isTest: false,
        sendEmail: true,
        publishAsNewsInsight: true,
      },
    },
  };
};

/** @deprecated Prefer composeNewsletterPreviewService for the paste → preview page. */
export const getActiveNewsletterPreviewService = async (input?: {
  paste?: unknown;
  title?: unknown;
  content?: unknown;
  excerpt?: unknown;
  thumbnailURLUrl?: unknown;
}) => {
  const hasPasteInput =
    String(input?.paste ?? "").trim() ||
    String(input?.title ?? "").trim() ||
    String(input?.content ?? "").trim();

  if (hasPasteInput) {
    return composeNewsletterPreviewService(input ?? {});
  }

  const newsletter = getActiveNewsletter();
  const cover = await pickNewsletterCover({
    title: newsletter.title,
    excerpt: newsletter.excerpt,
    overrideUrl: String(input?.thumbnailURLUrl ?? "").trim() || undefined,
  });
  return {
    title: newsletter.title,
    excerpt: newsletter.excerpt,
    newsletter: {
      subject: newsletter.title,
      html: newsletter.buildEmailHtml(),
    },
    newsInsight: {
      title: newsletter.title,
      excerpt: newsletter.excerpt,
      content: embedNewsletterCoverInContent(
        newsletter.content,
        cover,
        newsletter.title
      ),
      thumbnailURLUrl: cover.url,
      heroImageURL: cover.url,
    },
    cover,
    source: newsletter.source,
  };
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

const publishNewsletterAsNewsInsight = async (
  newsletter: NewsletterPayload,
  adminId?: Id,
  notifySubscribers = true,
  thumbnailOverride?: string
) => {
  const publisherId = await resolveNewsletterPublisherId(adminId);
  const cover = await pickNewsletterCover({
    title: newsletter.title,
    excerpt: newsletter.excerpt,
    overrideUrl: thumbnailOverride,
  });
  const content = embedNewsletterCoverInContent(
    newsletter.content,
    cover,
    newsletter.title
  );

  const article = await createNewsInsightArticle({
    adminId: publisherId,
    title: newsletter.title,
    excerpt: newsletter.excerpt,
    content,
    thumbnailURLUrl: cover.url,
    heroImageURL: cover.url,
    isPublished: true,
    notifySubscribers,
  });

  return { article, cover };
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
  sendEmail: sendEmailFlag,
  publishAsNewsInsight,
  isTest,
  testEmails,
  paste,
  title,
  content,
  excerpt,
  thumbnailURLUrl,
}: SendNewsletterInput) => {
  const shouldSendEmail = toBooleanFlag(sendEmailFlag, true);
  const shouldPublishNewsInsight = toBooleanFlag(publishAsNewsInsight, true);
  const isTestSend = toBooleanFlag(isTest, false);
  const normalizedTestEmails = isTestSend
    ? resolveTestEmails(testEmails)
    : normalizeTestEmails(testEmails);
  const newsletter = resolveNewsletterPayload({ paste, title, content, excerpt });
  const thumbnailOverride = String(thumbnailURLUrl ?? "").trim() || undefined;

  if (!shouldSendEmail && !shouldPublishNewsInsight) {
    throw new Error(
      "Nothing to do: set sendEmail and/or publishAsNewsInsight to true"
    );
  }

  if (isTestSend && shouldSendEmail && normalizedTestEmails.length === 0) {
    throw new Error(
      "testEmails is required when isTest is true and sendEmail is true"
    );
  }

  const providedRecipients =
    recipients === undefined || recipients === null || (recipients as unknown) === ""
      ? null
      : Array.isArray(recipients) && recipients.length === 0
        ? null
        : recipients;

  let normalizedRecipients: RecipientRole[] = ["all"];
  if (!isTestSend && shouldSendEmail) {
    if (!providedRecipients) {
      throw new Error("recipients is required for a live newsletter send");
    }
    normalizedRecipients = normalizeRecipients(providedRecipients);
  } else if (providedRecipients) {
    normalizedRecipients = normalizeRecipients(providedRecipients);
  }

  const sendEmails = async () => {
    let userEmails: string[] = [];

    if (shouldSendEmail) {
      if (isTestSend) {
        userEmails = normalizedTestEmails;
      } else {
        for (const role of normalizedRecipients) {
          let completedUsers: UserEmailOnly[] = [];

          if (role === "all") {
            completedUsers = await CompletedUser.find(
              { "notifications.email.newsletter": true },
              "email"
            ).lean();
          } else {
            completedUsers = await CompletedUser.find(
              { role, "notifications.email.newsletter": true },
              "email"
            ).lean();
          }

          userEmails.push(...completedUsers.map((user) => user.email));
        }
        userEmails = [
          ...new Set(
            userEmails.map((e) => e.trim().toLowerCase()).filter(Boolean)
          ),
        ];
      }

      if (userEmails.length === 0) {
        throw new Error("No newsletter recipients found");
      }

      const htmlContent = newsletter.buildEmailHtml();
      const listUnsubscribeUrl = getNewsletterUnsubscribeUrl();

      // Zepto rate-limits / errors when every address fires at once. That used to
      // crash the SDK mid-send and cut the newsletter short. Send in small batches.
      const concurrency = Math.max(
        1,
        Math.min(10, Number(process.env.NEWSLETTER_SEND_CONCURRENCY) || 5)
      );
      const delayMs = Math.max(
        0,
        Number(process.env.NEWSLETTER_SEND_DELAY_MS) || 200
      );
      let sent = 0;
      let failed = 0;

      for (let i = 0; i < userEmails.length; i += concurrency) {
        const chunk = userEmails.slice(i, i + concurrency);
        const results = await Promise.allSettled(
          chunk.map((email) =>
            sendEmail({
              to: email,
              subject: newsletter.title,
              htmlbody: htmlContent,
              listUnsubscribeUrl,
              trackClicks: false,
              trackOpens: false,
            })
          )
        );

        for (let j = 0; j < results.length; j++) {
          const result = results[j]!;
          if (result.status === "fulfilled") {
            sent += 1;
          } else {
            failed += 1;
            const email = chunk[j]!;
            const reason =
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason);
            console.error(`Failed to send email to ${email}:`, reason);
          }
        }

        console.log(
          `Newsletter progress: ${Math.min(i + chunk.length, userEmails.length)}/${userEmails.length} (sent=${sent}, failed=${failed})`
        );

        if (delayMs > 0 && i + concurrency < userEmails.length) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    const notificationsSent =
      !isTestSend && (shouldSendEmail || shouldPublishNewsInsight);

    if (!isTestSend && shouldSendEmail) {
      await dispatchNewsletterMobileInbox({
        recipients: normalizedRecipients,
        title: newsletter.title,
        info: newsletter.excerpt,
      });
    }

    let newsInsightResult: {
      id: string;
      slug: string;
      title: string;
      thumbnailURLUrl: string;
    } | null = null;
    let cover: { file: string; url: string } | undefined;

    if (shouldPublishNewsInsight) {
      const published = await publishNewsletterAsNewsInsight(
        newsletter,
        adminId,
        !isTestSend,
        thumbnailOverride
      );
      cover = { file: published.cover.file, url: published.cover.url };
      newsInsightResult = {
        id: String(published.article._id),
        slug: published.article.slug,
        title: published.article.title,
        thumbnailURLUrl: published.cover.url,
      };
    }

    const modeParts = [
      shouldSendEmail ? "email" : null,
      shouldPublishNewsInsight ? "news-insight" : null,
      isTestSend ? "test" : "live",
      newsletter.source,
    ].filter(Boolean);

    console.log(
      `Newsletter completed (${modeParts.join(" + ")}); recipients=${userEmails.length}`
    );

    return {
      totalRecipients: userEmails.length,
      recipients: isTestSend ? userEmails : undefined,
      emailSent: shouldSendEmail,
      newsInsightPublished: shouldPublishNewsInsight,
      notificationsSent: Boolean(notificationsSent && !isTestSend),
      isTest: isTestSend,
      source: newsletter.source,
      newsInsight: newsInsightResult,
      cover,
      title: newsletter.title,
      excerpt: newsletter.excerpt,
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
      isTest: isTestSend,
      emailSent: shouldSendEmail,
      newsInsightPublished: shouldPublishNewsInsight,
      source: newsletter.source,
      title: newsletter.title,
      excerpt: newsletter.excerpt,
    };
  }

  const result = await sendEmails();
  return { message: "Newsletter sent successfully", ...result };
};

