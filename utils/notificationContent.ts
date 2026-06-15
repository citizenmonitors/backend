export type ArticleNotificationLink = {
  slug?: string;
  articleId?: string;
};

export const defaultNotificationSubtitle = (type?: string | null): string => {
  if (type === "news-insight") return "New article on News & Insight — tap to read.";
  if (type === "press-coverage") return "New press coverage — tap to read.";
  return "Tap to open in Citizen Monitors.";
};

/** Detect legacy JSON stored in `info` for article deep links. */
export const parseArticleLinkFromInfo = (
  info?: string | null
): ArticleNotificationLink | null => {
  const raw = String(info ?? "").trim();
  if (!raw.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;
    const slug = parsed.slug != null ? String(parsed.slug).trim() : "";
    const articleId = parsed.articleId != null ? String(parsed.articleId).trim() : "";
    if (!slug && !articleId) return null;
    return {
      slug: slug || undefined,
      articleId: articleId || undefined,
    };
  } catch {
    return null;
  }
};

export const resolveNotificationDisplay = (input: {
  type?: string | null;
  body?: string | null;
  info?: string | null;
  articleSlug?: string | null;
  articleId?: string | null;
}): {
  title: string;
  subtitle: string;
  link: ArticleNotificationLink | null;
} => {
  const title = String(input.body ?? "").trim() || "Citizen Monitors";
  const storedLink =
    input.articleSlug || input.articleId
      ? {
          slug: input.articleSlug ? String(input.articleSlug) : undefined,
          articleId: input.articleId ? String(input.articleId) : undefined,
        }
      : parseArticleLinkFromInfo(input.info);

  const rawInfo = String(input.info ?? "").trim();
  const legacyJsonLink = parseArticleLinkFromInfo(rawInfo);
  const subtitle =
    rawInfo && !legacyJsonLink
      ? rawInfo
      : defaultNotificationSubtitle(input.type);

  const link = storedLink ?? legacyJsonLink ?? null;

  return { title, subtitle, link };
};
