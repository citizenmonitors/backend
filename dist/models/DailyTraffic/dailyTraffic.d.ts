import mongoose from "mongoose";
declare const Traffic: mongoose.Model<{
    date: NativeDate;
    visitCount: number;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    date: NativeDate;
    visitCount: number;
}> & {
    date: NativeDate;
    visitCount: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    date: NativeDate;
    visitCount: number;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    date: NativeDate;
    visitCount: number;
}>> & mongoose.FlatRecord<{
    date: NativeDate;
    visitCount: number;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Traffic;
//# sourceMappingURL=dailyTraffic.d.ts.map