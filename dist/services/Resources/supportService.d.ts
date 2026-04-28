import type { Types } from "mongoose";
type SupportPayload = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    category: string;
    message: string;
};
type AdminLikeUser = {
    role?: string;
};
type SupportDoc = {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    category: string;
    message: string;
    createdAt?: Date;
};
export declare const createSupportRequest: (data: SupportPayload) => Promise<SupportDoc>;
export declare const getAllSupportRequests: (user: AdminLikeUser | undefined) => Promise<SupportDoc[]>;
export declare const getSupportRequestById: (user: AdminLikeUser | undefined, id: string) => Promise<SupportDoc>;
export declare const deleteSupportRequest: (user: AdminLikeUser | undefined, id: string) => Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=supportService.d.ts.map