import { type Types } from "mongoose";
type Id = Types.ObjectId | string;
export type VisibilityScope = "all" | "state" | "lga" | "ward" | "polling-unit";
export type PulseFeedScope = VisibilityScope;
type MulterMemoryFile = {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
};
type AuthorLean = {
    _id?: Id;
    firstName?: string | null;
    lastName?: string | null;
    anonymousUsername?: string | null;
};
export declare const parsePulseFeedScope: (value: unknown) => PulseFeedScope;
export declare const parseVisibilityScope: (value: unknown, fallback?: VisibilityScope) => VisibilityScope;
export declare const formatAuthorDisplay: (author: AuthorLean | null | undefined, useAnonymousDisplay: boolean) => {
    displayName: string;
    usedAnonymous: boolean;
};
export declare const PULSE_IMAGE_UPLOAD_FAILED_MESSAGE = "Your post was published without the image because the image could not be uploaded. Try adding it again later.";
/** Users hidden from the viewer: those they blocked and those who blocked them. */
export declare const hiddenUserIdsFor: (viewerUserId: Id) => Promise<string[]>;
/** Throws when either user has blocked the other. */
export declare const assertNotBlockedBetween: (userId: Id, otherUserId: unknown) => Promise<void>;
/** Feed filter that hides blocked users' posts, reposts of their posts, and posts the viewer reported. */
export declare const buildViewerSafetyFilter: (viewerUserId: Id) => Promise<{
    filter: Record<string, unknown>;
    hiddenUserIds: string[];
}>;
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
        isQuote: boolean;
        originalPost: {
            id: string;
            body: string | undefined;
            imageUrl: string | null;
            isQuote: boolean;
            createdAt: Date | undefined;
            author: {
                id: string | null;
                displayName: string;
                usedAnonymous: boolean;
            };
            unavailable: boolean;
        } | {
            id: string;
            unavailable: boolean;
            body?: undefined;
            imageUrl?: undefined;
            isQuote?: undefined;
            createdAt?: undefined;
            author?: undefined;
        } | null;
        repostCount: number;
        quoteCount: number;
        isRepostedByCurrentUser: boolean;
        createdAt: Date | undefined;
        updatedAt: Date | undefined;
        author: {
            id: string | null;
            displayName: string;
            usedAnonymous: boolean;
        };
        isOwnedByCurrentUser: boolean;
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
        isQuote: boolean;
        originalPost: {
            id: string;
            body: string | undefined;
            imageUrl: string | null;
            isQuote: boolean;
            createdAt: Date | undefined;
            author: {
                id: string | null;
                displayName: string;
                usedAnonymous: boolean;
            };
            unavailable: boolean;
        } | {
            id: string;
            unavailable: boolean;
            body?: undefined;
            imageUrl?: undefined;
            isQuote?: undefined;
            createdAt?: undefined;
            author?: undefined;
        } | null;
        repostCount: number;
        quoteCount: number;
        isRepostedByCurrentUser: boolean;
        createdAt: Date | undefined;
        updatedAt: Date | undefined;
        author: {
            id: string | null;
            displayName: string;
            usedAnonymous: boolean;
        };
        isOwnedByCurrentUser: boolean;
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
        isQuote: boolean;
        originalPost: {
            id: string;
            body: string | undefined;
            imageUrl: string | null;
            isQuote: boolean;
            createdAt: Date | undefined;
            author: {
                id: string | null;
                displayName: string;
                usedAnonymous: boolean;
            };
            unavailable: boolean;
        } | {
            id: string;
            unavailable: boolean;
            body?: undefined;
            imageUrl?: undefined;
            isQuote?: undefined;
            createdAt?: undefined;
            author?: undefined;
        } | null;
        repostCount: number;
        quoteCount: number;
        isRepostedByCurrentUser: boolean;
        createdAt: Date | undefined;
        updatedAt: Date | undefined;
        author: {
            id: string | null;
            displayName: string;
            usedAnonymous: boolean;
        };
        isOwnedByCurrentUser: boolean;
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
    imageUploadFailed: boolean;
    id: string;
    body: string | undefined;
    imageUrl: string | null;
    visibilityScope: string;
    audienceState: string | null;
    audienceLga: string | null;
    audienceWard: string | null;
    audiencePollingUnit: string | null;
    isRepost: boolean;
    isQuote: boolean;
    originalPost: {
        id: string;
        body: string | undefined;
        imageUrl: string | null;
        isQuote: boolean;
        createdAt: Date | undefined;
        author: {
            id: string | null;
            displayName: string;
            usedAnonymous: boolean;
        };
        unavailable: boolean;
    } | {
        id: string;
        unavailable: boolean;
        body?: undefined;
        imageUrl?: undefined;
        isQuote?: undefined;
        createdAt?: undefined;
        author?: undefined;
    } | null;
    repostCount: number;
    quoteCount: number;
    isRepostedByCurrentUser: boolean;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
    };
    isOwnedByCurrentUser: boolean;
    likesCount: number;
    commentsCount: number;
    isLikedByCurrentUser: boolean;
}>;
/**
 * Repost like X.
 * - No body: plain repost (one per user per post; not your own post).
 * - With body (and optional image): quote post with your own text on top. Many allowed,
 *   including quoting your own post.
 * Reposting a plain repost targets its original; reposting or quoting a quote targets
 * the quote itself.
 */
export declare const repostPulsePost: (userId: Id, postId: string, input?: {
    body?: unknown;
    visibilityScope?: unknown;
    useAnonymousDisplay?: boolean;
}, media?: {
    image?: MulterMemoryFile;
}) => Promise<{
    imageUploadFailed: boolean;
    id: string;
    body: string | undefined;
    imageUrl: string | null;
    visibilityScope: string;
    audienceState: string | null;
    audienceLga: string | null;
    audienceWard: string | null;
    audiencePollingUnit: string | null;
    isRepost: boolean;
    isQuote: boolean;
    originalPost: {
        id: string;
        body: string | undefined;
        imageUrl: string | null;
        isQuote: boolean;
        createdAt: Date | undefined;
        author: {
            id: string | null;
            displayName: string;
            usedAnonymous: boolean;
        };
        unavailable: boolean;
    } | {
        id: string;
        unavailable: boolean;
        body?: undefined;
        imageUrl?: undefined;
        isQuote?: undefined;
        createdAt?: undefined;
        author?: undefined;
    } | null;
    repostCount: number;
    quoteCount: number;
    isRepostedByCurrentUser: boolean;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
    };
    isOwnedByCurrentUser: boolean;
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
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
    };
    isOwnedByCurrentUser: boolean;
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
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
    };
    isOwnedByCurrentUser: boolean;
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
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
    };
    isOwnedByCurrentUser: boolean;
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
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
    };
    isOwnedByCurrentUser: boolean;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
export declare const togglePulseCommentLike: (userId: Id, postId: string, commentId: string) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
    };
    isOwnedByCurrentUser: boolean;
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
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
    };
    isOwnedByCurrentUser: boolean;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
/** Author only. Quotes can be edited; plain reposts can't (undo the repost instead). */
export declare const updatePulsePost: (userId: Id, postId: string, input: {
    body?: unknown;
    visibilityScope?: unknown;
    useAnonymousDisplay?: boolean;
    removeImage?: boolean;
}, media?: {
    image?: MulterMemoryFile;
}) => Promise<{
    imageUploadFailed: boolean;
    id: string;
    body: string | undefined;
    imageUrl: string | null;
    visibilityScope: string;
    audienceState: string | null;
    audienceLga: string | null;
    audienceWard: string | null;
    audiencePollingUnit: string | null;
    isRepost: boolean;
    isQuote: boolean;
    originalPost: {
        id: string;
        body: string | undefined;
        imageUrl: string | null;
        isQuote: boolean;
        createdAt: Date | undefined;
        author: {
            id: string | null;
            displayName: string;
            usedAnonymous: boolean;
        };
        unavailable: boolean;
    } | {
        id: string;
        unavailable: boolean;
        body?: undefined;
        imageUrl?: undefined;
        isQuote?: undefined;
        createdAt?: undefined;
        author?: undefined;
    } | null;
    repostCount: number;
    quoteCount: number;
    isRepostedByCurrentUser: boolean;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
    };
    isOwnedByCurrentUser: boolean;
    likesCount: number;
    commentsCount: number;
    isLikedByCurrentUser: boolean;
}>;
/**
 * Author only.
 * - Deletes the post, its comments, and plain reposts of it (with their comments).
 * - Quotes of it are kept and show the original as unavailable, like on X.
 * - A deleted repost or quote lowers the target's repostCount / quoteCount.
 */
export declare const deletePulsePost: (userId: Id, postId: string) => Promise<{
    id: string;
    deleted: boolean;
    repostsDeleted: number;
}>;
/** No ownership check — callers must authorize (author or admin). */
export declare const deletePulsePostCore: (post: {
    _id: Types.ObjectId;
    repostedFrom?: Types.ObjectId | null;
    isQuote?: boolean | null;
}) => Promise<{
    id: string;
    deleted: boolean;
    repostsDeleted: number;
}>;
/**
 * Undo a plain repost. postId may be the reposted post or the viewer's own repost of it.
 * Quotes are removed with DELETE /posts/:quoteId instead.
 */
export declare const undoPulseRepost: (userId: Id, postId: string) => Promise<{
    id: string;
    removedRepostId: string;
    repostCount: number;
}>;
/** Idempotent unlike (POST /like still toggles). */
export declare const unlikePulsePost: (userId: Id, postId: string) => Promise<{
    id: string;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
/** Comment author only. */
export declare const updatePulseComment: (userId: Id, postId: string, commentId: string, input: {
    body?: unknown;
    useAnonymousDisplay?: boolean;
}) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
    };
    isOwnedByCurrentUser: boolean;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
/** The comment's author or the post's author can delete it. */
export declare const deletePulseComment: (userId: Id, postId: string, commentId: string) => Promise<{
    id: string;
    deleted: boolean;
}>;
/** Idempotent unlike (POST /like still toggles). */
export declare const unlikePulseComment: (userId: Id, postId: string, commentId: string) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    author: {
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
    };
    isOwnedByCurrentUser: boolean;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
export {};
//# sourceMappingURL=pulseService.d.ts.map