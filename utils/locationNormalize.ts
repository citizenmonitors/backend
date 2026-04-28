/**
 * Normalize location path segments and folder names for resilient matching
 * against `data/states/...` directory names (hyphens, numeric prefixes,
 * extra spaces, punctuation, etc.).
 */
export function slugifyForLocationMatch(raw: string): string {
  const s = raw
    .trim()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[()]/g, " ")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return s
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Strip leading `NN-` segment used on many state/LGA/ward folders. */
export function stripLeadingNumericSlugSegment(slug: string): string {
  return slug.replace(/^\d+-/, "");
}
