import mongoose from "mongoose";
import type { Types } from "mongoose";
type Id = string | Types.ObjectId;
type RecipientRole = "all" | "super-admin" | "admin" | "observer" | "volunteer";
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
export declare const sendPodcastService: ({ title, content, recipients, adminId, }: SendPodcastInput) => Promise<mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    recipients: string[];
    readBy: Types.ObjectId[];
    title: string;
    content: string;
    sender: Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    recipients: string[];
    readBy: Types.ObjectId[];
    title: string;
    content: string;
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
    recipients: string[];
    readBy: Types.ObjectId[];
    title: string;
    content: string;
    sender: Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    recipients: string[];
    readBy: Types.ObjectId[];
    title: string;
    content: string;
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
    recipients: string[];
    readBy: Types.ObjectId[];
    title: string;
    content: string;
    sender: Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    recipients: string[];
    readBy: Types.ObjectId[];
    title: string;
    content: string;
    sender: Types.ObjectId;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
})[]>;
export declare const getSinglePodcastService: (id: Id, userId: Id | undefined) => Promise<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
    recipients: string[];
    title: string;
    content: string;
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
    recipients: string[];
    title: string;
    content: string;
    sender: Types.ObjectId;
    _id: Types.ObjectId;
    __v: number;
}[]>;
export declare const markPodcastAsReadService: (podcastId: Id, userId: Id | undefined) => Promise<{
    message: string;
}>;
export declare const sendNewsletterService: ({ recipients, scheduleTime, }: SendNewsletterInput) => Promise<{
    message: string;
    scheduleTime: string;
} | {
    totalRecipients: number;
    message: string;
    scheduleTime?: undefined;
}>;
export {};
//# sourceMappingURL=podcastService.d.ts.map