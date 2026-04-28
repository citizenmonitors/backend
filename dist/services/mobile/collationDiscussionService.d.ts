import type { Types } from "mongoose";
type Id = Types.ObjectId | string;
type VisibilityScope = "ward" | "lga";
type AuthorLean = {
    _id?: Id;
    firstName?: string | null;
    lastName?: string | null;
    anonymousUsername?: string | null;
};
type MulterMemoryFile = {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
};
export declare const formatCollationAuthorDisplay: (author: AuthorLean | null | undefined, useAnonymousDisplay: boolean) => {
    displayName: string;
    usedAnonymous: boolean;
};
export declare const listReportThreadComments: (activeElectionId: string, userId: Id, targetType: "election_result" | "incident_report", targetId: string) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | undefined;
        displayName: string;
        usedAnonymous: boolean;
    };
    likesCount: number;
    isLikedByCurrentUser: boolean;
}[]>;
export declare const addReportThreadComment: (activeElectionId: string, userId: Id, input: {
    targetType: "election_result" | "incident_report";
    targetId: string;
    body: string;
    useAnonymousDisplay?: boolean;
}) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | undefined;
        displayName: string;
        usedAnonymous: boolean;
    };
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
export declare const toggleReportCommentLike: (activeElectionId: string, userId: Id, commentId: string) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | undefined;
        displayName: string;
        usedAnonymous: boolean;
    };
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
export declare const listDiscussionPosts: (activeElectionId: string, userId: Id, page?: number, limit?: number) => Promise<{
    posts: {
        id: string;
        body: string;
        imageUrls: string[];
        videoUrls: string[];
        visibilityScope: "lga" | "ward";
        allowSocialShare: boolean;
        createdAt: NativeDate;
        updatedAt: NativeDate;
        author: {
            id: string | undefined;
            displayName: string;
            usedAnonymous: boolean;
        };
        likesCount: number;
        isLikedByCurrentUser: boolean;
    }[];
    total: number;
    page: number;
    limit: number;
}>;
export declare const createDiscussionPost: (activeElectionId: string, userId: Id, input: {
    body: string;
    imageUrls?: string[];
    videoUrls?: string[];
    visibilityScope?: VisibilityScope;
    allowSocialShare?: boolean;
    useAnonymousDisplay?: boolean;
}, media?: {
    images?: MulterMemoryFile[];
    videos?: MulterMemoryFile[];
}) => Promise<{
    id: string;
    body: string;
    imageUrls: string[];
    videoUrls: string[];
    visibilityScope: "lga" | "ward";
    allowSocialShare: boolean;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    author: {
        id: string | undefined;
        displayName: string;
        usedAnonymous: boolean;
    };
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
export declare const toggleDiscussionPostLike: (activeElectionId: string, userId: Id, postId: string) => Promise<{
    id: string;
    likesCount: number;
    isLikedByCurrentUser: boolean;
    author: {
        id: string | undefined;
        displayName: string;
        usedAnonymous: boolean;
    };
}>;
export declare const listPostComments: (activeElectionId: string, userId: Id, postId: string) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | undefined;
        displayName: string;
        usedAnonymous: boolean;
    };
    likesCount: number;
    isLikedByCurrentUser: boolean;
}[]>;
export declare const addPostComment: (activeElectionId: string, userId: Id, postId: string, input: {
    body: string;
    useAnonymousDisplay?: boolean;
}) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | undefined;
        displayName: string;
        usedAnonymous: boolean;
    };
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
export declare const togglePostCommentLike: (activeElectionId: string, userId: Id, postId: string, commentId: string) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | undefined;
        displayName: string;
        usedAnonymous: boolean;
    };
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
export {};
//# sourceMappingURL=collationDiscussionService.d.ts.map