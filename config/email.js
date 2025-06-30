// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();


// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST, 
//   port: process.env.SMTP_PORT, 
//   secure: process.env.SMTP_PORT === 465,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// transporter.verify((error, success) => {
//   if (error) {
//     console.log("Error with email transporter configuration:", error);
//   } else {
//     console.log("Email transporter is configured correctly");
//   }
// });


// export default transporter;


// @ts-nocheck
import { SendMailClient } from "zeptomail";
// import dotenv from "dotenv";

// dotenv.config();

const url = "api.zeptomail.com/";
const token = process.env.ZEPTO_API_KEY;

const client = new SendMailClient({ url, token });

/**
 * Send transactional email via ZeptoMail SDK
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlbody - Email HTML content
 * @param {string} [options.fromName] - Optional sender name
 * @returns {Promise<Object>}
 */
export const sendEmail = async ({
  to,
  subject,
  htmlbody,
  fromName = "Citizen Monitors",
}) => {
  try {
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
    };

    const response = await client.sendMail(payload);
    return response;
  } catch (error) {
    console.error("ZeptoMail Error:", error.message);
    throw new Error("Failed to send email via ZeptoMail.");
  }
};

