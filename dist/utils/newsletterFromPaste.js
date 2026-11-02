import { buildNewsletterEditionEmailHtml } from "../config/emailTemplates.js";
const escapeHtml = (value) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const looksLikeHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(value);
const stripDangerousHtml = (html) => html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+=(["']).*?\1/gi, "")
    .trim();
/** True when most longer words start with a capital, e.g. "Poverty Has a Price." */
const isTitleCase = (line) => {
    const words = line.split(/\s+/).filter((w) => /^[A-Za-z]{4,}/.test(w));
    if (words.length === 0)
        return false;
    const capitalised = words.filter((w) => /^[A-Z]/.test(w)).length;
    return capitalised / words.length >= 0.75;
};
const isLikelyHeading = (line) => {
    const trimmed = line.trim();
    if (!trimmed)
        return false;
    if (/^dear\s+citizen\s+monitors/i.test(trimmed))
        return false;
    if (/^\d+[.)]\s/.test(trimmed))
        return false;
    if (trimmed.length > 90)
        return false;
    if (trimmed.split(/\s+/).length > 14)
        return false;
    if (/[,:;]$/.test(trimmed))
        return false;
    // Short questions read as section headings ("Who benefits when…?").
    if (/\?$/.test(trimmed))
        return true;
    // Sentences ending in "." / "!" only count when written in Title Case.
    if (/[.!]$/.test(trimmed))
        return isTitleCase(trimmed);
    return true;
};
/** "1. Do this. More detail" → bold the step's first sentence. */
const numberedStepHtml = (line) => {
    const match = line.match(/^(\d+[.)])\s+(.+?[.!?])(\s+.*)?$/);
    if (!match)
        return null;
    const [, num, lead, rest = ""] = match;
    if (lead.split(/\s+/).length > 12)
        return null;
    return `<p><strong>${escapeHtml(`${num} ${lead}`)}</strong>${escapeHtml(rest)}</p>`;
};
/** Remove sign-off / social lines — email + app templates already include footer. */
const stripSignOff = (text) => {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const cutPatterns = [
        /^warm\s+regards/i,
        /^with\s+regards/i,
        /^citizen\s+monitors\.?\s*$/i,
        /^guardians\s+of\s+truth/i,
        /^promoting\s+transparency/i,
        /^📱/,
        /^@citizenmonitors/i,
        /^follow\s+@citizenmonitors/i,
    ];
    let cutAt = lines.length;
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i].trim();
        if (!line)
            continue;
        if (cutPatterns.some((re) => re.test(line))) {
            cutAt = i;
            break;
        }
    }
    return lines.slice(0, cutAt).join("\n").trim();
};
/**
 * Accept either:
 * - one `paste` blob (optionally starting with `Subject: ...`)
 * - or separate `title` + `content`
 */
export const parseNewsletterPasteInput = (input) => {
    const explicitTitle = String(input.title ?? "").trim();
    const explicitContent = String(input.content ?? "").trim();
    const excerpt = String(input.excerpt ?? "").trim() || undefined;
    const paste = String(input.paste ?? "").replace(/\r\n/g, "\n").trim();
    if (paste) {
        let title = explicitTitle;
        let body = paste;
        const subjectMatch = paste.match(/^\s*subject\s*:\s*(.+)\s*$/im);
        if (subjectMatch) {
            if (!title)
                title = subjectMatch[1].trim();
            body = paste.replace(/^\s*subject\s*:\s*.+\s*\n+/i, "").trim();
        }
        body = stripSignOff(body);
        if (!title) {
            throw new Error("Could not find a subject. Add `Subject: ...` at the top of the paste, or send `title`.");
        }
        if (!body)
            throw new Error("paste body is empty after removing subject/sign-off");
        return { title, body, excerpt };
    }
    if (!explicitTitle || !explicitContent) {
        throw new Error("Send `paste` (full draft) or both `title` and `content`");
    }
    return {
        title: explicitTitle,
        body: stripSignOff(explicitContent),
        excerpt,
    };
};
/** Convert pasted plain text (or safe HTML) into News & Insight article HTML. */
export const pasteToNewsInsightHtml = (raw) => {
    const text = String(raw ?? "").replace(/\r\n/g, "\n").trim();
    if (!text)
        return "";
    if (looksLikeHtml(text)) {
        return stripDangerousHtml(text);
    }
    const blocks = text
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean);
    const parts = [];
    for (const block of blocks) {
        const lines = block
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        // A heading may sit alone or directly above its paragraph.
        if (isLikelyHeading(lines[0])) {
            parts.push(`<h4>${escapeHtml(lines.shift())}</h4>`);
        }
        for (const line of lines) {
            const step = numberedStepHtml(line);
            if (step) {
                parts.push(step);
            }
            else if (/^dear\s+citizen\s+monitors/i.test(line)) {
                parts.push(`<p><strong>${escapeHtml(line)}</strong></p>`);
            }
            else if (/^citizen monitors app is live/i.test(line)) {
                parts.push(`<p><strong>${escapeHtml(line)}</strong></p>`);
            }
            else {
                parts.push(`<p>${escapeHtml(line)}</p>`);
            }
        }
    }
    const tagline = '<p><em>Promoting transparency, accountability and informed public discourse.</em></p>';
    if (!/promoting transparency, accountability/i.test(parts.join(" "))) {
        parts.push(tagline);
    }
    return parts.join("\n");
};
/** Convert News & Insight HTML into email body paragraphs with mobile-first inline styles. */
export const newsInsightHtmlToEmailBody = (html) => {
    const normalized = stripDangerousHtml(html);
    return normalized
        .replace(/<h4([^>]*)>/gi, '<h4 style="color:#06BBAF;margin:10px 0 6px;font-size:14px;line-height:1.35;"$1>')
        .replace(/<p([^>]*)>/gi, '<p style="margin:0 0 8px;font-size:12px;line-height:1.5;"$1>')
        .replace(/<p style="margin:0 0 8px;font-size:12px;line-height:1.5;"><em>/gi, '<p style="margin:10px 0 0;font-size:12px;line-height:1.5;font-style:italic;color:#555555;"><em>');
};
const excerptFromHtml = (html, max = 160) => {
    // Use the first real paragraph — skip the greeting and headings.
    const paragraphs = html.match(/<p>[\s\S]*?<\/p>/gi) ?? [html];
    const first = paragraphs.find((p) => !/dear\s+citizen\s+monitors/i.test(p) && !/^<p><em>/i.test(p)) ?? paragraphs[0];
    const plain = first
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (plain.length <= max)
        return plain;
    return `${plain.slice(0, max).trim()}…`;
};
/**
 * Build newsletter email + News & Insight payloads from a pasted draft
 * (same content you usually paste in chat).
 */
export const buildNewsletterFromPaste = (input) => {
    const parsed = parseNewsletterPasteInput(input);
    const content = pasteToNewsInsightHtml(parsed.body);
    if (!content)
        throw new Error("content is required");
    const excerpt = parsed.excerpt || excerptFromHtml(content);
    const emailHtml = buildNewsletterEditionEmailHtml({
        title: parsed.title,
        bodyHtml: newsInsightHtmlToEmailBody(content),
    });
    return {
        title: parsed.title,
        excerpt,
        content,
        emailHtml,
    };
};
/** Shape returned to the frontend compose page for dual preview panes. */
export const buildComposePreview = (input) => {
    const built = buildNewsletterFromPaste(input);
    return {
        title: built.title,
        excerpt: built.excerpt,
        newsletter: {
            subject: built.title,
            html: built.emailHtml,
        },
        newsInsight: {
            title: built.title,
            excerpt: built.excerpt,
            content: built.content,
        },
    };
};
//# sourceMappingURL=newsletterFromPaste.js.map