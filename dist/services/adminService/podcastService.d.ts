import mongoose from "mongoose";
import type { Types } from "mongoose";
type Id = string | Types.ObjectId;
declare const RECIPIENT_ROLES: readonly ["all", "super-admin", "admin", "observer", "volunteer", "public-viewer"];
type RecipientRole = (typeof RECIPIENT_ROLES)[number];
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
/**
 * Frontend compose page Step 1:
 * paste draft → dual preview (newsletter email + News & Insight).
 */
export declare const composeNewsletterPreviewService: (input: {
    paste?: unknown;
    title?: unknown;
    content?: unknown;
    excerpt?: unknown;
    thumbnailURLUrl?: unknown;
}) => Promise<{
    newsInsight: {
        content: string;
        thumbnailURLUrl: string;
        heroImageURL: string;
        title: string;
        excerpt: string;
    };
    cover: import("../../utils/newsletterCover.ts").NewsletterCover;
    nextStep: {
        endpoint: string;
        description: string;
        testExample: {
            paste: string;
            isTest: boolean;
            testEmails: string[];
            sendEmail: boolean;
            publishAsNewsInsight: boolean;
        };
        liveExample: {
            paste: string;
            recipients: string;
            isTest: boolean;
            sendEmail: boolean;
            publishAsNewsInsight: boolean;
        };
    };
    title: string;
    excerpt: string;
    newsletter: {
        subject: string;
        html: string;
    };
}>;
/** @deprecated Prefer composeNewsletterPreviewService for the paste → preview page. */
export declare const getActiveNewsletterPreviewService: (input?: {
    paste?: unknown;
    title?: unknown;
    content?: unknown;
    excerpt?: unknown;
    thumbnailURLUrl?: unknown;
}) => Promise<{
    newsInsight: {
        content: string;
        thumbnailURLUrl: string;
        heroImageURL: string;
        title: string;
        excerpt: string;
    };
    cover: import("../../utils/newsletterCover.ts").NewsletterCover;
    nextStep: {
        endpoint: string;
        description: string;
        testExample: {
            paste: string;
            isTest: boolean;
            testEmails: string[];
            sendEmail: boolean;
            publishAsNewsInsight: boolean;
        };
        liveExample: {
            paste: string;
            recipients: string;
            isTest: boolean;
            sendEmail: boolean;
            publishAsNewsInsight: boolean;
        };
    };
    title: string;
    excerpt: string;
    newsletter: {
        subject: string;
        html: string;
    };
} | {
    title: string;
    excerpt: string;
    newsletter: {
        subject: string;
        html: string;
    };
    newsInsight: {
        title: string;
        excerpt: string;
        content: string;
        thumbnailURLUrl: string;
        heroImageURL: string;
    };
    cover: import("../../utils/newsletterCover.ts").NewsletterCover;
    source: "paste" | "active-edition";
}>;
export declare const sendPodcastService: ({ title, content, recipients, adminId, }: SendPodcastInput) => Promise<mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    recipients: string[];
    readBy: Types.ObjectId[];
    sender: Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    recipients: string[];
    readBy: Types.ObjectId[];
    sender: Types.ObjectId;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const editPodcastService: ({ podcastId, updates, adminId, }: EditPodcastInput) => Promise<mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    recipients: string[];
    readBy: Types.ObjectId[];
    sender: Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    recipients: string[];
    readBy: Types.ObjectId[];
    sender: Types.ObjectId;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const getAllPodcastsService: () => Promise<(mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    recipients: string[];
    readBy: Types.ObjectId[];
    sender: Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    recipients: string[];
    readBy: Types.ObjectId[];
    sender: Types.ObjectId;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
})[]>;
export declare const getSinglePodcastService: (id: Id, userId: Id | undefined) => Promise<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
    title: string;
    content: string;
    recipients: string[];
    sender: Types.ObjectId;
    _id: Types.ObjectId;
    __v: number;
}>;
export declare const deletePodcastService: (id: Id, adminId: Id | undefined) => Promise<{
    message: string;
}>;
export declare const getUserInboxService: (userId: Id | undefined) => Promise<{
    read: boolean;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    title: string;
    content: string;
    recipients: string[];
    sender: Types.ObjectId;
    _id: Types.ObjectId;
    __v: number;
}[]>;
export declare const markPodcastAsReadService: (podcastId: Id, userId: Id | undefined) => Promise<{
    message: string;
}>;
export declare const sendNewsletterService: ({ recipients, scheduleTime, adminId, sendEmail: sendEmailFlag, publishAsNewsInsight, isTest, testEmails, paste, title, content, excerpt, thumbnailURLUrl, }: SendNewsletterInput) => Promise<{
    message: string;
    scheduleTime: string;
    isTest: boolean;
    emailSent: boolean;
    newsInsightPublished: boolean;
    source: "paste" | "active-edition";
    title: string;
    excerpt: string;
} | {
    totalRecipients: number;
    recipients: string[] | undefined;
    emailSent: boolean;
    newsInsightPublished: boolean;
    notificationsSent: boolean;
    isTest: boolean;
    source: "paste" | "active-edition";
    newsInsight: {
        id: string;
        slug: string;
        title: string;
        thumbnailURLUrl: string;
    } | null;
    cover: {
        file: string;
        url: string;
    } | undefined;
    title: string;
    excerpt: string;
    message: string;
    scheduleTime?: undefined;
}>;
export {};
//# sourceMappingURL=podcastService.d.ts.map