import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    admin: mongoose.Types.ObjectId;
    details: any;
    action: string;
    timestamp: NativeDate;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    admin: mongoose.Types.ObjectId;
    details: any;
    action: string;
    timestamp: NativeDate;
}> & {
    admin: mongoose.Types.ObjectId;
    details: any;
    action: string;
    timestamp: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    admin: mongoose.Types.ObjectId;
    details: any;
    action: string;
    timestamp: NativeDate;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    admin: mongoose.Types.ObjectId;
    details: any;
    action: string;
    timestamp: NativeDate;
}>> & mongoose.FlatRecord<{
    admin: mongoose.Types.ObjectId;
    details: any;
    action: string;
    timestamp: NativeDate;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=AdminLog.d.ts.map