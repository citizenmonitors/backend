type FileInput = {
    path?: string;
    originalname?: string;
    mimetype?: string;
    size?: number;
    url?: string;
};
export declare const formatFileDetails: (file: FileInput) => {
    location: string | undefined;
    name: string | undefined;
    type: string | undefined;
    size: number | undefined;
    url: string | undefined;
};
export {};
//# sourceMappingURL=formatFileDetails.d.ts.map