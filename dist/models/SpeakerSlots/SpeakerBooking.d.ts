import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    fullName: string;
    xHandle: string;
    topicAngle: string;
    status: "confirmed" | "cancelled" | "pending";
    slotId: mongoose.Types.ObjectId;
    inviteId: mongoose.Types.ObjectId;
    bioLink: string;
    phone: string;
    remindersSent?: {
        sent7d: NativeDate;
        sent24h: NativeDate;
        sent2h: NativeDate;
    } | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    fullName: string;
    xHandle: string;
    topicAngle: string;
    status: "confirmed" | "cancelled" | "pending";
    slotId: mongoose.Types.ObjectId;
    inviteId: mongoose.Types.ObjectId;
    bioLink: string;
    phone: string;
    remindersSent?: {
        sent7d: NativeDate;
        sent24h: NativeDate;
        sent2h: NativeDate;
    } | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    fullName: string;
    xHandle: string;
    topicAngle: string;
    status: "confirmed" | "cancelled" | "pending";
    slotId: mongoose.Types.ObjectId;
    inviteId: mongoose.Types.ObjectId;
    bioLink: string;
    phone: string;
    remindersSent?: {
        sent7d: NativeDate;
        sent24h: NativeDate;
        sent2h: NativeDate;
    } | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    fullName: string;
    xHandle: string;
    topicAngle: string;
    status: "confirmed" | "cancelled" | "pending";
    slotId: mongoose.Types.ObjectId;
    inviteId: mongoose.Types.ObjectId;
    bioLink: string;
    phone: string;
    remindersSent?: {
        sent7d: NativeDate;
        sent24h: NativeDate;
        sent2h: NativeDate;
    } | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    fullName: string;
    xHandle: string;
    topicAngle: string;
    status: "confirmed" | "cancelled" | "pending";
    slotId: mongoose.Types.ObjectId;
    inviteId: mongoose.Types.ObjectId;
    bioLink: string;
    phone: string;
    remindersSent?: {
        sent7d: NativeDate;
        sent24h: NativeDate;
        sent2h: NativeDate;
    } | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    fullName: string;
    xHandle: string;
    topicAngle: string;
    status: "confirmed" | "cancelled" | "pending";
    slotId: mongoose.Types.ObjectId;
    inviteId: mongoose.Types.ObjectId;
    bioLink: string;
    phone: string;
    remindersSent?: {
        sent7d: NativeDate;
        sent24h: NativeDate;
        sent2h: NativeDate;
    } | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=SpeakerBooking.d.ts.map