export const defaultNotificationSubtitle = (type) => {
    if (type === "news-insight")
        return "New article on News & Insight — tap to read.";
    if (type === "press-coverage")
        return "New press coverage — tap to read.";
    return "Tap to open in Citizen Monitors.";
};
/** Detect legacy JSON stored in `info` for article deep links. */
export const parseArticleLinkFromInfo = (info) => {
    const raw = String(info ?? "").trim();
    if (!raw.startsWith("{"))
        return null;
    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object")
            return null;
        const slug = parsed.slug != null ? String(parsed.slug).trim() : "";
        const articleId = parsed.articleId != null ? String(parsed.articleId).trim() : "";
        if (!slug && !articleId)
            return null;
        return {
            slug: slug || undefined,
            articleId: articleId || undefined,
        };
    }
    catch {
        return null;
    }
};
/**
 * Make notification `info` safe for push/inbox display.
 * Strips raw media URLs (legacy flag evidence dumps) and keeps human text.
 */
export const sanitizeNotificationSubtitle = (info) => {
    let text = String(info ?? "").trim();
    if (!text)
        return "";
    // Legacy: "Image: https://..." / "Video: https://..."
    const hadImage = /(?:^|\|\s*)Image:\s*https?:\/\/\S+/i.test(text);
    const hadVideo = /(?:^|\|\s*)Video:\s*https?:\/\/\S+/i.test(text);
    text = text.replace(/(?:^|\|\s*)Image:\s*https?:\/\/\S+/gi, "");
    text = text.replace(/(?:^|\|\s*)Video:\s*https?:\/\/\S+/gi, "");
    // Any remaining bare URLs
    text = text.replace(/https?:\/\/\S+/gi, "");
    text = text
        .replace(/\s*\|\s*/g, ". ")
        .replace(/\s{2,}/g, " ")
        .replace(/\.\s*\./g, ".")
        .replace(/^\.\s*/, "")
        .replace(/\s*\.$/, "")
        .trim();
    const evidenceBits = [];
    if (hadImage)
        evidenceBits.push("photo evidence attached");
    if (hadVideo)
        evidenceBits.push("video evidence attached");
    if (evidenceBits.length > 0) {
        const evidenceSentence = evidenceBits[0].charAt(0).toUpperCase() +
            evidenceBits.join(" and ").slice(1);
        text = text ? `${text}. ${evidenceSentence}` : evidenceSentence;
    }
    return text.trim();
};
export const resolveNotificationDisplay = (input) => {
    const title = String(input.body ?? "").trim() || "Citizen Monitors";
    const storedLink = input.articleSlug || input.articleId
        ? {
            slug: input.articleSlug ? String(input.articleSlug) : undefined,
            articleId: input.articleId ? String(input.articleId) : undefined,
        }
        : parseArticleLinkFromInfo(input.info);
    const rawInfo = String(input.info ?? "").trim();
    const legacyJsonLink = parseArticleLinkFromInfo(rawInfo);
    const cleanedInfo = legacyJsonLink
        ? ""
        : sanitizeNotificationSubtitle(rawInfo);
    const subtitle = cleanedInfo || defaultNotificationSubtitle(input.type);
    const link = storedLink ?? legacyJsonLink ?? null;
    return { title, subtitle, link };
};
//# sourceMappingURL=notificationContent.js.map