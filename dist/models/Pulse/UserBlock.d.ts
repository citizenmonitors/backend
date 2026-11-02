import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    blocker: mongoose.Types.ObjectId;
    blocked: mongoose.Types.ObjectId;
    displayName?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    blocker: mongoose.Types.ObjectId;
    blocked: mongoose.Types.ObjectId;
    displayName?: string | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    blocker: mongoose.Types.ObjectId;
    blocked: mongoose.Types.ObjectId;
    displayName?: string | null | undefined;
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
    blocker: mongoose.Types.ObjectId;
    blocked: mongoose.Types.ObjectId;
    displayName?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    blocker: mongoose.Types.ObjectId;
    blocked: mongoose.Types.ObjectId;
    displayName?: string | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    blocker: mongoose.Types.ObjectId;
    blocked: mongoose.Types.ObjectId;
    displayName?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=UserBlock.d.ts.map