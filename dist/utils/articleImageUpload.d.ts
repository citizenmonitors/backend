type MulterMemoryFile = {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
};
type FilesMap = Record<string, MulterMemoryFile[] | undefined>;
/**
 * Resolves thumbnail + hero for News / Press admin create.
 * Multipart files: `thumbnail` (required) and optional hero (`heroImage` or `heroImageURL`).
 * JSON body fallbacks: `thumbnailUrl` / `thumbnail` and `heroImageURL` / `heroImage` / `heroImageUrl` as HTTPS URLs.
 */
export declare const resolveArticleImageUrls: (input: {
    body: Record<string, unknown>;
    files?: FilesMap;
    firebaseFolder: string;
}) => Promise<{
    thumbnailUrl: string;
    heroImageURL?: string;
}>;
export {};
//# sourceMappingURL=articleImageUpload.d.ts.map