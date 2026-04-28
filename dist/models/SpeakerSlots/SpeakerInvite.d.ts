import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    eventId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: NativeDate;
    email: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    eventId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: NativeDate;
    email: string;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    eventId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: NativeDate;
    email: string;
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
    eventId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: NativeDate;
    email: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    eventId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: NativeDate;
    email: string;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    eventId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: NativeDate;
    email: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=SpeakerInvite.d.ts.map