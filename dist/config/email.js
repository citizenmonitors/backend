import { SendMailClient } from "zeptomail";
import dotenv from "dotenv";
dotenv.config();
const url = "https://api.zeptomail.com/";
const token = process.env.ZEPTO_API_KEY;
const client = new SendMailClient({ url, token: token ?? "" });
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
export const sendEmail = async ({ to, subject, htmlbody, textbody, fromName = "Citizen Monitors", listUnsubscribeUrl, trackClicks, trackOpens, }) => {
    try {
        const fromAddress = process.env.ZEPTO_FROM_EMAIL;
        if (!fromAddress) {
            throw new Error("ZEPTO_FROM_EMAIL is not set.");
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
            // Zepto click-tracking rewrites hrefs; that often hurts deliverability and can break links in strict clients.
            payload.track_clicks = trackClicks ?? false;
            payload.track_opens = trackOpens ?? false;
        }
        const response = await client.sendMail(payload);
        console.log("ZeptoMail connection verified successfully:");
        return response;
    }
    catch (error) {
        const err = error;
        console.error("ZeptoMail Error:", err?.response?.data ?? err?.message);
        throw new Error("Failed to send email via ZeptoMail.");
    }
};
//# sourceMappingURL=email.js.map