import type { Types } from "mongoose";
type Id = Types.ObjectId | string;
type MulterMemoryFile = {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
};
export type FlagMediaFiles = {
    flagImage?: MulterMemoryFile[];
    flagVideo?: MulterMemoryFile[];
};
type ElectionResultUploadFiles = {
    resultPicture?: MulterMemoryFile[];
    resultVideo?: MulterMemoryFile[];
};
type IncidentReportUploadLike = Partial<Record<"incidentPictures" | "incidentVideos" | "incidentPictures[]" | "incidentVideos[]", MulterMemoryFile[]>>;
type CreateElectionInput = {
    electionType: string;
    electionName: string;
};
type ActivateElectionInput = {
    electionId: Id;
    electionLocation?: string | string[] | null;
    startDate: Date | string;
    endDate: Date | string;
    mockElection?: boolean;
};
/** Multipart/JSON body; validated in-service before persisting */
type UploadResultPayload = {
    partiesVotes?: string | Array<{
        party?: string | null;
        count?: number | string | null;
    }>;
    voterIntimidation?: "yes" | "no" | null | undefined;
    voteBuying?: "yes" | "no" | null | undefined;
    voteRating?: "good" | "okay" | "poor" | null | undefined;
    timeBegan?: string | null | undefined;
    accreditedVoters?: number | string | null | undefined;
    rejectedPapers?: number | string | null | undefined;
    spoiledBallotPapers?: number | string | null | undefined;
    usedBallotPapers?: number | string | null | undefined;
    uploadLocation?: string | {
        latitude?: number | string | null;
        longitude?: number | string | null;
        address?: string | null;
        accuracy?: number | string | null;
    };
};
type IncidentReportBody = {
    selectIncident?: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other" | null | undefined;
    incidentNote?: string | null | undefined;
    electionRating?: string | null | undefined;
    uploadLocation?: string | {
        latitude?: number | string | null;
        longitude?: number | string | null;
        address?: string | null;
        accuracy?: number | string | null;
    };
    keepIncidentVideoIds?: Array<Types.ObjectId | string>;
    keepIncidentPictureIds?: Array<Types.ObjectId | string>;
};
type PollingUnitActionPayload = {
    dataType: "election" | "incident";
    electionId: Id;
    action: "agree" | "flag" | "unagree";
    /** Required when `action` is `flag` (trimmed non-empty). */
    flagReason?: string;
    evidenceId?: string;
};
type FlagSubmissionCheckPayload = {
    electionId: Id;
    action: string;
    dataType: string;
};
export declare const createElectionService: (data: CreateElectionInput, adminId: Id) => Promise<{
    message: string;
    election: import("mongoose").Document<unknown, {}, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        electionType: string;
        electionName: string;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        electionType: string;
        electionName: string;
    } & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    };
}>;
export declare const updateElectionService: (electionId: Id, data: Record<string, unknown>, adminId: Id) => Promise<{
    message: string;
    updatedElection: import("mongoose").Document<unknown, {}, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        electionType: string;
        electionName: string;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        electionType: string;
        electionName: string;
    } & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    };
}>;
export declare const activeElections: (data: ActivateElectionInput, adminId: Id) => Promise<{
    message: string;
    activeElection: import("mongoose").Document<unknown, {}, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        election: Types.ObjectId;
        startDate: NativeDate;
        endDate: NativeDate;
        results: Types.ObjectId[];
        incidentReports: Types.ObjectId[];
        resultsCount: number;
        politicalParties: Types.DocumentArray<{
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }, Types.Subdocument<Types.ObjectId, any, {
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }> & {
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }>;
        mockElection: boolean;
        electionLocation?: string | null | undefined;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        election: Types.ObjectId;
        startDate: NativeDate;
        endDate: NativeDate;
        results: Types.ObjectId[];
        incidentReports: Types.ObjectId[];
        resultsCount: number;
        politicalParties: Types.DocumentArray<{
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }, Types.Subdocument<Types.ObjectId, any, {
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }> & {
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }>;
        mockElection: boolean;
        electionLocation?: string | null | undefined;
    } & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    };
}>;
export declare const updateActiveElections: (electionId: Id, data: Record<string, unknown>, adminId: Id) => Promise<{
    message: string;
    updatedElection: import("mongoose").Document<unknown, {}, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        election: Types.ObjectId;
        startDate: NativeDate;
        endDate: NativeDate;
        results: Types.ObjectId[];
        incidentReports: Types.ObjectId[];
        resultsCount: number;
        politicalParties: Types.DocumentArray<{
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }, Types.Subdocument<Types.ObjectId, any, {
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }> & {
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }>;
        mockElection: boolean;
        electionLocation?: string | null | undefined;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        election: Types.ObjectId;
        startDate: NativeDate;
        endDate: NativeDate;
        results: Types.ObjectId[];
        incidentReports: Types.ObjectId[];
        resultsCount: number;
        politicalParties: Types.DocumentArray<{
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }, Types.Subdocument<Types.ObjectId, any, {
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }> & {
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }>;
        mockElection: boolean;
        electionLocation?: string | null | undefined;
    } & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    };
}>;
export declare const deleteElectionService: (electionId: Id, adminId: Id) => Promise<{
    message: string;
}>;
export declare const deleteActiveElectionService: (activeElectionId: Id, adminId: Id) => Promise<{
    message: string;
}>;
export declare const getAllActiveElectionsService: (userId: Id) => Promise<{
    elections: {
        results: (string | Types.ObjectId)[];
        incidentReports: (string | Types.ObjectId)[];
        electionLocation?: unknown;
        electionType: string | undefined;
        electionName: string | undefined;
    }[];
}>;
export declare const getAllElectionTypesService: (userId: Id) => Promise<{
    elections: (import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
        electionType: string;
        electionName: string;
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
    message?: undefined;
    error?: undefined;
} | {
    message: string;
    error: any;
    elections?: undefined;
}>;
export declare const getElectionResultById: (electionId: Id, userId: Id) => Promise<{
    election: import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
        election: Types.ObjectId;
        startDate: NativeDate;
        endDate: NativeDate;
        results: Types.ObjectId[];
        incidentReports: Types.ObjectId[];
        resultsCount: number;
        politicalParties: Types.DocumentArray<{
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }, Types.Subdocument<Types.ObjectId, any, {
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }> & {
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }>;
        mockElection: boolean;
        electionLocation?: string | null | undefined;
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    };
    result: (import("mongoose").FlattenMaps<{
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
    }) | null;
    incidentReport: (import("mongoose").FlattenMaps<{
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
    }) | null;
} | undefined>;
export declare const getElectionById: (electionId: Id, userId: Id) => Promise<{
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
export declare const getLiveElectionById: (electionId: Id) => Promise<{
    election: {
        electionDetails: {
            electiontype: string;
            electionname: string;
            startdate: NativeDate;
            enddate: NativeDate;
        };
        results: {
            state: string;
            lga: string;
            ward: string;
            pollingUnit: string;
            partiesVotes: Types.DocumentArray<import("mongoose").FlattenMaps<{
                party?: string | null | undefined;
                count?: number | null | undefined;
            }>, Types.Subdocument<Types.ObjectId, any, import("mongoose").FlattenMaps<{
                party?: string | null | undefined;
                count?: number | null | undefined;
            }>> & import("mongoose").FlattenMaps<{
                party?: string | null | undefined;
                count?: number | null | undefined;
            }>>;
            voteRating: "good" | "okay" | "poor" | null | undefined;
            voterIntimidation: "yes" | "no" | null | undefined;
            voteBuying: "yes" | "no" | null | undefined;
        }[];
        incidentReports: {
            state: string;
            lga: string;
            ward: string;
            pollingUnit: string;
            selectIncident: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other";
            incidentNote: string;
            electionRating: string | null | undefined;
        }[];
    };
}>;
export declare const uploadResultDataService: (electionId: Id, userId: Id, data: UploadResultPayload, files: ElectionResultUploadFiles) => Promise<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
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
    }, Types.Subdocument<Types.ObjectId, any, {
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
    }> & {
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
    }>;
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
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const updateResultDataService: (electionId: Id, userId: Id, data?: UploadResultPayload, files?: ElectionResultUploadFiles) => Promise<import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
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
    }, Types.Subdocument<Types.ObjectId, any, {
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
    }> & {
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
    }>;
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
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
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
    }, Types.Subdocument<Types.ObjectId, any, {
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
    }> & {
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
    }>;
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
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const deleteElectionResultDataService: (electionId: Id, userId: Id) => Promise<{
    message: string;
}>;
export declare const getUserElectionData: (userId: Id) => Promise<(import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
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
    }, Types.Subdocument<Types.ObjectId, any, {
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
    }> & {
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
    }>;
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
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
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
    }, Types.Subdocument<Types.ObjectId, any, {
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
    }> & {
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
    }>;
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
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
})[]>;
export declare const getAllElectionResults: () => Promise<Record<string, unknown>>;
export declare const uploadIncidentReportDataService: (electionId: Id, userId: Id, data: IncidentReportBody, files: IncidentReportUploadLike) => Promise<import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
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
    }, Types.Subdocument<Types.ObjectId, any, {
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
    }> & {
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
    }>;
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
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
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
    }, Types.Subdocument<Types.ObjectId, any, {
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
    }> & {
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
    }>;
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
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const updateIncidentReportDataService: (electionId: Id, userId: Id, data?: IncidentReportBody, files?: IncidentReportUploadLike, replaceFiles?: boolean) => Promise<import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
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
    }, Types.Subdocument<Types.ObjectId, any, {
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
    }> & {
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
    }>;
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
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
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
    }, Types.Subdocument<Types.ObjectId, any, {
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
    }> & {
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
    }>;
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
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const deleteIncidentReportDataService: (electionId: Id, userId: Id) => Promise<{
    message: string;
}>;
export declare const getUserElectionResultsAndReports: (userId: Id) => Promise<{
    data: {
        electionResults: ({
            election: {
                _id: string | Types.ObjectId | undefined;
                electionType: string | undefined;
                electionName: string | undefined;
                startDate: string | Date | undefined;
                endDate: string | Date | undefined;
                mockElection: boolean | undefined;
                electionLocation: string | null | undefined;
                createdAt: string | Date | undefined;
                updatedAt: string | Date | undefined;
            };
            _id?: Types.ObjectId | string;
        } | null)[];
        incidentReports: ({
            election: {
                _id: string | Types.ObjectId | undefined;
                electionType: string | undefined;
                electionName: string | undefined;
                startDate: string | Date | undefined;
                endDate: string | Date | undefined;
                mockElection: boolean | undefined;
                electionLocation: string | null | undefined;
                createdAt: string | Date | undefined;
                updatedAt: string | Date | undefined;
            };
            _id?: Types.ObjectId | string;
        } | null)[];
    };
}>;
export declare const getResultsAndPerformAction: (userId: Id, actionData: PollingUnitActionPayload | null | undefined, flagMediaFiles?: FlagMediaFiles) => Promise<{
    results: {
        electionTypeId: string | Types.ObjectId | undefined;
        electionId: string | Types.ObjectId;
        electionType: string | undefined;
        electionName: string | undefined;
        pollingUnit: string | undefined;
        electionYear: string;
        uploadedAt: string | Date | undefined;
        partiesVotes: unknown;
        voteRating: string | null | undefined;
        voterIntimidation: string | null | undefined;
        voteBuying: string | null | undefined;
        resultPicture: unknown;
        resultVideo: unknown;
        agreed: boolean;
        flagged: boolean;
        hidden: boolean | undefined;
        priorityLevel: number | undefined;
        actions: {
            userId?: Types.ObjectId | string;
            action?: string;
        }[];
        timeBegan: string | null | undefined;
        isApproved: boolean | undefined;
        election: {
            _id?: Types.ObjectId | string;
            election?: {
                electionType?: string;
                electionName?: string;
            };
            startDate?: Date | string | null;
            endDate?: Date | string | null;
            electionLocation?: string | null;
        } | null | undefined;
        electionLocation: string | null | undefined;
        startDate: string | Date | null;
        endDate: string | Date | null;
    }[];
    incidentReports: {
        electionTypeId: string | Types.ObjectId | undefined;
        electionId: string | Types.ObjectId;
        electionType: string | undefined;
        electionName: string | undefined;
        electionYear: string;
        pollingUnit: string | undefined;
        uploadedAt: string | Date | undefined;
        selectIncident: string | null | undefined;
        incidentNote: string | null | undefined;
        electionRating: string | null | undefined;
        incidentPictures: unknown;
        incidentVideos: unknown;
        agreed: boolean;
        flagged: boolean;
        hidden: boolean | undefined;
        priorityLevel: number | undefined;
        actions: {
            userId?: Types.ObjectId | string;
            action?: string;
        }[];
        electionLocation: string | null | undefined;
        startDate: string | Date | null;
        endDate: string | Date | null;
        election: {
            _id?: Types.ObjectId | string;
            election?: {
                electionType?: string;
                electionName?: string;
            };
            startDate?: Date | string | null;
            endDate?: Date | string | null;
            electionLocation?: string | null;
        } | null | undefined;
    }[];
}>;
export declare const checkUserSubmissionStatusForFlag: (userId: Id, actionData: FlagSubmissionCheckPayload) => Promise<{
    hasUploaded: boolean;
    evidenceId: Types.ObjectId;
} | {
    hasUploaded: boolean;
    evidenceId?: undefined;
}>;
export {};
//# sourceMappingURL=electionService.d.ts.map