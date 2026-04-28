declare module "multer" {
  type MulterFile = { originalname: string; mimetype: string };
  type FileFilterCb = (error: Error | null, acceptFile?: boolean) => void;
  type FileField = { name: string; maxCount?: number };

  type MulterOptions = {
    storage?: unknown;
    limits?: Record<string, number>;
    fileFilter?: (
      req: import("express").Request,
      file: MulterFile,
      cb: FileFilterCb
    ) => void;
  };

  type MulterInstance = {
    single: (fieldName: string) => import("express").RequestHandler;
    fields: (fields: FileField[]) => import("express").RequestHandler;
  };

  type MulterFactory = {
    (options?: MulterOptions): MulterInstance;
    memoryStorage: () => unknown;
  };

  const multer: MulterFactory;
  export default multer;
}

