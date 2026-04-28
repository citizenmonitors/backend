import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    user: mongoose.Types.ObjectId;
    title: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    user: mongoose.Types.ObjectId;
    title: string;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    user: mongoose.Types.ObjectId;
    title: string;
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
    message: string;
    email: string;
    user: mongoose.Types.ObjectId;
    title: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    user: mongoose.Types.ObjectId;
    title: string;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    user: mongoose.Types.ObjectId;
    title: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=mobileFeedback.d.ts.map