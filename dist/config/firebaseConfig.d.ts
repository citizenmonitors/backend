type FirebaseFileRef = {
    name: string;
    save: (buffer: Buffer, options: {
        metadata: {
            contentType: string;
            metadata: {
                firebaseStorageDownloadTokens: string;
            };
        };
    }) => Promise<void>;
    exists: () => Promise<[boolean]>;
    delete: () => Promise<void>;
};
type FirebaseBucket = {
    name: string;
    file: (filePath: string) => FirebaseFileRef;
};
declare const bucket: FirebaseBucket;
export default bucket;
//# sourceMappingURL=firebaseConfig.d.ts.map