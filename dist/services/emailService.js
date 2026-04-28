import { sendEmail } from "../config/email.js";
export const sendVerificationEmail = async (email, observerUrl, volunteerUrl) => {
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
//# sourceMappingURL=emailService.js.map