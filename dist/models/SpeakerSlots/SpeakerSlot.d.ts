import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    eventId: mongoose.Types.ObjectId;
    theme: string;
    dayId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    capacity: number;
    sessionType: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    eventId: mongoose.Types.ObjectId;
    theme: string;
    dayId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    capacity: number;
    sessionType: string;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    eventId: mongoose.Types.ObjectId;
    theme: string;
    dayId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    capacity: number;
    sessionType: string;
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
    theme: string;
    dayId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    capacity: number;
    sessionType: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    eventId: mongoose.Types.ObjectId;
    theme: string;
    dayId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    capacity: number;
    sessionType: string;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    eventId: mongoose.Types.ObjectId;
    theme: string;
    dayId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    capacity: number;
    sessionType: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=SpeakerSlot.d.ts.map