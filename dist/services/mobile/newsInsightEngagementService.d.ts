import type { Types } from "mongoose";
type Id = Types.ObjectId | string;
export declare const toggleNewsInsightArticleLike: (userId: Id, articleId: string) => Promise<{
    id: string;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
export declare const listNewsInsightArticleComments: (userId: Id, articleId: string) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    editedAt: Date | null;
    author: {
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
        avatarUrl: string | null;
    };
    isOwnedByCurrentUser: boolean;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}[]>;
export declare const addNewsInsightArticleComment: (userId: Id, articleId: string, input: {
    body: string;
    useAnonymousDisplay?: boolean;
}) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    editedAt: Date | null;
    author: {
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
        avatarUrl: string | null;
    };
    isOwnedByCurrentUser: boolean;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
export declare const toggleNewsInsightCommentLike: (userId: Id, articleId: string, commentId: string) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    editedAt: Date | null;
    author: {
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
        avatarUrl: string | null;
    };
    isOwnedByCurrentUser: boolean;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
export declare const countCommentsForArticles: (articleIds: string[]) => Promise<Map<string, number>>;
/** Comment author only. Send `body` and/or `useAnonymousDisplay`. */
export declare const updateNewsInsightComment: (userId: Id, articleId: string, commentId: string, input: {
    body?: unknown;
    useAnonymousDisplay?: boolean;
}) => Promise<{
    id: string;
    body: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    editedAt: Date | null;
    author: {
        id: string | null;
        displayName: string;
        usedAnonymous: boolean;
        avatarUrl: string | null;
    };
    isOwnedByCurrentUser: boolean;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
/** The comment's author, or an admin (moderation), can delete it. */
export declare const deleteNewsInsightComment: (userId: Id, articleId: string, commentId: string) => Promise<{
    id: string;
    deleted: boolean;
}>;
export {};
//# sourceMappingURL=newsInsightEngagementService.d.ts.map