import type { Types } from "mongoose";
type Id = Types.ObjectId | string;
type VisibilityScope = "ward" | "lga";
type MulterMemoryFile = {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
};
export declare const listPulsePosts: (userId: Id, page?: number, limit?: number) => Promise<{
    posts: {
        id: string;
        body: string;
        imageUrl: string | null;
        visibilityScope: "lga" | "ward";
        createdAt: NativeDate;
        updatedAt: NativeDate;
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
}>;
export declare const createPulsePost: (userId: Id, input: {
    body: string;
    visibilityScope?: VisibilityScope;
    useAnonymousDisplay?: boolean;
}, media?: {
    image?: MulterMemoryFile;
}) => Promise<{
    id: string;
    body: string;
    imageUrl: string | null;
    visibilityScope: "lga" | "ward";
    createdAt: NativeDate;
    updatedAt: NativeDate;
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
export {};
//# sourceMappingURL=pulseService.d.ts.map