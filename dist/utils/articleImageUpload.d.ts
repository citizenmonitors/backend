type MulterMemoryFile = {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
};
type FilesMap = Record<string, MulterMemoryFile[] | undefined>;
/**
 * Resolves thumbnail + hero for News / Press admin create.
 * Multipart: image **files** `thumbnail` (required) and optional `heroImage` → uploaded to Firebase.
 * JSON-only: optional `thumbnailUrl` / `heroImageUrl` body fields if already HTTPS URLs.
 */
export declare const resolveArticleImageUrls: (input: {
    body: Record<string, unknown>;
    files?: FilesMap;
    firebaseFolder: string;
}) => Promise<{
    thumbnailUrl: string;
    heroImageUrl?: string;
}>;
export {};
//# sourceMappingURL=articleImageUpload.d.ts.map