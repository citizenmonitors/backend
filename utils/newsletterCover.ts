import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bucket from "../config/firebaseConfig.ts";
import NewsInsight from "../models/admin/NewsInsight.ts";

export type NewsletterCover = {
  file: string;
  themes: string[];
  url: string;
};

const COVER_CATALOG: { file: string; themes: string[] }[] = [
  { file: "newsletter-abstract-01.jpg", themes: ["vote", "election"] },
  { file: "newsletter-abstract-02.jpg", themes: ["default"] },
  { file: "newsletter-abstract-03.jpg", themes: ["default"] },
  { file: "newsletter-abstract-04.jpg", themes: ["default"] },
  { file: "newsletter-abstract-05.jpg", themes: ["default"] },
  { file: "newsletter-abstract-06.jpg", themes: ["default"] },
  { file: "newsletter-theme-roads.jpg", themes: ["roads", "infrastructure"] },
  { file: "newsletter-theme-records.jpg", themes: ["records", "fact-check", "debt"] },
  { file: "newsletter-theme-promises.jpg", themes: ["promises", "fake"] },
  {
    file: "newsletter-theme-accountability.jpg",
    themes: ["accountability", "justice"],
  },
  { file: "newsletter-theme-citizens.jpg", themes: ["citizens", "change"] },
];

const THEME_KEYWORDS: { theme: string; pattern: RegExp }[] = [
  { theme: "roads", pattern: /\b(road|highway|pothole|infrastructure|bridge)\b/i },
  { theme: "fact-check", pattern: /\b(fact\s*check|debt|money|governor|handover|dmo)\b/i },
  { theme: "records", pattern: /\b(audit|financial|statement|records|budget)\b/i },
  { theme: "promises", pattern: /\b(fake|promise|counterfeit|product|accept less)\b/i },
  { theme: "vote", pattern: /\b(vote|election|ballot|inec|polling)\b/i },
  { theme: "change", pattern: /\b(change|mistake|candidate|2027)\b/i },
  { theme: "accountability", pattern: /\b(accountab|justice|corrupt|institution)\b/i },
  { theme: "citizens", pattern: /\b(citizen|voter|public)\b/i },
];

const COVER_MARKER = "cm-newsletter-cover";
const FIREBASE_FOLDER = "newsletter-covers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_COVER_DIR = path.resolve(__dirname, "../public/newsletter-covers");

const firebaseUrlCache = new Map<string, string>();

const stableDownloadToken = (file: string): string =>
  crypto.createHash("sha256").update(`citizen-monitors:${FIREBASE_FOLDER}:${file}`).digest("hex");

const firebasePublicUrl = (file: string): string => {
  const objectPath = `${FIREBASE_FOLDER}/${file}`;
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media&token=${stableDownloadToken(file)}`;
};

const localCoverPath = (file: string): string => path.join(LOCAL_COVER_DIR, file);

const filenameFromUrl = (url: string): string => {
  const raw = String(url ?? "");
  const decoded = decodeURIComponent(raw);
  const folderMatch = decoded.match(/newsletter-covers\/([^/?#]+)/i);
  if (folderMatch?.[1]) return folderMatch[1];
  try {
    const pathname = new URL(raw).pathname;
    return decodeURIComponent(pathname).split("/").filter(Boolean).pop() || "";
  } catch {
    return raw.split("/").filter(Boolean).pop()?.split("?")[0] || "";
  }
};

export const newsletterCoverUrl = (file: string): string =>
  firebaseUrlCache.get(file) || firebasePublicUrl(file);

const isCatalogCover = (file: string): boolean =>
  COVER_CATALOG.some((cover) => cover.file === file);

/** Rewrite Render / local newsletter-cover URLs to the matching Firebase public URL. */
export const rewriteLegacyCoverUrl = (url: string): string => {
  const raw = String(url ?? "").trim();
  if (!raw) return raw;
  if (/firebasestorage\.googleapis\.com/i.test(raw)) return raw;
  const file = filenameFromUrl(raw);
  if (!file || !isCatalogCover(file)) return raw;
  const isLegacyHost =
    /navalny\.onrender\.com/i.test(raw) ||
    /onrender\.com\/newsletter-covers/i.test(raw) ||
    /(?:^|\/)newsletter-covers\//i.test(raw);
  return isLegacyHost ? firebasePublicUrl(file) : raw;
};

export const rewriteLegacyCoverUrlsInHtml = (html: string): string =>
  String(html ?? "").replace(/https?:\/\/[^"'>\s]+/gi, (match) =>
    rewriteLegacyCoverUrl(match)
  );

const withUrl = (item: { file: string; themes: string[] }): NewsletterCover => ({
  ...item,
  url: newsletterCoverUrl(item.file),
});

const themesFromText = (text: string): string[] =>
  THEME_KEYWORDS.filter((entry) => entry.pattern.test(text)).map(
    (entry) => entry.theme
  );

const pickFromPool = <T,>(pool: T[]): T =>
  pool[Math.floor(Math.random() * pool.length)];

const uploadCoverToFirebase = async (file: string): Promise<string> => {
  const cached = firebaseUrlCache.get(file);
  if (cached) return cached;

  const diskPath = localCoverPath(file);
  if (!fs.existsSync(diskPath)) {
    throw new Error(`Newsletter cover file missing locally: ${file}`);
  }

  const objectPath = `${FIREBASE_FOLDER}/${file}`;
  const remote = bucket.file(objectPath);
  const [alreadyUploaded] = await remote.exists();
  if (alreadyUploaded) {
    const url = firebasePublicUrl(file);
    firebaseUrlCache.set(file, url);
    return url;
  }

  const token = stableDownloadToken(file);
  const buffer = fs.readFileSync(diskPath);

  await remote.save(buffer, {
    metadata: {
      contentType: "image/jpeg",
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  const url = firebasePublicUrl(file);
  firebaseUrlCache.set(file, url);
  return url;
};

/** Upload every catalog cover to Firebase and return Firebase URLs. */
export const ensureNewsletterCoversOnFirebase = async (): Promise<NewsletterCover[]> => {
  const covers: NewsletterCover[] = [];
  for (const item of COVER_CATALOG) {
    const url = await uploadCoverToFirebase(item.file);
    covers.push({ ...item, url });
  }
  return covers;
};

/**
 * Pick a cover for a newsletter / News & Insight edition.
 * Prefers a theme match from the title, then unused recent covers, then any cover.
 * URLs are Firebase Storage public links.
 */
export const pickNewsletterCover = async (input?: {
  title?: string;
  excerpt?: string;
  overrideUrl?: string;
}): Promise<NewsletterCover> => {
  const override = String(input?.overrideUrl ?? "").trim();
  if (override && !/navalny\.onrender\.com\/newsletter-covers\//i.test(override)) {
    return {
      file: filenameFromUrl(override) || "custom",
      themes: ["custom"],
      url: override,
    };
  }

  const envOverride = process.env.NEWSLETTER_NEWS_THUMBNAIL_URL?.trim();
  if (envOverride && !/navalny\.onrender\.com\/newsletter-covers\//i.test(envOverride)) {
    return {
      file: filenameFromUrl(envOverride) || "override",
      themes: ["override"],
      url: envOverride,
    };
  }

  const haystack = `${input?.title ?? ""} ${input?.excerpt ?? ""}`;
  const matchedThemes = themesFromText(haystack);

  const recent = await NewsInsight.find({ isPublished: true })
    .sort({ publishedAt: -1 })
    .limit(8)
    .select("thumbnailURLUrl")
    .lean();
  const recentlyUsed = new Set(
    recent
      .map((row) => filenameFromUrl(String(row.thumbnailURLUrl ?? "")))
      .filter(Boolean)
  );

  const themed = COVER_CATALOG.filter((cover) =>
    cover.themes.some((theme) => matchedThemes.includes(theme))
  );
  const unusedThemed = themed.filter((cover) => !recentlyUsed.has(cover.file));
  const unusedAny = COVER_CATALOG.filter((cover) => !recentlyUsed.has(cover.file));

  const chosen =
    (unusedThemed.length > 0 && pickFromPool(unusedThemed)) ||
    (themed.length > 0 && pickFromPool(themed)) ||
    (unusedAny.length > 0 && pickFromPool(unusedAny)) ||
    pickFromPool(COVER_CATALOG);

  const url = await uploadCoverToFirebase(chosen.file);
  return { ...chosen, url };
};

export const embedNewsletterCoverInContent = (
  content: string,
  cover: NewsletterCover,
  title: string
): string => {
  const body = String(content ?? "").trim();
  if (!body || !cover.url) return body;
  if (body.includes(COVER_MARKER) || body.includes(cover.url)) return body;

  const alt = title.replace(/"/g, "&quot;");
  return `<figure class="${COVER_MARKER}" style="margin:0 0 16px;padding:0;">
  <img src="${cover.url}" alt="${alt}" style="display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:8px;" />
</figure>
${body}`;
};

export const listNewsletterCovers = (): NewsletterCover[] =>
  COVER_CATALOG.map(withUrl);

/** Persist Firebase cover URLs onto existing NewsInsight documents. */
export const migrateNewsInsightCoverUrls = async (): Promise<{
  scanned: number;
  updated: number;
}> => {
  const rows = await NewsInsight.find({}).select(
    "title excerpt content thumbnailURLUrl heroImageURL"
  );
  let updated = 0;

  for (const row of rows) {
    const nextThumbnail = rewriteLegacyCoverUrl(String(row.thumbnailURLUrl ?? ""));
    const nextHero = rewriteLegacyCoverUrl(String(row.heroImageURL ?? ""));
    let nextContent = rewriteLegacyCoverUrlsInHtml(String(row.content ?? ""));

    const coverUrl = nextThumbnail || nextHero;
    if (
      coverUrl &&
      nextContent &&
      !nextContent.includes(coverUrl) &&
      !nextContent.includes(COVER_MARKER)
    ) {
      nextContent = embedNewsletterCoverInContent(
        nextContent,
        {
          file: filenameFromUrl(coverUrl) || "cover",
          themes: ["migrated"],
          url: coverUrl,
        },
        String(row.title ?? "")
      );
    }

    const changed =
      nextThumbnail !== String(row.thumbnailURLUrl ?? "") ||
      nextHero !== String(row.heroImageURL ?? "") ||
      nextContent !== String(row.content ?? "");
    if (!changed) continue;

    row.thumbnailURLUrl = nextThumbnail || row.thumbnailURLUrl;
    if (nextHero) row.heroImageURL = nextHero;
    row.content = nextContent;
    await row.save();
    updated += 1;
  }

  return { scanned: rows.length, updated };
};
