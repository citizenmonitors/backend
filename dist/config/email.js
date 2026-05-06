import { SendMailClient } from "zeptomail";
import dotenv from "dotenv";
dotenv.config();
const url = "https://api.zeptomail.com/";
const token = process.env.ZEPTO_API_KEY;
const client = new SendMailClient({ url, token: token ?? "" });
const htmlToPlainText = (html) => html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
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
            payload.mime_headers = {
                "List-Unsubscribe": `<${listUnsubscribeUrl.trim()}>`,
            };
            payload.track_clicks = false;
            payload.track_opens = false;
        }
        else {
            if (trackClicks !== undefined)
                payload.track_clicks = trackClicks;
            if (trackOpens !== undefined)
                payload.track_opens = trackOpens;
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