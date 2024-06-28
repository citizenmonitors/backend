export const formatFileDetails = (file) => ({
  location: file.path,
  name: file.originalname,
  type: file.mimetype,
  size: file.size,
});
