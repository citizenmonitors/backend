/**
 * Data handling for account deletion (self-service and admin).
 *
 * - Observer election results/incidents are kept for collation but anonymised
 *   (`user: null`, `uploaderDeleted: true`).
 * - Everything else the person created or that identifies them is removed:
 *   Pulse content, discussion and article comments, likes, notifications aimed only at
 *   them, feedback, and their profile image and observer ID files in storage.
 */
import { type Types } from "mongoose";
type Id = Types.ObjectId | string;
type StoredFile = {
    _id?: unknown;
    location?: string | null;
} | null | undefined;
export type PurgeableUser = {
    _id: Id;
    profileImage?: StoredFile;
    observerId?: StoredFile[] | null;
};
/** Keep observer uploads for collation, without anything linking them to the person. */
export declare const anonymizeUserSubmissions: (userId: Id) => Promise<{
    anonymizedResults: number;
    anonymizedIncidents: number;
}>;
/** Remove everything personal or user-generated, other than election submissions. */
export declare const purgeUserPersonalContent: (user: PurgeableUser) => Promise<{
    pulsePostsDeleted: number;
    filesDeleted: number;
}>;
export {};
//# sourceMappingURL=accountDataPurge.d.ts.map