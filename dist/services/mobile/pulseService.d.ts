import { type Types } from "mongoose";
type Id = Types.ObjectId | string;
export type VisibilityScope = "all" | "state" | "lga" | "ward" | "polling-unit";
export type PulseFeedScope = VisibilityScope;
type MulterMemoryFile = {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
};
export declare const parsePulseFeedScope: (value: unknown) => PulseFeedScope;
export declare const parseVisibilityScope: (value: unknown, fallback?: VisibilityScope) => VisibilityScope;
export declare const listPulseFeed: (input?: {
    page?: number;
    limit?: number;
    scope?: unknown;
    viewerUserId?: Id | null;
}) => Promise<{
    posts: {
        id: string;
        body: string | undefined;
        imageUrl: string | null;
        visibilityScope: string;
        audienceState: string | null;
        audienceLga: string | null;
        audienceWard: string | null;
        audiencePollingUnit: string | null;
        isRepost: boolean;
        originalPost: {
            id: string;
            body: string | undefined;
            imageUrl: string | null;
            author: {
                id: string | undefined;
                displayName: string;
                usedAnonymous: boolean;
            };
        } | {
            id: string;
            body?: undefined;
            imageUrl?: undefined;
            author?: undefined;
        } | null;
        repostCount: number;
        createdAt: Date | undefined;
        updatedAt: Date | undefined;
        author: {
            id: string | undefined;
            displayName: string;
            usedAnonymous: boolean;
        };
        likesCount: number;
        commentsCount: number;
        isLikedByCurrentUser: boolean;
    }[];
    total: number;
    page: number;
    limit: number;
    scope: VisibilityScope;
}>;
export declare const listPulsePosts: (userId: Id, page?: number, limit?: number, scope?: unknown) => Promise<{
    posts: {
        id: string;
        body: string | undefined;
        imageUrl: string | null;
        visibilityScope: string;
        audienceState: string | null;
        audienceLga: string | null;
        audienceWard: string | null;
        audiencePollingUnit: string | null;
        isRepost: boolean;
        originalPost: {
            id: string;
            body: string | undefined;
            imageUrl: string | null;
            author: {
                id: string | undefined;
                displayName: string;
                usedAnonymous: boolean;
            };
        } | {
            id: string;
            body?: undefined;
            imageUrl?: undefined;
            author?: undefined;
        } | null;
        repostCount: number;
        createdAt: Date | undefined;
        updatedAt: Date | undefined;
        author: {
            id: string | undefined;
            displayName: string;
            usedAnonymous: boolean;
        };
        likesCount: number;
        commentsCount: number;
        isLikedByCurrentUser: boolean;
    }[];
    total: number;
    page: number;
    limit: number;
    scope: VisibilityScope;
}>;
/** Public web feed: no auth required for scope=all. */
export declare const listPulsePostsPublic: (page?: number, limit?: number, scope?: unknown, viewerUserId?: Id | null) => Promise<{
    posts: {
        id: string;
        body: string | undefined;
        imageUrl: string | null;
        visibilityScope: string;
        audienceState: string | null;
        audienceLga: string | null;
        audienceWard: string | null;
        audiencePollingUnit: string | null;
        isRepost: boolean;
        originalPost: {
            id: string;
            body: string | undefined;
            imageUrl: string | null;
            author: {
                id: string | undefined;
                displayName: string;
                usedAnonymous: boolean;
            };
        } | {
            id: string;
            body?: undefined;
            imageUrl?: undefined;
            author?: undefined;
        } | null;
        repostCount: number;
        createdAt: Date | undefined;
        updatedAt: Date | undefined;
        author: {
            id: string | undefined;
            displayName: string;
            usedAnonymous: boolean;
        };
        likesCount: number;
        commentsCount: number;
        isLikedByCurrentUser: boolean;
    }[];
    total: number;
    page: number;
    limit: number;
    scope: VisibilityScope;
}>;
export declare const createPulsePost: (userId: Id, input: {
    body: string;
    visibilityScope?: unknown;
    useAnonymousDisplay?: boolean;
}, media?: {
    image?: MulterMemoryFile;
}) => Promise<{
    id: string;
    body: string | undefined;
    imageUrl: string | null;
    visibilityScope: string;
    audienceState: string | null;
    audienceLga: string | null;
    audienceWard: string | null;
    audiencePollingUnit: string | null;
    isRepost: boolean;
    originalPost: {
        id: string;
        body: string | undefined;
        imageUrl: string | null;
        author: {
            id: string | undefined;
            displayName: string;
            usedAnonymous: boolean;
        };
    } | {
        id: string;
        body?: undefined;
        imageUrl?: undefined;
        author?: undefined;
    } | null;
    repostCount: number;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | undefined;
        displayName: string;
        usedAnonymous: boolean;
    };
    likesCount: number;
    commentsCount: number;
    isLikedByCurrentUser: boolean;
}>;
export declare const repostPulsePost: (userId: Id, postId: string) => Promise<{
    id: string;
    body: string | undefined;
    imageUrl: string | null;
    visibilityScope: string;
    audienceState: string | null;
    audienceLga: string | null;
    audienceWard: string | null;
    audiencePollingUnit: string | null;
    isRepost: boolean;
    originalPost: {
        id: string;
        body: string | undefined;
        imageUrl: string | null;
        author: {
            id: string | undefined;
            displayName: string;
            usedAnonymous: boolean;
        };
    } | {
        id: string;
        body?: undefined;
        imageUrl?: undefined;
        author?: undefined;
    } | null;
    repostCount: number;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | undefined;
        displayName: string;
        usedAnonymous: boolean;
    };
    likesCount: number;
    commentsCount: number;
    isLikedByCurrentUser: boolean;
}>;
export declare const togglePulsePostLike: (userId: Id, postId: string) => Promise<{
    id: string;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
/** Auth required, but no location restriction (web). */
export declare const togglePulsePostLikeAnyLocation: (userId: Id, postId: string) => Promise<{
    id: string;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
export declare const listPulsePostComments: (userId: Id, postId: string) => Promise<{
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
/** Public comments: no location restriction. Optional viewer marks likes. */
export declare const listPulsePostCommentsPublic: (postId: string, viewerUserId?: Id | null) => Promise<{
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
export declare const addPulsePostComment: (userId: Id, postId: string, input: {
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
/** Auth required; no location gate (for public web feed engagement). */
export declare const addPulsePostCommentAnyLocation: (userId: Id, postId: string, input: {
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
export declare const togglePulseCommentLike: (userId: Id, postId: string, commentId: string) => Promise<{
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
/** Auth required; no location gate (for public web feed engagement). */
export declare const togglePulseCommentLikeAnyLocation: (userId: Id, postId: string, commentId: string) => Promise<{
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
//# sourceMappingURL=pulseService.d.ts.map