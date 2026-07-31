import type { Types } from "mongoose";
import type { AuthenticatedUser } from "../../types/authenticatedRequest.ts";
import { type FlagMediaFiles } from "../Election/electionService.ts";
type Id = Types.ObjectId | string;
type PuVerificationFeed = {
    results: Array<{
        electionTypeId?: Types.ObjectId | string;
    }>;
    incidentReports: Array<{
        electionTypeId?: Types.ObjectId | string;
    }>;
};
/**
 * Mobile agree/flag — same polling-unit rules as web `POST /user-action`,
 * but scoped to one ActiveElection (user opens that election first).
 */
export declare const mobileElectionUserAction: (activeElectionId: string, userId: Id, body: {
    electionId: string;
    action: "agree" | "flag" | "unagree" | "unflag";
    dataType: "election" | "incident";
    flagReason?: string;
} | null, flagMediaFiles?: FlagMediaFiles) => Promise<PuVerificationFeed>;
type ElectionStatus = "all" | "live" | "upcoming" | "concluded";
type ElectionScope = "all" | "polling-unit";
export declare const getMobileActiveElections: (input: {
    status: ElectionStatus;
    scope: ElectionScope;
    user: AuthenticatedUser;
}) => Promise<{
    id: string;
    electionName: string | undefined;
    electionType: string | undefined;
    electionLocation: unknown;
    startDate: unknown;
    endDate: unknown;
    mockElection: {};
    partiesCount: number;
    status: ElectionStatus;
}[]>;
export declare const getMobileLiveElectionsCarousel: (user: AuthenticatedUser) => Promise<{
    id: string;
    electionName: string | undefined;
    electionType: string | undefined;
    electionLocation: unknown;
    startDate: unknown;
    endDate: unknown;
    mockElection: {};
    partiesCount: number;
    status: ElectionStatus;
}[]>;
export declare const getMobileElectionSubmissionByActiveElection: (activeElectionId: string, userId: string) => Promise<{
    election: {
        electionType: string | undefined;
        electionName: string | undefined;
        politicalParties: {
            name: string;
            code: string;
            logo: string | null;
        }[];
        results: (import("mongoose").FlattenMaps<{
            createdAt: NativeDate;
            updatedAt: NativeDate;
            hidden: boolean;
            state: string;
            lga: string;
            ward: string;
            pollingUnit: string;
            election: Types.ObjectId;
            flagged: boolean;
            user: Types.ObjectId;
            partiesVotes: Types.DocumentArray<{
                party?: string | null | undefined;
                count?: number | null | undefined;
            }, Types.Subdocument<Types.ObjectId, any, {
                party?: string | null | undefined;
                count?: number | null | undefined;
            }> & {
                party?: string | null | undefined;
                count?: number | null | undefined;
            }>;
            actions: Types.DocumentArray<{
                action: "agree" | "flag";
                flagImage?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                flagVideo?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                userId?: Types.ObjectId | null | undefined;
                flagReason?: string | null | undefined;
                evidenceId?: Types.ObjectId | null | undefined;
            } | {
                action: "agree" | "flag";
                flagImage?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                flagVideo?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                userId?: string | null | undefined;
                flagReason?: string | null | undefined;
                evidenceId?: string | null | undefined;
                _id: string;
                __v: number;
            }, Types.Subdocument<string | Types.ObjectId, any, {
                action: "agree" | "flag";
                flagImage?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                flagVideo?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                userId?: Types.ObjectId | null | undefined;
                flagReason?: string | null | undefined;
                evidenceId?: Types.ObjectId | null | undefined;
            } | {
                action: "agree" | "flag";
                flagImage?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                flagVideo?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                userId?: string | null | undefined;
                flagReason?: string | null | undefined;
                evidenceId?: string | null | undefined;
                _id: string;
                __v: number;
            }> & ({
                action: "agree" | "flag";
                flagImage?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                flagVideo?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                userId?: Types.ObjectId | null | undefined;
                flagReason?: string | null | undefined;
                evidenceId?: Types.ObjectId | null | undefined;
            } | {
                action: "agree" | "flag";
                flagImage?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                flagVideo?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                userId?: string | null | undefined;
                flagReason?: string | null | undefined;
                evidenceId?: string | null | undefined;
                _id: string;
                __v: number;
            })>;
            agreed: boolean;
            resultPicture?: {
                name?: string | null | undefined;
                type?: string | null | undefined;
                url?: string | null | undefined;
                location?: string | null | undefined;
                size?: number | null | undefined;
            } | null | undefined;
            resultVideo?: {
                name?: string | null | undefined;
                type?: string | null | undefined;
                url?: string | null | undefined;
                location?: string | null | undefined;
                size?: number | null | undefined;
            } | null | undefined;
            userRole?: string | null | undefined;
            uploadLocation?: {
                latitude?: number | null | undefined;
                longitude?: number | null | undefined;
                address?: string | null | undefined;
                accuracy?: number | null | undefined;
                capturedAt?: NativeDate | null | undefined;
            } | null | undefined;
            voteRating?: "good" | "okay" | "poor" | null | undefined;
            voterIntimidation?: "yes" | "no" | null | undefined;
            voteBuying?: "yes" | "no" | null | undefined;
            timeBegan?: string | null | undefined;
            accreditedVoters?: number | null | undefined;
            rejectedPapers?: number | null | undefined;
            spoiledBallotPapers?: number | null | undefined;
            usedBallotPapers?: number | null | undefined;
            priorityLevel?: number | null | undefined;
        }> & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        incidentReports: (import("mongoose").FlattenMaps<{
            createdAt: NativeDate;
            updatedAt: NativeDate;
            hidden: boolean;
            state: string;
            lga: string;
            ward: string;
            pollingUnit: string;
            election: Types.ObjectId;
            flagged: boolean;
            user: Types.ObjectId;
            userRole: string;
            actions: Types.DocumentArray<{
                action: "agree" | "flag";
                flagImage?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                flagVideo?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                userId?: Types.ObjectId | null | undefined;
                flagReason?: string | null | undefined;
                evidenceId?: Types.ObjectId | null | undefined;
            } | {
                action: "agree" | "flag";
                flagImage?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                flagVideo?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                userId?: string | null | undefined;
                flagReason?: string | null | undefined;
                evidenceId?: string | null | undefined;
                _id: string;
                __v: number;
            }, Types.Subdocument<string | Types.ObjectId, any, {
                action: "agree" | "flag";
                flagImage?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                flagVideo?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                userId?: Types.ObjectId | null | undefined;
                flagReason?: string | null | undefined;
                evidenceId?: Types.ObjectId | null | undefined;
            } | {
                action: "agree" | "flag";
                flagImage?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                flagVideo?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                userId?: string | null | undefined;
                flagReason?: string | null | undefined;
                evidenceId?: string | null | undefined;
                _id: string;
                __v: number;
            }> & ({
                action: "agree" | "flag";
                flagImage?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                flagVideo?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                userId?: Types.ObjectId | null | undefined;
                flagReason?: string | null | undefined;
                evidenceId?: Types.ObjectId | null | undefined;
            } | {
                action: "agree" | "flag";
                flagImage?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                flagVideo?: {
                    name?: string | null | undefined;
                    type?: string | null | undefined;
                    url?: string | null | undefined;
                    location?: string | null | undefined;
                    size?: number | null | undefined;
                } | null | undefined;
                userId?: string | null | undefined;
                flagReason?: string | null | undefined;
                evidenceId?: string | null | undefined;
                _id: string;
                __v: number;
            })>;
            agreed: boolean;
            selectIncident: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other";
            incidentNote: string;
            incidentPictures: Types.DocumentArray<{
                name?: string | null | undefined;
                type?: string | null | undefined;
                url?: string | null | undefined;
                location?: string | null | undefined;
                size?: number | null | undefined;
            }, Types.Subdocument<Types.ObjectId, any, {
                name?: string | null | undefined;
                type?: string | null | undefined;
                url?: string | null | undefined;
                location?: string | null | undefined;
                size?: number | null | undefined;
            }> & {
                name?: string | null | undefined;
                type?: string | null | undefined;
                url?: string | null | undefined;
                location?: string | null | undefined;
                size?: number | null | undefined;
            }>;
            incidentVideos: Types.DocumentArray<{
                name?: string | null | undefined;
                type?: string | null | undefined;
                url?: string | null | undefined;
                location?: string | null | undefined;
                size?: number | null | undefined;
            }, Types.Subdocument<Types.ObjectId, any, {
                name?: string | null | undefined;
                type?: string | null | undefined;
                url?: string | null | undefined;
                location?: string | null | undefined;
                size?: number | null | undefined;
            }> & {
                name?: string | null | undefined;
                type?: string | null | undefined;
                url?: string | null | undefined;
                location?: string | null | undefined;
                size?: number | null | undefined;
            }>;
            uploadLocation?: {
                latitude?: number | null | undefined;
                longitude?: number | null | undefined;
                address?: string | null | undefined;
                accuracy?: number | null | undefined;
                capturedAt?: NativeDate | null | undefined;
            } | null | undefined;
            priorityLevel?: number | null | undefined;
            electionRating?: string | null | undefined;
        }> & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        createdAt: NativeDate;
        updatedAt: NativeDate;
        startDate: NativeDate;
        endDate: NativeDate;
        resultsCount: number;
        mockElection: boolean;
        electionLocation?: string | null | undefined;
        _id: Types.ObjectId;
        __v: number;
    };
}>;
export {};
//# sourceMappingURL=electionService.d.ts.map