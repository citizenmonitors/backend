type FileInput = {
  path?: string;
  originalname?: string;
  mimetype?: string;
  size?: number;
  url?: string;
};

export const formatFileDetails = (file: FileInput) => ({
  location: file?.path,
  name: file?.originalname,
  type: file?.mimetype,
  size: file?.size,
  url: file?.url,
});

