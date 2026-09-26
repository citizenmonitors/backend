/**
 * Accept either:
 * - one `paste` blob (optionally starting with `Subject: ...`)
 * - or separate `title` + `content`
 */
export declare const parseNewsletterPasteInput: (input: {
    paste?: unknown;
    title?: unknown;
    content?: unknown;
    excerpt?: unknown;
}) => {
    title: string;
    body: string;
    excerpt?: string;
};
/** Convert pasted plain text (or safe HTML) into News & Insight article HTML. */
export declare const pasteToNewsInsightHtml: (raw: string) => string;
/** Convert News & Insight HTML into email body paragraphs with mobile-first inline styles. */
export declare const newsInsightHtmlToEmailBody: (html: string) => string;
export type BuiltNewsletterFromPaste = {
    title: string;
    excerpt: string;
    /** News & Insight HTML body */
    content: string;
    /** Full email HTML document */
    emailHtml: string;
};
/**
 * Build newsletter email + News & Insight payloads from a pasted draft
 * (same content you usually paste in chat).
 */
export declare const buildNewsletterFromPaste: (input: {
    paste?: unknown;
    title?: unknown;
    content?: unknown;
    excerpt?: unknown;
}) => BuiltNewsletterFromPaste;
/** Shape returned to the frontend compose page for dual preview panes. */
export declare const buildComposePreview: (input: {
    paste?: unknown;
    title?: unknown;
    content?: unknown;
    excerpt?: unknown;
}) => {
    title: string;
    excerpt: string;
    newsletter: {
        subject: string;
        html: string;
    };
    newsInsight: {
        title: string;
        excerpt: string;
        content: string;
    };
};
//# sourceMappingURL=newsletterFromPaste.d.ts.map