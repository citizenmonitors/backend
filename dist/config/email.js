import dotenv from "dotenv";
dotenv.config();
const ZEPTO_API_URL = "https://api.zeptomail.com/v1.1/email";
const htmlToPlainText = (html) => html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, url, label) => {
    const text = label.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return text ? `${text} (${url})` : url;
})
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/(div|li|ul|ol|h1|h2|h3|h4|h5|h6|tr)>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
const readErrorBody = async (res) => {
    try {
        const text = await res.text();
        if (!text)
            return `HTTP ${res.status}`;
        try {
            const json = JSON.parse(text);
            return (json?.error?.message ||
                json?.message ||
                text.slice(0, 500));
        }
        catch {
            return text.slice(0, 500);
        }
    }
    catch {
        return `HTTP ${res.status}`;
    }
};
/**
 * Sends one email via ZeptoMail using fetch (avoids the official SDK bug that
 * crashes Node when an error response is not JSON-parseable).
 */
export const sendEmail = async ({ to, subject, htmlbody, textbody, fromName = "Citizen Monitors", listUnsubscribeUrl, trackClicks, trackOpens, }) => {
    const fromAddress = process.env.ZEPTO_FROM_EMAIL;
    const token = process.env.ZEPTO_API_KEY?.trim();
    if (!fromAddress) {
        throw new Error("ZEPTO_FROM_EMAIL is not set.");
    }
    if (!token) {
        throw new Error("ZEPTO_API_KEY is not set.");
    }
    const fallbackTextBody = textbody ?? htmlToPlainText(htmlbody);
    const replyToAddress = process.env.ZEPTO_REPLY_TO_EMAIL?.trim();
    const replyTo = replyToAddress && replyToAddress.length > 0
        ? [
            {
                address: replyToAddress,
                name: process.env.ZEPTO_REPLY_TO_NAME?.trim() || "Citizen Monitors",
            },
        ]
        : undefined;
    const payload = {
        from: {
            address: fromAddress,
            name: fromName,
        },
        to: [
            {
                email_address: {
                    address: to,
                    name: to,
                },
            },
        ],
        subject,
        htmlbody,
        textbody: fallbackTextBody,
    };
    if (replyTo) {
        payload.reply_to = replyTo;
    }
    if (listUnsubscribeUrl?.trim()) {
        const unsubscribeUrl = listUnsubscribeUrl.trim();
        const unsubscribeMailto = process.env.NEWSLETTER_UNSUBSCRIBE_MAILTO?.trim() ||
            (replyToAddress ? `mailto:${replyToAddress}?subject=UNSUBSCRIBE` : "");
        payload.mime_headers = {
            "List-Unsubscribe": unsubscribeMailto
                ? `<${unsubscribeUrl}>, <${unsubscribeMailto}>`
                : `<${unsubscribeUrl}>`,
        };
        payload.track_clicks = false;
        payload.track_opens = false;
    }
    else {
        // Zepto click-tracking rewrites hrefs; that often hurts deliverability.
        payload.track_clicks = trackClicks ?? false;
        payload.track_opens = trackOpens ?? false;
    }
    let res;
    try {
        res = await fetch(ZEPTO_API_URL, {
            method: "POST",
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`ZeptoMail network error (${to}):`, message);
        throw new Error(`Failed to send email via ZeptoMail: ${message}`);
    }
    if (!res.ok) {
        const detail = await readErrorBody(res);
        console.error(`ZeptoMail Error (${to}):`, detail);
        throw new Error(`Failed to send email via ZeptoMail: ${detail}`);
    }
    try {
        return await res.json();
    }
    catch {
        return { ok: true, status: res.status };
    }
};
//# sourceMappingURL=email.js.map