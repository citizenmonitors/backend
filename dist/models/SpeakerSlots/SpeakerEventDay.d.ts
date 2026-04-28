import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: string;
    description: string;
    eventId: mongoose.Types.ObjectId;
    label: string;
    theme: string;
    sortOrder: number;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: string;
    description: string;
    eventId: mongoose.Types.ObjectId;
    label: string;
    theme: string;
    sortOrder: number;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: string;
    description: string;
    eventId: mongoose.Types.ObjectId;
    label: string;
    theme: string;
    sortOrder: number;
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
    date: string;
    description: string;
    eventId: mongoose.Types.ObjectId;
    label: string;
    theme: string;
    sortOrder: number;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: string;
    description: string;
    eventId: mongoose.Types.ObjectId;
    label: string;
    theme: string;
    sortOrder: number;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: string;
    description: string;
    eventId: mongoose.Types.ObjectId;
    label: string;
    theme: string;
    sortOrder: number;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=SpeakerEventDay.d.ts.map