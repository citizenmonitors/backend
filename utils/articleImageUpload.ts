import { uploadFileToFirebase } from "../config/firebaseUploader.ts";

type MulterMemoryFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

type FilesMap = Record<string, MulterMemoryFile[] | undefined>;

const THUMB_FILE_FIELDS = ["thumbnail", "thumbnailUrl"] as const;
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
 * Resolves thumbnail + hero for News / Press admin create.
 * Multipart files: `thumbnail` (required) and optional hero (`heroImage` or `heroImageURL`).
 * JSON body fallbacks: `thumbnailUrl` / `thumbnail` and `heroImageURL` / `heroImage` / `heroImageUrl` as HTTPS URLs.
 */
export const resolveArticleImageUrls = async (input: {
  body: Record<string, unknown>;
  files?: FilesMap;
  firebaseFolder: string;
}): Promise<{ thumbnailUrl: string; heroImageURL?: string }> => {
  const thumbFile = firstFile(input.files, THUMB_FILE_FIELDS);
  const heroFile = firstFile(input.files, HERO_FILE_FIELDS);

  let thumbnailUrl = "";
  if (thumbFile) {
    thumbnailUrl = (await uploadFileToFirebase(thumbFile, input.firebaseFolder)).publicUrl;
  } else {
    const fromBody = String(
      input.body.thumbnailUrl ?? input.body.thumbnail ?? ""
    ).trim();
    if (fromBody && isHttpUrl(fromBody)) thumbnailUrl = fromBody;
  }

  if (!thumbnailUrl) {
    throw new Error(
      'thumbnail is required — upload an image file (form-data field "thumbnail", type File)'
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

  return { thumbnailUrl, heroImageURL };
};
