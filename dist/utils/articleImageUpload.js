import { uploadFileToFirebase } from "../config/firebaseUploader.js";
const firstFile = (files, ...names) => {
    if (!files)
        return undefined;
    for (const name of names) {
        const list = files[name];
        if (Array.isArray(list) && list.length > 0)
            return list[0];
    }
    return undefined;
};
const isHttpUrl = (value) => /^https?:\/\//i.test(value.trim());
/**
 * Resolves thumbnail + hero for News / Press admin create.
 * Multipart: image **files** `thumbnail` (required) and optional `heroImage` → uploaded to Firebase.
 * JSON-only: optional `thumbnailUrl` / `heroImageUrl` body fields if already HTTPS URLs.
 */
export const resolveArticleImageUrls = async (input) => {
    const thumbFile = firstFile(input.files, "thumbnail");
    const heroFile = firstFile(input.files, "heroImage");
    let thumbnailUrl = "";
    if (thumbFile) {
        thumbnailUrl = (await uploadFileToFirebase(thumbFile, input.firebaseFolder)).publicUrl;
    }
    else {
        const fromBody = String(input.body.thumbnailUrl ?? "").trim();
        if (fromBody && isHttpUrl(fromBody))
            thumbnailUrl = fromBody;
    }
    if (!thumbnailUrl) {
        throw new Error("thumbnail is required — upload an image file (form-data field \"thumbnail\", type File)");
    }
    let heroImageUrl;
    if (heroFile) {
        heroImageUrl = (await uploadFileToFirebase(heroFile, input.firebaseFolder)).publicUrl;
    }
    else {
        const fromBody = String(input.body.heroImageUrl ?? "").trim();
        if (fromBody && isHttpUrl(fromBody))
            heroImageUrl = fromBody;
    }
    return { thumbnailUrl, heroImageUrl };
};
//# sourceMappingURL=articleImageUpload.js.map