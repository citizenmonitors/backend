import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    expiresAt: NativeDate;
    email: string;
    tokenHash: string;
    revokedAt: NativeDate;
    replacedByHash: string;
    userAgent: string;
    deviceId: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    expiresAt: NativeDate;
    email: string;
    tokenHash: string;
    revokedAt: NativeDate;
    replacedByHash: string;
    userAgent: string;
    deviceId: string;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    expiresAt: NativeDate;
    email: string;
    tokenHash: string;
    revokedAt: NativeDate;
    replacedByHash: string;
    userAgent: string;
    deviceId: string;
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
    expiresAt: NativeDate;
    email: string;
    tokenHash: string;
    revokedAt: NativeDate;
    replacedByHash: string;
    userAgent: string;
    deviceId: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    expiresAt: NativeDate;
    email: string;
    tokenHash: string;
    revokedAt: NativeDate;
    replacedByHash: string;
    userAgent: string;
    deviceId: string;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    expiresAt: NativeDate;
    email: string;
    tokenHash: string;
    revokedAt: NativeDate;
    replacedByHash: string;
    userAgent: string;
    deviceId: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=RefreshToken.d.ts.map