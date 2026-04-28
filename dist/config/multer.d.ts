declare const upload: {
    single: (fieldName: string) => import("express").RequestHandler;
    fields: (fields: {
        name: string;
        maxCount?: number;
    }[]) => import("express").RequestHandler;
};
export default upload;
//# sourceMappingURL=multer.d.ts.map