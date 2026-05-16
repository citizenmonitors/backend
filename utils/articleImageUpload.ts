import { uploadFileToFirebase } from "../config/firebaseUploader.ts";

type MulterMemoryFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

type FilesMap = Record<string, MulterMemoryFile[] | undefined>;

const THUMB_FILE_FIELDS = [
  "thumbnail",
  "thumbnailUrl",
  "thumbnailURL",
  "thumbnailURLUrl",
] as const;
const HERO_FILE_FIELDS = ["heroImage", "heroImageURL", "heroImageUrl"] as const;

const firstFile = (files: FilesMap | undefined, names: readonly string[]): MulterMemoryFile | undefined => {
  if (!files) return undefined;
  for (const name of names) {
    const list = files[name];
    if (Array.isArray(list) && list.length > 0) return list[0];
  }
  return undefined;
};

const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value.trim());

/**
 * Resolves thumbnailURL + hero for News / Press admin create.
 * Multipart files: thumbnail (`thumbnail`, `thumbnailUrl`, or `thumbnailURL`) and optional hero.
 * JSON body fallbacks: same names as HTTPS URLs when not uploading files.
 */
export const resolveArticleImageUrls = async (input: {
  body: Record<string, unknown>;
  files?: FilesMap;
  firebaseFolder: string;
}): Promise<{ thumbnailURLUrl: string; heroImageURL?: string }> => {
  const thumbFile = firstFile(input.files, THUMB_FILE_FIELDS);
  const heroFile = firstFile(input.files, HERO_FILE_FIELDS);

  let thumbnailURLUrl = "";
  if (thumbFile) {
    thumbnailURLUrl = (await uploadFileToFirebase(thumbFile, input.firebaseFolder)).publicUrl;
  } else {
    const fromBody = String(
      input.body.thumbnailURLUrl ??
        input.body.thumbnailURL ??
        input.body.thumbnailUrl ??
        input.body.thumbnail ??
        ""
    ).trim();
    if (fromBody && isHttpUrl(fromBody)) thumbnailURLUrl = fromBody;
  }

  if (!thumbnailURLUrl) {
    throw new Error(
      'thumbnail is required — upload an image file (form-data field "thumbnail" or "thumbnailURL", type File)'
    );
  }

  let heroImageURL: string | undefined;
  if (heroFile) {
    heroImageURL = (await uploadFileToFirebase(heroFile, input.firebaseFolder)).publicUrl;
  } else {
    const fromBody = String(
      input.body.heroImageURL ??
        input.body.heroImageUrl ??
        input.body.heroImageURLUrl ??
        input.body.heroImage ??
        ""
    ).trim();
    if (fromBody && isHttpUrl(fromBody)) heroImageURL = fromBody;
  }

  return { thumbnailURLUrl, heroImageURL };
};
