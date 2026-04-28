import { sendEmail } from "../config/email.js";

export const sendVerificationEmail = async (
  email: string,
  observerUrl: string,
  volunteerUrl: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: "Verify your email",
    htmlbody: `
      <p>Please verify your email by selecting a role:</p>
      <a href="${observerUrl}">Observer</a>
      <a href="${volunteerUrl}">Volunteer</a>
    `,
  });
};

