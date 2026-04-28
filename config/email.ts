import { SendMailClient } from "zeptomail";
import dotenv from "dotenv";

dotenv.config();

const url = "https://api.zeptomail.com/";
const token = process.env.ZEPTO_API_KEY;

const client = new SendMailClient({ url, token: token ?? "" });

export interface SendEmailOptions {
  to: string;
  subject: string;
  htmlbody: string;
  textbody?: string;
  fromName?: string;
}
const htmlToPlainText = (html: string): string =>
  html
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

export const sendEmail = async ({
  to,
  subject,
  htmlbody,
  textbody,
  fromName = "Citizen Monitors",
}: SendEmailOptions): Promise<unknown> => {
  try {
    const fallbackTextBody = textbody ?? htmlToPlainText(htmlbody);
    const payload = {
      from: {
        address: process.env.ZEPTO_FROM_EMAIL,
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

    const response = await client.sendMail(payload);
    console.log("ZeptoMail connection verified successfully:");
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    console.error("ZeptoMail Error:", err?.response?.data ?? err?.message);
    throw new Error("Failed to send email via ZeptoMail.");
  }
};
