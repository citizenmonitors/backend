const MOBILE_ARTICLE_MARKER = "cm-mobile-article";

const stripDocumentShell = (html: string): string => {
  const trimmed = html.trim();
  if (!/^<!doctype html|^<html[\s>]/i.test(trimmed)) return trimmed;

  const bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch?.[1]) return bodyMatch[1].trim();

  return trimmed
    .replace(/^[\s\S]*?<body[^>]*>/i, "")
    .replace(/<\/body>[\s\S]*$/i, "")
    .trim();
};

const isMobileArticleHtml = (html: string): boolean =>
  html.includes(MOBILE_ARTICLE_MARKER);

/**
 * Wraps article HTML for in-app WebView rendering: full-width layout,
 * minimal padding, 12px body text and 14px headings on mobile.
 */
export const wrapMobileArticleHtml = (bodyHtml: string): string => {
  const normalized = stripDocumentShell(String(bodyHtml ?? "").trim());
  if (!normalized) return normalized;
  if (isMobileArticleHtml(normalized)) return normalized;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      width: 100%;
      margin: 0;
      padding: 0;
      background: transparent;
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #1a1a1a;
    }
    .${MOBILE_ARTICLE_MARKER} {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      overflow-wrap: anywhere;
      word-wrap: break-word;
    }
    .${MOBILE_ARTICLE_MARKER} p {
      margin: 0 0 8px;
      padding: 0;
      font-size: 12px;
      line-height: 1.5;
      color: #1a1a1a;
    }
    .${MOBILE_ARTICLE_MARKER} h1,
    .${MOBILE_ARTICLE_MARKER} h2,
    .${MOBILE_ARTICLE_MARKER} h3,
    .${MOBILE_ARTICLE_MARKER} h4,
    .${MOBILE_ARTICLE_MARKER} h5,
    .${MOBILE_ARTICLE_MARKER} h6 {
      margin: 10px 0 6px;
      padding: 0;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.35;
      color: #06BBAF;
    }
    .${MOBILE_ARTICLE_MARKER} strong,
    .${MOBILE_ARTICLE_MARKER} b {
      font-weight: 600;
      color: #111111;
    }
    .${MOBILE_ARTICLE_MARKER} em,
    .${MOBILE_ARTICLE_MARKER} i {
      font-style: italic;
      color: #555555;
    }
    .${MOBILE_ARTICLE_MARKER} ul,
    .${MOBILE_ARTICLE_MARKER} ol {
      margin: 0 0 8px;
      padding: 0 0 0 16px;
    }
    .${MOBILE_ARTICLE_MARKER} li {
      margin: 0 0 4px;
      padding: 0;
      font-size: 12px;
      line-height: 1.5;
    }
    .${MOBILE_ARTICLE_MARKER} img,
    .${MOBILE_ARTICLE_MARKER} video,
    .${MOBILE_ARTICLE_MARKER} iframe {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto;
      margin: 0;
      padding: 0;
      border: 0;
    }
    .${MOBILE_ARTICLE_MARKER} table {
      width: 100% !important;
      max-width: 100%;
      margin: 0;
      padding: 0;
      border-collapse: collapse;
    }
    .${MOBILE_ARTICLE_MARKER} td,
    .${MOBILE_ARTICLE_MARKER} th {
      margin: 0;
      padding: 0 !important;
    }
    .${MOBILE_ARTICLE_MARKER} a {
      color: #0066cc;
      text-decoration: underline;
      word-break: break-word;
    }
    .${MOBILE_ARTICLE_MARKER} blockquote {
      margin: 0 0 8px;
      padding: 6px 8px;
      border-left: 2px solid #06BBAF;
      background: #f7fafa;
      color: #333333;
      font-size: 12px;
    }
    .${MOBILE_ARTICLE_MARKER} > *:first-child {
      margin-top: 0;
    }
    .${MOBILE_ARTICLE_MARKER} > *:last-child {
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <article class="${MOBILE_ARTICLE_MARKER}">
    ${normalized}
  </article>
</body>
</html>`;
};
