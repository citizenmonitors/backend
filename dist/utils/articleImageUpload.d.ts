type MulterMemoryFile = {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
};
type FilesMap = Record<string, MulterMemoryFile[] | undefined>;
/**
 * Resolves thumbnailURL + hero for News / Press admin create.
 * Multipart files: thumbnail (`thumbnail`, `thumbnailUrl`, or `thumbnailURL`) and optional hero.
 * JSON body fallbacks: same names as HTTPS URLs when not uploading files.
 */
export declare const resolveArticleImageUrls: (input: {
    body: Record<string, unknown>;
    files?: FilesMap;
    firebaseFolder: string;
}) => Promise<{
    thumbnailURLUrl: string;
    heroImageURL?: string;
}>;
export {};
//# sourceMappingURL=articleImageUpload.d.ts.map