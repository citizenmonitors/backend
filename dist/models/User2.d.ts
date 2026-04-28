import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    email: string;
    role: "observer" | "volunteer";
    password: string;
    isVerified: boolean;
    observerDetails: any;
    volunteerDetails: any;
    formCompletion: boolean;
    verificationCode?: string | null | undefined;
    verificationCodeExpires?: NativeDate | null | undefined;
    resetPasswordToken?: string | null | undefined;
    resetPasswordExpires?: NativeDate | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    email: string;
    role: "observer" | "volunteer";
    password: string;
    isVerified: boolean;
    observerDetails: any;
    volunteerDetails: any;
    formCompletion: boolean;
    verificationCode?: string | null | undefined;
    verificationCodeExpires?: NativeDate | null | undefined;
    resetPasswordToken?: string | null | undefined;
    resetPasswordExpires?: NativeDate | null | undefined;
}> & {
    email: string;
    role: "observer" | "volunteer";
    password: string;
    isVerified: boolean;
    observerDetails: any;
    volunteerDetails: any;
    formCompletion: boolean;
    verificationCode?: string | null | undefined;
    verificationCodeExpires?: NativeDate | null | undefined;
    resetPasswordToken?: string | null | undefined;
    resetPasswordExpires?: NativeDate | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    email: string;
    role: "observer" | "volunteer";
    password: string;
    isVerified: boolean;
    observerDetails: any;
    volunteerDetails: any;
    formCompletion: boolean;
    verificationCode?: string | null | undefined;
    verificationCodeExpires?: NativeDate | null | undefined;
    resetPasswordToken?: string | null | undefined;
    resetPasswordExpires?: NativeDate | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    email: string;
    role: "observer" | "volunteer";
    password: string;
    isVerified: boolean;
    observerDetails: any;
    volunteerDetails: any;
    formCompletion: boolean;
    verificationCode?: string | null | undefined;
    verificationCodeExpires?: NativeDate | null | undefined;
    resetPasswordToken?: string | null | undefined;
    resetPasswordExpires?: NativeDate | null | undefined;
}>> & mongoose.FlatRecord<{
    email: string;
    role: "observer" | "volunteer";
    password: string;
    isVerified: boolean;
    observerDetails: any;
    volunteerDetails: any;
    formCompletion: boolean;
    verificationCode?: string | null | undefined;
    verificationCodeExpires?: NativeDate | null | undefined;
    resetPasswordToken?: string | null | undefined;
    resetPasswordExpires?: NativeDate | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=User2.d.ts.map