/** Minimal shape for a file from multer (memory storage). */
interface MulterFile {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}
export interface FirebaseUploadResult {
    filePath: string;
    publicUrl: string;
    token: string;
}
export declare const uploadFileToFirebase: (file: MulterFile | undefined, folder?: string, customName?: string | null) => Promise<FirebaseUploadResult>;
export {};
//# sourceMappingURL=firebaseUploader.d.ts.map