import transporter from "../config/email.js";

export const sendVerificationEmail = async (
  email,
  observerUrl,
  volunteerUrl
) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Verify your email",
    html: `
      <p>Please verify your email by selecting a role:</p>
      <a href="${observerUrl}">Observer</a>
      <a href="${volunteerUrl}">Volunteer</a>
    `,
  });
};
