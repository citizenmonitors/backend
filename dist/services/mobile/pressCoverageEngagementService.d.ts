import type { Types } from "mongoose";
type Id = Types.ObjectId | string;
export declare const togglePressCoverageArticleLike: (userId: Id, articleId: string) => Promise<{
    id: string;
    likesCount: number;
    isLikedByCurrentUser: boolean;
}>;
export declare const listPressCoverageArticleComments: (userId: Id, articleId: string) => Promise<{
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
export declare const addPressCoverageArticleComment: (userId: Id, articleId: string, input: {
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
export declare const togglePressCoverageCommentLike: (userId: Id, articleId: string, commentId: string) => Promise<{
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
export { countCommentsForPressCoverageArticles } from "./pressCoverageService.ts";
//# sourceMappingURL=pressCoverageEngagementService.d.ts.map