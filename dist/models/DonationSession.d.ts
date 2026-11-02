import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    source: "mobile" | "web";
    status: "failed" | "pending" | "expired" | "paid" | "canceled";
    amount: number;
    amountMinor: number;
    currency: "ngn" | "usd" | "gbp" | "eur";
    stripeCheckoutSessionId: string;
    stripePaymentIntentId?: string | null | undefined;
    paidAt?: NativeDate | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    source: "mobile" | "web";
    status: "failed" | "pending" | "expired" | "paid" | "canceled";
    amount: number;
    amountMinor: number;
    currency: "ngn" | "usd" | "gbp" | "eur";
    stripeCheckoutSessionId: string;
    stripePaymentIntentId?: string | null | undefined;
    paidAt?: NativeDate | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    source: "mobile" | "web";
    status: "failed" | "pending" | "expired" | "paid" | "canceled";
    amount: number;
    amountMinor: number;
    currency: "ngn" | "usd" | "gbp" | "eur";
    stripeCheckoutSessionId: string;
    stripePaymentIntentId?: string | null | undefined;
    paidAt?: NativeDate | null | undefined;
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
    source: "mobile" | "web";
    status: "failed" | "pending" | "expired" | "paid" | "canceled";
    amount: number;
    amountMinor: number;
    currency: "ngn" | "usd" | "gbp" | "eur";
    stripeCheckoutSessionId: string;
    stripePaymentIntentId?: string | null | undefined;
    paidAt?: NativeDate | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    source: "mobile" | "web";
    status: "failed" | "pending" | "expired" | "paid" | "canceled";
    amount: number;
    amountMinor: number;
    currency: "ngn" | "usd" | "gbp" | "eur";
    stripeCheckoutSessionId: string;
    stripePaymentIntentId?: string | null | undefined;
    paidAt?: NativeDate | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    source: "mobile" | "web";
    status: "failed" | "pending" | "expired" | "paid" | "canceled";
    amount: number;
    amountMinor: number;
    currency: "ngn" | "usd" | "gbp" | "eur";
    stripeCheckoutSessionId: string;
    stripePaymentIntentId?: string | null | undefined;
    paidAt?: NativeDate | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=DonationSession.d.ts.map