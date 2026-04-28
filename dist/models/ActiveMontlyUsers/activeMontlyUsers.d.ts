import mongoose from "mongoose";
declare const ActiveUser: mongoose.Model<{
    month: string;
    users: mongoose.Types.ObjectId[];
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    month: string;
    users: mongoose.Types.ObjectId[];
}> & {
    month: string;
    users: mongoose.Types.ObjectId[];
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    month: string;
    users: mongoose.Types.ObjectId[];
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    month: string;
    users: mongoose.Types.ObjectId[];
}>> & mongoose.FlatRecord<{
    month: string;
    users: mongoose.Types.ObjectId[];
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default ActiveUser;
//# sourceMappingURL=activeMontlyUsers.d.ts.map