type BaseTemplateInput = {
  message?: string;
  buttonText?: string;
  buttonLink?: string;
  verifyCode?: string;
  title?: string;
};
type SpeakerSlotConfirmationInput = {
  firstName: string;
  date: string;
  timeWAT: string;
  theme: string;
  sessionType?: string;
};
type SpeakerSlotInternalNotificationInput = {
  speakerName: string;
  xHandle: string;
  email: string;
  date: string;
  timeWAT: string;
  theme: string;
  topicAngle?: string;
};
type SpeakerSlotReminder7DaysInput = {
  firstName: string;
  date: string;
  timeWAT: string;
  theme: string;
};
type SpeakerSlotReminder24HoursInput = {
  firstName: string;
  date: string;
  timeWAT: string;
  theme: string;
  spaceLink?: string;
};
type SpeakerSlotReminder2HoursInput = {
  firstName: string;
  timeWAT: string;
  spaceLink?: string;
};
type UserActivitySummaryInput = {
  dateRange: string;
  login: number;
  signup: number;
  observer: number;
  volunteer: number;
  result: number;
  incident: number;
  flagged: number;
  volunteerToObserver: number;
  total: number;
};

const baseTemplate = ({ message, buttonText, buttonLink, verifyCode }: BaseTemplateInput) => `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px;font-family:Verdana, Arial, Helvetica, sans-serif;font-size:10pt;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:20px;border-radius:4px;">
        
        <!-- Logo -->
        <tr>
          <td align="center" style="padding-bottom:20px;">
            <img src="https://www.citizenmonitors.com/assets/citizen-monitors-logo.png" alt="Citizen Monitors Logo" width="150" height="50" style="display:block;">
          </td>
        </tr>

        <!-- Main Message -->
        <tr>
          <td style="font-size:16px;color:#555555;padding-bottom:20px;">
            ${message}
          </td>
        </tr>

        <!-- Optional Verify Code -->
        ${
          verifyCode
            ? `<tr>
                <td align="center" style="padding-bottom:30px;">
                  <strong style="background-color:#06bbaf;color:#ffffff;padding:12px 24px;border-radius:4px;font-size:16px;display:inline-block;">
                    ${verifyCode}
                  </strong>
                </td>
              </tr>`
            : ""
        }

        <!-- Optional Button -->
        ${
          buttonText && buttonLink
            ? `<tr>
                <td align="center" style="padding-bottom:30px;">
                  <a href="${buttonLink}" style="background-color:#06bbaf;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:16px;display:inline-block;" target="_blank">
                    ${buttonText}
                  </a>
                </td>
              </tr>`
            : ""
        }

        <!-- Footer -->
        <tr>
          <td style="font-size:13px;color:#888888;border-top:1px solid #e0e0e0;padding-top:20px;text-align:center;">
            © 2026 Citizen Monitors | 
            <a href="https://www.citizenmonitors.com" style="color:#1d72b8;text-decoration:underline;" target="_blank">citizenmonitors.com</a>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;

// Forgot password email
  export const forgotPasswordTemplate = (resetLink: string) =>
    baseTemplate({
      title: "Reset Your Password for Your Citizen Monitors Account",
      message: `We received a request to reset the password for your Citizen Monitors account. If you made this request, you can reset your password securely by clicking the button below.`,
      buttonText: "Reset Password",
      buttonLink: resetLink,
    });
  
  // Registration welcome email
  export const registrationCode = (verificationCode: string) =>
    baseTemplate({
      title: "Welcome to Citizen Monitors - Verify Your Account",
      message: `Thank you for registering with <b>Citizen Monitors</b>. To complete your account setup, please use the verification code below:<br><br>`,
      verifyCode: verificationCode,
    });


 // Resend verification code email
export const resendCode = (verificationCode: string) =>
    baseTemplate({
      title: "Resend Verification Code - Citizen Monitors",
      message: `It seems you need another verification code to complete your account setup with <b>Citizen Monitors</b>. Please use the verification code below to verify your account:<br><br>`,
      verifyCode: verificationCode,
    });

/** Mobile app: password reset via OTP (expires in 5 minutes; set in service). */
export const passwordResetOtpTemplate = (otp: string) =>
  baseTemplate({
    title: "Password Reset OTP - Citizen Monitors",
    message: `You requested a password reset for your <b>Citizen Monitors</b> account. Enter this one-time code in the app. It expires in <b>5 minutes</b>.<br><br>`,
    verifyCode: otp,
  });


export const newsLetterTemplatePvcReportChallenges = () =>
  baseTemplate({
    title: "PVC Registration Help: Report Your Challenges",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">PVC Registration Help: Report Your Challenges</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>As preparations for future elections continue, it is important that every eligible Nigerian is able to register for, and obtain a Permanent Voter’s Card (PVC) without unnecessary obstacles.</p>

                  <p>If you are experiencing any challenges with PVC registration, transfer, replacement, collection, or any other voter registration-related issue; we encourage you to report your experience through the link below:</p>

                  <p style="margin-top: 18px;">
                    <a href="https://www.citizenmonitors.com/pvc-report" target="_blank" rel="noopener noreferrer" style="color: #06BBAF; text-decoration: underline; font-weight: 700;">
                      https://www.citizenmonitors.com/pvc-report
                    </a>
                  </p>

                  <p>When reporting your challenge, please provide as much detail as possible, including:</p>

                  <ul style="padding-left: 22px; line-height: 1.9;">
                    <li>Your state and local government area</li>
                    <li>The registration centre involved</li>
                    <li>The nature of the challenge encountered</li>
                    <li>Date and time of the incident</li>
                    <li>Any supporting evidence, where available</li>
                  </ul>

                  <p>Your reports will help Citizen Monitors document citizens’ experiences, identify recurring challenges, and possibly institute a class action, advocating for improvements in the voter registration process.</p>

                  <p>Democracy works best when citizens participate. Your voice and your vote matter.</p>

                  <p>Thank you for being part of the movement for transparent, inclusive, and credible elections in Nigeria.</p>

                  <p style="margin-top: 18px;">
                    <strong>Kind regards,</strong><br>
                    <strong>Citizen Monitors.</strong><br>
                    <em>Promoting Transparency, Accountability, Democratic Participation, and Informed Public Discourse.</em>
                  </p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const mobileFeedbackTemplate = (
  email: string,
  title: string,
  message: string
) =>
  baseTemplate({
    title: "New Mobile Feedback - Citizen Monitors",
    message: `
      <p><strong>User email:</strong> ${email}</p>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });
  
    export const approveObserverTemplate = (firstName: string, pollingUnit: string) =>
        baseTemplate({
          title: "Observer Approval - Citizen Monitors",
          message: `
            <p>Dear ${firstName},</p>
            <p>We are pleased to inform you that your observer account for polling unit <b>${pollingUnit}</b> has been approved.</p>
            <p>Thank you for your commitment to transparency and accountability in the electoral process.</p>
            <p>We look forward to your valuable contributions as an observer.</p>
            <p>Best regards,</p>
            <p><b>Citizen Monitors</b></p>
          `,
        });
  

        export const observerRoleUpdateTemplate = (firstName: string, pollingUnit: string) =>
            baseTemplate({
              title: "Observer Role Update - Citizen Monitors",
              message: `
                <p>Dear ${firstName},</p>
                <p>We would like to inform you that another observer has been selected for polling unit <b>${pollingUnit}</b>. As a result, your role has been updated to <b>volunteer</b>.</p>
                <p>We appreciate your understanding and continued support in ensuring transparency and accountability in the electoral process.</p>
                <p>Thank you for your commitment.</p>
                <p>Best regards,</p>
                <p><b>Citizen Monitors</b></p>
              `,
            });

            export const observerDowngradeTemplate = (firstName: string, pollingUnit: string, adminReason: string) =>
                baseTemplate({
                  title: "Observer Role Downgraded - Citizen Monitors",
                  message: `
                    <p>Dear ${firstName},</p>
                    <p>Your observer role for polling unit <b>${pollingUnit}</b> has been downgraded to a <b>volunteer</b> by the Admin.</p>
                    <p><b>Reason:</b> ${adminReason}</p>
                    <p>We appreciate your understanding and continued support in ensuring transparency and accountability in the electoral process.</p>
                    <p>Thank you for your commitment.</p>
                    <p>Best regards,</p>
                    <p><b>Citizen Monitors</b></p>
                  `,
                });

                export const observerRoleAvailableTemplate = (firstName: string, pollingUnit: string) =>
                    baseTemplate({
                      title: "Observer Role Available - Citizen Monitors",
                      message: `
                        <p>Dear ${firstName},</p>
                        <p>There is currently no observer in polling unit <b>${pollingUnit}</b>. You now have the opportunity to upgrade your account and become an observer for this polling unit.</p>
                        <p>We encourage you to take this step and contribute to ensuring transparency and accountability in the electoral process.</p>
                        <p>Thank you for your participation.</p>
                        <p>Best regards,</p>
                        <p><b>Citizen Monitors</b></p>
                      `,
                    });

                    export const observerNotApprovedInvalidPvcTemplate = (firstName: string) =>
                    baseTemplate({
                      title: "Observer Application Not Approved - Citizen Monitors",
                      message: `
                        <p>Dear ${firstName},</p>
                        <p>We regret to inform you that your account has not been approved to be an observer at this time.</p>
                        <p>This is because the PVC (Permanent Voter Card) you submitted could not be verified as valid.</p>
                        <p>You can upgrade your account by submitting a valid PVC. Please log in and update your details with a valid PVC to reapply for observer status.</p>
                        <p>Thank you for your interest in supporting transparency and accountability in the electoral process.</p>
                        <p>Best regards,</p>
                        <p><b>Citizen Monitors</b></p>
                      `,
                    });

                    export const adminRoleInvitationTemplate = (firstName: string, role: string) =>
                        baseTemplate({
                          title: "Admin Role Invitation - Citizen Monitors",
                          message: `
                            <p>Dear ${firstName},</p>
                            <p>We are excited to inform you that you have been invited to join <b>Citizen Monitors</b> as  <b>${role}</b>.</p>
                            <p>As an admin, you will play a vital role in ensuring transparency and accountability in the electoral process.</p>
                            <p>Please log in to your account to access your admin dashboard and start managing your responsibilities.</p>
                            <p>Thank you for your commitment to making a difference.</p>
                            <p>Best regards,</p>
                            <p><b>Citizen Monitors</b></p>
                          `,
                        });

                        export const adminSuspensionTemplate = (firstName: string) =>
                            baseTemplate({
                              title: "Your Admin Access Has Been Suspended",
                              message: `
                                <p>Dear ${firstName},</p>
                                <p>We regret to inform you that your admin access has been suspended, and your role has been changed to <b>volunteer</b>.</p>
                                <p>If you believe this action was taken in error, please contact our support team for further assistance.</p>
                                <p>Thank you for your understanding.</p>
                                <p>Best regards,</p>
                                <p><b>Citizen Monitors</b></p>
                              `,
                            });

                            export const emailChangeNotificationTemplate = (newEmail: string) =>
                                baseTemplate({
                                  title: "Email Change Request - Citizen Monitors",
                                  message: `
                                    <p>You have requested to change your email address to <b>${newEmail}</b>.</p>
                                    <p>Please check <b>${newEmail}</b> for the verification code to confirm the change.</p>
                                    <p>If you did not make this request, please contact our support team immediately.</p>
                                  `,
                                });

                                export const emailVerificationCodeTemplate = (verificationCode: string) =>
                                    baseTemplate({
                                      title: "Verify Your New Email Address - Citizen Monitors",
                                      message: `
                                      <p>Dear User,</p>
                                      <p>Please use this code to verify your new email address.</p>
                                      <p>If you did not make this request, please contact our support team immediately.</p>
                                      <p>Your verification code is:</p>
                                      `,
                                      verifyCode: verificationCode,

                                    });

                            
                                    export const resendVerificationCodeTemplate = (verificationCode: string) =>
                                        baseTemplate({
                                          title: "Resend Verification Code - Citizen Monitors",
                                          message: `
                                          <p>Dear User,</p>
                                          <p>We have resent your verification code to complete the email update process.</p>
                                          <p>Please use this code to verify your new email address.</p>
                                          <p>If you did not request this, please contact our support team immediately.</p>
                                          <p>Your verification code is:</p>
                                          `,
                                          verifyCode: verificationCode,
                                        });


                                        export const supportRequestTemplate = (firstName: string, lastName: string, email: string, phoneNumber: string, category: string, message: string) =>
                                          baseTemplate({
                                            title: "New Support Request - Citizen Monitors",
                                            message: `
                                              <p><strong>First Name:</strong> ${firstName}</p>
                                              <p><strong>Last Name:</strong> ${lastName}</p>
                                              <p><strong>Email:</strong> ${email}</p>
                                              <p><strong>Phone Number:</strong> ${phoneNumber}</p>
                                              <p><strong>Category:</strong> ${category}</p>
                                              <p><strong>Message:</strong> ${message}</p>

                                            `,
                                          });

type PvcIssueAcknowledgementInput = {
  fullName: string;
  reportId: string;
};

type PvcIssueInternalNotificationInput = {
  reportId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  state: string;
  lga: string;
  pollingUnit: string;
  issueType: string;
  otherIssueDetail: string;
  description: string;
  evidenceCount: number;
};

export const pvcIssueAcknowledgementTemplate = ({
  fullName,
  reportId,
}: PvcIssueAcknowledgementInput) =>
  baseTemplate({
    title: "PVC Issue Report Received – Citizen Monitors",
    message: `
      <p>Dear ${fullName},</p>
      <p>Thank you for submitting your PVC issue report. Your case has been received.</p>
      <p><strong>Reference:</strong> ${reportId}</p>
      <p>Warm regards,<br>Citizen Monitors</p>
    `,
  });

export const pvcIssueInternalNotificationTemplate = ({
  reportId,
  fullName,
  phoneNumber,
  email,
  state,
  lga,
  pollingUnit,
  issueType,
  otherIssueDetail,
  description,
  evidenceCount,
}: PvcIssueInternalNotificationInput) =>
  baseTemplate({
    title: "New PVC Issue Report – Citizen Monitors",
    message: `
      <p>A new PVC issue report has been submitted.</p>
      <p><strong>Report ID:</strong> ${reportId}</p>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Phone:</strong> ${phoneNumber}</p>
      <p><strong>Email:</strong> ${email || "Not provided"}</p>
      <p><strong>State:</strong> ${state}</p>
      <p><strong>LGA:</strong> ${lga}</p>
      <p><strong>Polling Unit:</strong> ${pollingUnit}</p>
      <p><strong>Issue Type:</strong> ${issueType}</p>
      ${otherIssueDetail ? `<p><strong>Other Detail:</strong> ${otherIssueDetail}</p>` : ""}
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Evidence files:</strong> ${evidenceCount}</p>
    `,
  });

// Speaker slot booking – confirmation to speaker (72-Hour X Space)
export const speakerSlotConfirmationTemplate = ({ firstName, date, timeWAT, theme, sessionType }: SpeakerSlotConfirmationInput) =>
  baseTemplate({
    message: `
      <p>Hi ${firstName},</p>
      <p>Thank you for confirming your slot for the Citizen Monitors 72-Hour X Space.</p>
      <p><strong>Your slot is confirmed:</strong></p>
      <p>Date: ${date}</p>
      <p>Time: ${timeWAT} (WAT)</p>
      <p>Theme: ${theme}</p>
      <p>We'll send the Space link and speaker guidance closer to the date.</p>
      <p>Warm regards,<br>Olajumoke Alawode-James<br>Head of Communications & Spokesperson, Citizen Monitors<br>media@citizenmonitors.com</p>
    `,
  });

// Speaker slot – notification to internal team
export const speakerSlotInternalNotificationTemplate = ({ speakerName, xHandle, email, date, timeWAT, theme, topicAngle }: SpeakerSlotInternalNotificationInput) =>
  baseTemplate({
    message: `
      <p>Hi Team,</p>
      <p>A speaker has confirmed a slot for the 72-Hour X Space.</p>
      <p><strong>Speaker:</strong> ${speakerName} (${xHandle})</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Slot:</strong> ${date} – ${timeWAT} (WAT)</p>
      <p><strong>Theme:</strong> ${theme}</p>
      <p>Please update the running schedule accordingly.</p>
      <p>Regards,<br>Citizen Monitors Scheduling Bot / Admin</p>
    `,
  });

// Speaker slot reminder – 7 days before
export const speakerSlotReminder7DaysTemplate = ({ firstName, date, timeWAT, theme }: SpeakerSlotReminder7DaysInput) =>
  baseTemplate({
    message: `
      <p>Hi ${firstName},</p>
      <p>Just a quick reminder that your speaker slot for the Citizen Monitors 72-Hour X Space is coming up next week.</p>
      <p><strong>Your slot:</strong> ${date} – ${timeWAT} (WAT)</p>
      <p><strong>Theme:</strong> ${theme}</p>
      <p>We'll send the Space link and final run-of-show closer to the date.</p>
      <p>If anything changes on your end, kindly reply as soon as possible so we can adjust.</p>
      <p>Warm regards,<br>Olajumoke<br>Citizen Monitors</p>
    `,
  });

// Speaker slot reminder – 24 hours before
export const speakerSlotReminder24HoursTemplate = ({ firstName, date, timeWAT, theme, spaceLink }: SpeakerSlotReminder24HoursInput) =>
  baseTemplate({
    message: `
      <p>Hi ${firstName},</p>
      <p>Your speaker slot is tomorrow for the Citizen Monitors 72-Hour X Space.</p>
      <p><strong>Slot:</strong> ${date} – ${timeWAT} (WAT)</p>
      <p><strong>Theme:</strong> ${theme}</p>
      <p><strong>Space Link:</strong> <a href="${spaceLink || "#"}">${spaceLink || "Link will be shared soon"}</a></p>
      <p>Please join the Space 5–10 minutes early so we can smoothly bring you up when it's time.</p>
      <p>Thank you again for lending your voice.</p>
      <p>Warm regards,<br>Olajumoke<br>Citizen Monitors</p>
    `,
  });

// Speaker slot reminder – 2 hours before
export const speakerSlotReminder2HoursTemplate = ({ firstName, timeWAT, spaceLink }: SpeakerSlotReminder2HoursInput) =>
  baseTemplate({
    message: `
      <p>Hi ${firstName},</p>
      <p>A quick heads-up—your speaker slot begins in 2 hours.</p>
      <p><strong>Time:</strong> ${timeWAT} (WAT)</p>
      <p><strong>Space Link:</strong> <a href="${spaceLink || "#"}">${spaceLink || "Join here"}</a></p>
      <p>Please join a few minutes early. If you run into any issues, reply to this email and we'll assist immediately.</p>
      <p>Warm regards,<br>Olajumoke<br>Citizen Monitors</p>
    `,
  });

export const podcastNotificationTemplate = (title: string, content: string) =>
                                            baseTemplate({
                                              title: "New Podcast Notification - Citizen Monitors",
                                              message: `
                                                <p>You have a new podcast in your inbox.</p>
                                                <p><strong>Title:</strong> ${title}</p>
                                                <p><strong>Content Preview:</strong> ${content.slice(0, 50)}...</p>
                                                <p>Please log in to your account to view the full podcast.</p>
                                              `,
                                            });
                                            export const electionNotificationTemplate = (electionName: string, startDate: string, endDate: string) =>
                                              baseTemplate({
                                                title: "New Election Live - Citizen Monitors",
                                                message: `
                                                  <p>Dear User,</p>
                                                  <p>A new election <strong>${electionName}</strong> is now live on the Citizen Monitors website.</p>
                                                  <p><strong>Start Date:</strong> ${startDate}</p>
                                                  <p><strong>End Date:</strong> ${endDate}</p>
                                                  <p>Please log in to the website to participate.</p>
                                                  <p>Thank you,</p>
                                                  <p>Citizen Monitors</p>
                                                `,
                                              });
                                        export const newsLetterTemplate = () =>
                                          baseTemplate({
                                            title: "Citizen Monitors Weekly Newsletter",
                                            message: `

<div style="margin:0; padding:0; background-color:#f4f4f4; font-family:'Inter', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin:30px auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#06BBAF; color:#ffffff; padding:40px 20px;">
            <h1 style="margin:0; font-size:28px; font-family:'League Spartan', Arial, sans-serif;">Citizen Monitors Weekly Newsletter</h1>
              <p style="margin:10px 0 0; font-size:16px; font-family:'Inter', sans-serif;">July 2025 Edition</p>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding:30px 25px; font-family:'Inter', sans-serif;">
              <h2 style="color:#333333; margin-top:0; font-family:'League Spartan', Arial, sans-serif;">Hello Citizen Monitors Community! 👋</h2>
              <p style="font-size:16px; line-height:1.6; color:#555555;">
                We are excited to bring you the <strong>inaugural edition</strong> of our weekly newsletter! As we gear up for our <strong>first mock election on Saturday, July 12, 2025</strong>, we want to keep you informed and engaged with the latest updates, insights, and opportunities to participate in our mission to enhance democratic processes in Nigeria through data gathering.
              </p>
            </td>
          </tr>

          <!-- What’s Happening -->
          <tr>
            <td style="padding:25px; font-family:'Inter', sans-serif;">
              <h3 style="color:#06BBAF; margin-top:0; font-family:'League Spartan', Arial, sans-serif;">📌 What’s Happening This Week?</h3>
              <p style="font-size:15px; color:#555555; line-height:1.6;">
                <strong>Countdown to Mock Elections!</strong><br>
                Only two weeks to go until our first mock election! This is a crucial opportunity for us to test our platform, gather valuable data, and refine our processes.
              </p>
              <ul style="padding-left:20px; color:#555555; line-height:1.8;">
                <li><strong>Date:</strong> July 12, 2025</li>
                <li><strong>Time:</strong> 9 AM - 5 PM (local time)</li>
                <li><strong>Location:</strong> <a href="https://www.citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">www.citizenmonitors.com</a></li>
              </ul>
            </td>
          </tr>

          <!-- Volunteer CTA -->
          <tr>
            <td align="center" style="padding:30px 20px;">
              <a href="https://www.citizenmonitors.com" style="background-color:#06BBAF; color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:6px; font-weight:bold; font-size:16px; display:inline-block; font-family:'Inter', sans-serif;">🚀 Become a Volunteer</a>
            </td>
          </tr>

          <!-- Spotlight on Data Gathering -->
          <tr>
            <td style="padding:25px; font-family:'Inter', sans-serif;">
              <h3 style="color:#06BBAF; margin-top:0; font-family:'League Spartan', Arial, sans-serif;">📊 Spotlight on Data Gathering Techniques</h3>
              <p style="font-size:15px; color:#555555; line-height:1.6;">In preparation for our mock elections, here’s how we’ll be gathering data:</p>
              <ol style="padding-left:20px; color:#555555; line-height:1.8;">
                <li><strong>Surveys:</strong> Share feedback, photos, and videos.</li>
                <li><strong>Real-Time Monitoring:</strong> Track participation and engagement live.</li>
                <li><strong>Data Analysis:</strong> We’ll analyze insights monthly till the Anambra elections in November 2025.</li>
              </ol>
            </td>
          </tr>

          <!-- Feedback -->
          <tr>
            <td style="padding:25px; font-family:'Inter', sans-serif;">
              <h3 style="color:#06BBAF; margin-top:0; font-family:'League Spartan', Arial, sans-serif;">📝 We Value Your Input!</h3>
              <p style="font-size:15px; color:#555555; line-height:1.6;">What topics or new features would you like to see? Your feedback helps shape this community.</p>
              <p style="font-size:15px;">Share at: <a href="mailto:info@citizenmonitors.com" style="color:#06BBAF;">info@citizenmonitors.com</a></p>
            </td>
          </tr>

          <!-- Events -->
          <tr>
            <td style="padding:25px; font-family:'Inter', sans-serif;">
              <h3 style="color:#06BBAF; margin-top:0; font-family:'League Spartan', Arial, sans-serif;">📅 Upcoming Events</h3>
              <ul style="padding-left:20px; color:#555555; line-height:1.8;">
                <li><strong>Mock Election Training (on X):</strong> July 5, 2025 | 6 PM - 7 PM</li>
                <li><strong>Weekly Townhall:</strong> July 5, 2025 | 8 AM – 8:30 AM</li>
              </ul>
            </td>
          </tr>

          <!-- Social Links -->
          <tr>
            <td align="center" style="padding:25px 20px; background-color:#f9f9f9;">
              <p style="margin:0; font-size:14px; color:#777; font-family:'Inter', sans-serif;">Follow us for updates:</p>
              <p style="margin:10px 0;">
                <a href="https://twitter.com/CitizenMonitors" style="color:#06BBAF; text-decoration:none;">Twitter</a> |
                <a href="https://facebook.com/CitizenMonitors" style="color:#06BBAF; text-decoration:none;">Facebook</a> |
                <a href="https://instagram.com/CitizenMonitors" style="color:#06BBAF; text-decoration:none;">Instagram</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px; font-size:12px; color:#999; font-family:'Inter', sans-serif;">
              <p style="margin:0;">Thank you for being part of the Citizen Monitors community!</p>
              <p style="margin:5px 0;">
                <a href="https://www.citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">www.citizenmonitors.com</a> | 
                <a href="mailto:info@citizenmonitors.com" style="color:#06BBAF;">info@citizenmonitors.com</a>
              </p>
              <p style="margin:8px 0;">
                <a href="$[LI:UNSUBSCRIBE]$" style="color:#06BBAF; text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</div>

                                            `,
                                          });
                                        export const newsLetterTemplateTwo = () =>
                                          baseTemplate({
                                            title: "Citizen Monitors Mock Elections",
                                            message: `
<div style="margin:0; padding:0; background-color:#f4f4f4; font-family:'Inter', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin:30px auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#06BBAF; color:#ffffff; padding:30px 20px;">
              <h1 style="margin:0; font-size:28px; font-family:'League Spartan', Arial, sans-serif;">Citizen Monitors Mock Elections!</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 25px; font-family:'Inter', sans-serif; color:#555555; font-size:16px; line-height:1.6;">
              <p>Dear Citizen Monitors Community,</p>
              <p>We are excited to remind you of the opportunity for you to be an active participant in Nigeria’s democratic process!</p>

              <h3 style="color:#06BBAF; margin-top:25px; font-family:'League Spartan', Arial, sans-serif;">📌 Mock Elections Training Schedule</h3>
              <ul style="padding-left:20px; line-height:1.8;">
                <li><strong>Saturday, 5th of July, 2025</strong> — 8:00 AM - 8:30 AM (during our town hall on X)</li>
                <li><strong>Saturday, 12th of July, 2025</strong> — 8:00 AM - 8:30 AM (same time, same space)</li>
              </ul>

              <p>Follow us on <a href="https://twitter.com/CitizenMonitors" style="color:#06BBAF; text-decoration:none;">X (@CitizenMonitors)</a> to join the conversation.</p>

              <h3 style="color:#06BBAF; margin-top:25px; font-family:'League Spartan', Arial, sans-serif;">What’s on the Agenda?</h3>
              <p>We’ll be discussing:</p>
              <ul style="padding-left:20px; line-height:1.8;">
                <li>The recent political coalition and electoral reforms</li>
                <li>The electoral process and upcoming elections</li>
                <li>Your roles and responsibilities as Citizen Monitors</li>
                <li>How to contribute to free, fair, and transparent elections in Nigeria</li>
              </ul>

              <p>Whether you’re getting involved for the first time or already familiar with the process, this conversation is for you. Together, we can make a difference!</p>

              <p>We look forward to seeing you tomorrow, next Saturday, and every Saturday — same time!</p>

              <p style="margin-top:25px;">Best regards,</p>
              <p><a href="mailto:info@citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">info@citizenmonitors.com</a><br>
              <a href="https://www.citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">www.citizenmonitors.com</a></p>

              <p style="margin-top:25px; font-size:14px; color:#777;">P.S. Feel free to forward this email to anyone interested in participating!</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px; font-size:12px; color:#999; font-family:'Inter', sans-serif;">
              <p style="margin:0;">Thank you for being part of the Citizen Monitors community.</p>
              <p style="margin:5px 0;">
                <a href="https://www.citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">Visit our website</a> | 
                <a href="mailto:info@citizenmonitors.com" style="color:#06BBAF;">Contact us</a>
              </p>
              <p style="margin:8px 0;">
                <a href="$[LI:UNSUBSCRIBE]$" style="color:#06BBAF; text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</div>



                                            `,
                                          });
                                        export const newsLetterTemplateThree = () =>
                                          baseTemplate({
                                            title: "Citizen Monitors Mock Elections",
                                            message: `

<div style="margin:0; padding:0; background-color:#f4f4f4; font-family:'Inter', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin:30px auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#06BBAF; color:#ffffff; padding:30px 20px;">
              <h1 style="margin:0; font-size:26px; font-family:'League Spartan', Arial, sans-serif;">Citizen Monitors Mock Elections</h1>
              <p style="margin:10px 0 0; font-size:16px; font-family:'Inter', sans-serif;">Saturday, July 12, 2025</p>
            </td>
          </tr>

          <!-- Announcement -->
          <tr>
            <td style="padding:30px 25px; font-family:'Inter', sans-serif; color:#555555; font-size:16px; line-height:1.6;">
              <p>In a significant step towards enhancing democratic engagement and electoral integrity in Nigeria, <strong>Citizen Monitors</strong>, the nation’s pioneer civic tech platform for crowdsourcing and verifying real-time electoral data, will hold <strong>mock elections on Saturday, July 12, 2025, from 9:00 AM to 5:00 PM Nigerian time</strong>.</p>
              <p>This initiative aims to educate election Observers and Volunteers on promoting transparency and credible elections through authentic result gathering and reporting, providing valuable data for upcoming elections.</p>

              <p>This landmark simulation allows Nigerians nationwide and in the diaspora to practice tracking, reporting, and verifying polling unit-level results. It recreates a real polling environment using actual past election results — offering participants hands-on experience in citizen-led election transparency.</p>

              <blockquote style="border-left:4px solid #06BBAF; margin:20px 0; padding-left:15px; color:#333333; font-size:16px; line-height:1.6;">
                “These Mock elections are a vital part of empowering citizens and ensuring we’re well-prepared for real elections,” said <strong>Olajumoke Alawode-James</strong>, Spokesperson and Head of Communications for Citizen Monitors. “Participants will learn to navigate the platform and appreciate the significance of citizen engagement in determining election outcomes.”
              </blockquote>

              <h3 style="color:#06BBAF; font-family:'League Spartan', Arial, sans-serif; margin-top:30px;">📌 Why Join the Mock Elections?</h3>
              <ul style="padding-left:20px; line-height:1.8;">
                <li>Familiarise yourself with live results gathering, uploads, and reporting</li>
                <li>Learn how to track and validate polling unit data</li>
                <li>Experience collective monitoring on real-time results collation</li>
                <li>Be part of the movement making Nigerian elections difficult to rig</li>
              </ul>

              <h3 style="color:#06BBAF; font-family:'League Spartan', Arial, sans-serif; margin-top:30px;">📝 How to Participate:</h3>
              <ul style="padding-left:20px; line-height:1.8;">
                <li>Visit <a href="https://www.citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">www.citizenmonitors.com</a></li>
                <li>Sign up as a volunteer or observer before July 12th, 2025</li>
                <li>You’ll receive past voting results from INEC’s IREV to post on the platform</li>
                <li>See collated results in real-time after the mock simulation</li>
              </ul>

              <p>This is especially valuable for <strong>first-time voters</strong> and citizens eager to actively participate in strengthening Nigeria’s electoral process. Join us in creating a transparent and fair electoral system.</p>

              <h3 style="color:#06BBAF; font-family:'League Spartan', Arial, sans-serif; margin-top:30px;">About Citizen Monitors</h3>
              <p><strong>Citizen Monitors</strong> is Nigeria’s civic tech platform committed to promoting electoral integrity and civic participation. Through education, outreach, advocacy, and technology, we empower citizens to actively shape Nigeria’s democratic future.</p>

              <h3 style="color:#06BBAF; font-family:'League Spartan', Arial, sans-serif; margin-top:30px;">Media Contact:</h3>
              <p>
                <strong>Olajumoke Alawode-James</strong><br>
                Spokesperson & Head of Communications, Citizen Monitors<br>
                <a href="mailto:media@citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">media@citizenmonitors.com</a><br>
                <a href="https://www.citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">www.citizenmonitors.com</a>
              </p>

              <p style="margin-top:20px; font-size:14px; color:#777;">P.S. Please share this email with others interested in participating in the simulation!</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px; font-size:12px; color:#999; font-family:'Inter', sans-serif;">
              <p style="margin:0;">Thank you for supporting electoral transparency.</p>
              <p style="margin:5px 0;">
                <a href="https://www.citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">Visit our website</a> | 
                <a href="mailto:info@citizenmonitors.com" style="color:#06BBAF;">Contact us</a>
              </p>
              <p style="margin:8px 0;">
                <a href="$[LI:UNSUBSCRIBE]$" style="color:#06BBAF; text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</div>



                                            `,
                                          });
                                        export const newsLetterTemplateFour = () =>
                                          baseTemplate({
                                            title: "Citizen Monitors - Weekly Insight",
                                            message: `
<div style="margin:0; padding:0; background-color:#f4f4f4; font-family:'Inter', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin:30px auto;  border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#06BBAF; color:#ffffff; padding:30px 20px;">
              <h1 style="margin:0; font-size:26px; font-family:'League Spartan', Arial, sans-serif;">Citizen Monitors – Weekly Insight</h1>
              <p style="margin:10px 0 0; font-size:16px; font-family:'Inter', sans-serif;">Empowering Democracy Through Data</p>
            </td>
          </tr>

          <!-- Announcement -->
          <tr>
            <td style="padding:30px 25px; font-family:'Inter', sans-serif; color:#555555; font-size:16px; line-height:1.6;">
              <h2 style="color:#06BBAF; font-family:'League Spartan', Arial, sans-serif; margin-top:0;">Mock Elections: Real Lessons, Real Momentum</h2>

              <p>Dear Citizen Monitors Community,</p>

              <p>For too long, Nigerians have endured elections marked by irregularities, manipulation, and opacity. From compromised collation centers to vanishing polling unit data, public trust in elections has been consistently eroded. The 2023 elections only deepened this crisis, with many reporting discrepancies between polling unit outcomes and final results, worsened by inaccessible platforms like IReV, post-election.</p>

              <p>The lesson? Civic frustration must be turned into structured civic power. Democracy cannot survive on silence — it thrives on citizen vigilance.</p>

              <p>Last weekend’s <strong>Mock Presidential Elections</strong> on the Citizen Monitors Platform was more than a test. It was proof that technology can shift power back to the people.</p>

              <h3 style="color:#06BBAF; font-family:'League Spartan', Arial, sans-serif; margin-top:30px;">🔎 Quick Highlights from the Mock Election</h3>
              <ul style="padding-left:20px; line-height:1.8;">
                <li>✅ 100% of participants believe Citizen Monitors can make elections harder to rig</li>
                <li>✅ 100% would recommend the platform ahead of 2027</li>
                <li>✅ 80% completed the process smoothly</li>
                <li>✅ Live data aggregation across multiple states, visualized instantly on the platform</li>
              </ul>

              <h3 style="color:#06BBAF; font-family:'League Spartan', Arial, sans-serif; margin-top:30px;">💡 What People Said</h3>
              <blockquote style="border-left:4px solid #06BBAF; margin:20px 0; padding-left:15px; color:#333333; font-size:16px; line-height:1.6;">
                “Less steps to uploading reports would help.”<br>
                “Observers should be properly trained before site access.”<br>
                “Citizen Monitors will make election rigging very hard.”
              </blockquote>

              <p>We listened. System tweaks, easier navigation, and streamlined result uploads are underway — because transparency should never feel complicated.</p>

              <p>We demonstrated how citizens can lead election monitoring themselves. <strong>Citizen Monitors is building Nigeria’s first data-governance model for electoral transparency</strong> — live, public, and people-powered.</p>

              <p>With your participation, we will make elections transparent, credible, and citizen-controlled.</p>

              <p><strong>Please tell a friend about us!</strong> Talk about it on social media. Speak boldly about what is possible when we work together. We can all monitor, verify, and protect.</p>

              <p style="margin-top:30px;">Together, let’s forge a new path for democracy in Nigeria!</p>

              <p>Best regards,<br>The Citizen Monitors Team.</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px; font-size:12px; color:#999; font-family:'Inter', sans-serif;">
              <p style="margin:0;">Thank you for supporting electoral transparency.</p>
              <p style="margin:5px 0;">
                <a href="https://www.citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">Visit our website</a> | 
                <a href="mailto:info@citizenmonitors.com" style="color:#06BBAF;">Contact us</a>
              </p>
              <p style="margin:8px 0;">
                <a href="$[LI:UNSUBSCRIBE]$" style="color:#06BBAF; text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</div>

                                            `,
                                          });
                                        export const newsLetterTemplateFive = () =>
                                          baseTemplate({
                                            title: "Citizen Monitors Demands INEC Accountability Over Deleted Election Results",
                                            message: `
  <div style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: Inter, sans-serif;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); overflow: hidden;">
      <div style="background-color: #06BBAF; color: white; padding: 20px 30px; font-family: 'League Spartan', sans-serif; font-size: 20px; text-align: center; font-weight: bold;">
        Citizen Monitors Calls For Accountability Following Removal of Election Results from INEC Portal
      </div>
      <div style="padding: 30px; font-size: 16px; line-height: 1.6; color: #333333;">
        <p>Citizen Monitors is raising alarm over the recent removal of all election results (as recent as Ondo and Edo 2024 elections) from the Independent National Electoral Commission (INEC) portal. This unexpected action has raised significant concerns regarding data management, transparency, and the integrity of the electoral process.</p>

        <p>The removal of election results from the INEC portal raises critical questions that must be addressed to ensure public trust in the electoral system. Citizen Monitors is calling on INEC to provide clarity on the following issues:</p>

        <ul style="padding-left: 20px;">
          <li>Does INEC have a formal data retention policy for election results?</li>
          <li>If yes, what are the specific terms of this policy – including timelines and access rights?</li>
          <li>Was this policy ever communicated to Nigerians or published publicly?</li>
          <li>If no policy exists, was this removal due to a technical glitch or system failure?</li>
          <li>Did INEC’s hosting arrangement (server payments to Amazon Web Services) expire or lapse?</li>
          <li>Were these election records archived? If so, where, and how can Nigerians access them?</li>
        </ul>

        <p>The absence of election results (past or present) on the INEC portal not only undermines the transparency of the electoral process, but also raises concerns about the accessibility of vital information for citizens, stakeholders, and international observers.</p>

        <p>As Nigeria continues to strengthen its democratic processes, it is crucial for INEC to maintain open lines of communication with the public regarding data management practices.</p>

        <p>Citizen Monitors urges INEC to promptly address these questions and provide a comprehensive explanation regarding the removal of the election results. The organisation believes transparency is essential for fostering trust in the electoral system and ensuring all stakeholders can participate meaningfully in Nigeria’s democracy.</p>

        <p>As the country looks ahead to future elections, particularly Anambra gubernatorial elections in November 2025, it is imperative that INEC demonstrates its commitment to accountability and transparency by clearly communicating its policies and practices to Nigerians.</p>

        <p style="margin-top: 30px;">
          <strong>Olajumoke Alawode-James</strong><br />
          Spokesperson and Head of Communications, Citizen Monitors<br />
          <a href="mailto:media@citizenmonitors.com" style="color: #06BBAF;">media@citizenmonitors.com</a>
        </p>
      </div>

      <div style="padding: 20px 30px; background-color: #f0f0f0; font-size: 13px; text-align: center; color: #777;">
        You’re receiving this email because you subscribed to updates from Citizen Monitors.
        <br />
       
        <a href="#" style="color: #06BBAF; text-decoration: none;">Unsubscribe</a>
      </div>
    </div>
  </div>



                                            `,
                                          });
                                          export const newsLetterTemplateSix = () =>
                                            baseTemplate({
                                              title: "Citizen Monitors Weekly Newsletter",
                                              message: `
                                          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; font-family: Arial, sans-serif; padding: 20px 0;">
                                            <tr>
                                              <td>
                                                <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
                                          
                                                  <!-- Header -->
                                                  <tr>
                                                    <td style="background-color: #06BBAF; color: white; padding: 20px 30px; font-family: Arial, sans-serif; font-size: 20px; text-align: center; font-weight: bold;">
                                                      <h3 style="color: #ffffff; margin: 0;">Citizen Monitors - Weekly Newsletter</h3>
                                                      <h4 style="color: #ffffff; margin: 0;">Lock Down Your Polling Unit</h4>
                                                    </td>
                                                  </tr>
                                          
                                                  <!-- Body -->
                                                  <tr>
                                                    <td style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.6; font-family: Arial, sans-serif;">
                                                      <p>Dear Citizen Monitors Community,</p>
                                          
                                                      <p>We hope this message finds you well! As we continue to foster a culture of transparency and accountability in our electoral process, we want to emphasize the importance of being proactive, even when elections aren’t on the immediate horizon.</p>
                                          
                                                      <p><strong>Why Every Nigerian Should Lock Down Their Polling Unit… Now.</strong></p>
                                          
                                                      <p>This week, we’re diving into why now is the perfect time to prepare for the upcoming by-elections and the 2027 general elections, by securing your polling unit with Citizen Monitors.</p>
                                          
                                                      <p><strong>💡 What Does “Locking Down Your Polling Unit” Mean?</strong></p>
                                          
                                                      <p>Locking down your polling unit means taking personal responsibility for monitoring, documenting, and verifying electoral activities where you vote. You’re not just a voter, you’re now a data guardian.</p>
                                          
                                                      <p><strong>✅ Why It Matters (Even in an Off-Season)</strong></p>
                                                      <ul style="padding-left: 20px; margin-top: 10px;">
                                                        <li>Rigging starts with silence: Most electoral fraud occurs in areas where no one is observing.</li>
                                                        <li>Early preparation: Getting ready now gives you ample time to train and familiarize yourself with our platform.</li>
                                                        <li>Access to resources: You’ll gain entry to our peer-review process, mock elections results uploads, and additional resources to enhance your monitoring skills.</li>
                                                      </ul>
                                          
                                                      <p><strong>📝 Your Action Steps This Week:</strong></p>
                                                      <ol style="padding-left: 20px; margin-top: 10px;">
                                                        <li>Log into <a href="https://www.citizenmonitors.com" target="_blank" style="color: #1a73e8;">www.citizenmonitors.com</a></li>
                                                        <li>Lock down your polling unit.</li>
                                                        <li>Invite 2 friends to do the same.</li>
                                                        <li>Bookmark our next mock elections exercise date (details coming soon).</li>
                                                      </ol>
                                          
                                                      <p>While there may not be elections happening this week, democracy doesn’t rest and neither should our preparations. Let’s work together to ensure that every vote counts and that our electoral process is fair and transparent.</p>
                                          
                                                      <p>Thank you for your commitment to safeguarding our democracy!</p>
                                          
                                                      <p>
                                                        <strong>The Citizen Monitors Team</strong><br />
                                                        <span>Email:</span> <a href="mailto:info@citizenmonitors.com" style="color:#1a73e8;">info@citizenmonitors.com</a><br />
                                                        <span>Website:</span> <a href="https://www.citizenmonitors.com" style="color:#1a73e8;">www.citizenmonitors.com</a>
                                                      </p>
                                                    </td>
                                                  </tr>
                                          
                                                </table>
                                              </td>
                                            </tr>
                                          </table>
                                              `,
                                            });
                                          

                                            export const newsLetterTemplateSeven = () =>
                                              baseTemplate({
                                                title: "Citizen Monitors Weekly Newsletter",
                                                message: `
                                            <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
                                              <tr>
                                                <td>
                                                  <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
                                            
                                                    <!-- Header -->
                                                    <tr>
                                                      <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center; font-size: 20px; font-weight: bold;">
                                                        <h3 style="color: #ffffff; margin: 0;">Citizen Monitors - Weekly Newsletter</h3>
                                                        <h4 style="color: #ffffff; margin: 0;">Nothing’s Happening? That’s When the Real Work Begins</h4>
                                                      </td>
                                                    </tr>
                                            
                                                    <!-- Body -->
                                                    <tr>
                                                      <td style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.6;">
                                                        <p>Dear Citizen Monitors Community,</p>
                                            
                                                        <p>It’s been a quiet week in the headlines — but silence doesn’t mean safety.</p>
                                            
                                                        <p><strong>INEC is silent. Politicians are regrouping. But, so are we?</strong><br>While the noise fades, Citizen Monitors is doubling down.</p>
                                            
                                                        <ul style="padding-left: 20px; margin-top: 10px;">
                                                          <li>We’re upgrading our platform ahead of the next mock elections.</li>
                                                          <li>More polling units are getting locked in by everyday citizens.</li>
                                                          <li>New features are in testing — to make uploads easier, faster, smarter.</li>
                                                        </ul>
                                            
                                                        <p>If you’ve signed up already, now’s the time to explore your dashboard.</p>
                                            
                                                        <p>If you haven’t yet, the earlier you lock your polling unit, the better.</p>
                                            
                                                        <p><strong>Because when the next election comes, there won’t be time to start preparing.</strong><br>There’ll only be time to act.</p>
                                            
                                                        <p style="font-weight: bold;">📅 Mark Your Calendar:</p>
                                                        <p>Our next mock election is around the corner — a full national simulation to test the system and sharpen your civic muscle.</p>
                                            
                                                        <p><strong>🔗  Sign up. Lock down. Tell your family. Tell a friend. Be ready.</strong></p>
                                            
                                                        <p><a href="https://www.citizenmonitors.com" target="_blank" style="color: #1a73e8;">👉 www.citizenmonitors.com</a></p>
                                            
                                                        <p>Yours in vigilance,</p>
                                                        <p><strong>The Citizen Monitors Team</strong></p>
                                                      </td>
                                                    </tr>
                                                  </table>
                                                </td>
                                              </tr>
                                            </table>
                                            `,
                                              });

export const newsLetterTemplateTaxChanges = () =>
  baseTemplate({
    title: "Citizen Monitors Newsletter",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background-color: #05a39c; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Citizen Monitors Newsletter</h3>
                  <h4 style="color: #ffffff; margin: 0; font-weight: normal;"><strong>Tax Changes Must Come With Clarity, Fairness, and Real Protection for Households</strong></h4>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.6;">
                  <p>The Federal Government has signed new tax legislation, due to take effect from 1st of January 2026, while pausing the proposed 5% fossil-fuel surcharge, pending further consultations. Officials confirm that no start date has been fixed for the surcharge at this time.</p>
                  
                  <p>As households and businesses prepare for 2026, citizens and stakeholders are calling for clear, honest communication; not confusion or panic.</p>
                  
                  <blockquote style="border-left: 4px solid #05a39c; padding-left: 15px; color: #333; margin: 20px 0;">
                    "Reform is welcome only if people understand it and can plan," <br/>
                    <strong>Adeshope Haastrup</strong>, Co-Founder Citizen Monitors said.<br/>
                    "Without clarity, even good policy causes fear. The public needs facts; not rumours."
                  </blockquote>
                  
                  <h4 style="color: #05a39c; margin-top: 25px;">Key Recommendations for Government:</h4>
                  
                  <h4 style="margin-top: 20px;">1. Clear, Simple Communication</h4>
                  <p>Government should publish a one-page guide (in plain English), explaining what is changing, what is not, and when.</p>
                  <p>The guide should include:</p>
                  <ul>
                    <li>A timeline to January 2026</li>
                    <li>FAQs tailored to common jobs and small businesses</li>
                    <li>A helpline, or online portal for public questions</li>
                  </ul>
                  <p>This will stop the weekly wave of rumours and misinformation.</p>
                  
                  <h4 style="margin-top: 20px;">2. Protect Household Budgets</h4>
                  <p>The public must be reminded that VAT remains at 7.5%, and zero-rated essentials like food, books, medicines, and certain energy items remain exempt.</p>
                  <p>Regulators must:</p>
                  <ul>
                    <li>Prevent false VAT hikes at checkout</li>
                    <li>Monitor prices and enforce compliance</li>
                    <li>Give citizens tools to report violations</li>
                  </ul>
                  
                  <h4 style="margin-top: 20px;">3. Support Workers and Small Businesses</h4>
                  <p>Government should:</p>
                  <ul>
                    <li>Publish updated PAYE tables early</li>
                    <li>Provide a penalty-free transition for SMEs into the new e-invoicing/fiscalisation system</li>
                    <li>Offer step-by-step guidance and free toolkits to ensure smooth onboarding</li>
                  </ul>
                  
                  <h4 style="color: #05a39c; margin-top: 25px;">Citizen Monitoring Begins</h4>
                  <p>As rollout begins, Citizen Monitors will track and report the real-life impact of the changes; helping Nigerians see what is working, and where more clarity or correction is needed.</p>
                  
                  <p><strong>Media Contact:</strong><br/>
                  Olajumoke Alawode-James.<br/>
                  Spokesperson and Head of Communications; Citizen Monitors.<br/>
                  media@citizenmonitors.com<br/>
                  www.citizenmonitors.com</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  });
                                                    

                                                      export const newsLetterTemplateProtest40 = () =>
                                                        baseTemplate({
                                                          title: "The New Protest Is Evidence — 40 Days to Anambra Elections",
                                                          message: `
                                                            <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
                                                              <tr>
                                                                <td>
                                                                  <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
                                                                    <!-- Header -->
                                                                    <tr>
                                                                      <td style="background-color: #05a39c; color: white; padding: 20px 30px; text-align: center;">
                                                                        <h3 style="color: #ffffff; margin: 0; font-size: 22px;">The New Protest Is Evidence</h3>
                                                                        <h4 style="color: #ffffff; margin: 0; font-weight: normal;">40 Days to Anambra Elections</h4>
                                                                      </td>
                                                                    </tr>
                                                      
                                                                    <!-- Body -->
                                                                    <tr>
                                                                      <td style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.6;">
                                                                        <h4 style="color: #05a39c; margin-top: 0;">Why this is the new protest?</h4>
                                                                        <p>Street protests feel blocked, risky, or ignored. But evidence can’t be teargassed. Citizen Monitors turns anger into receipts: clean photos of results, GPS-stamped incident reports, and fast uploads that communities can cross-check. It’s simple: the more verifiable data we gather, the harder it becomes to lie about outcomes. That’s protest, without the barricades.</p>
                                                      
                                                                        <h4 style="color: #05a39c; margin-top: 25px;">How we win (wherever you live)</h4>
                                                                        <p>If you’re on the ground, your job is to capture clearly and upload fast. If you’re elsewhere in Nigeria, or abroad, your job is to recruit, and share guides so first-timers don’t make avoidable mistakes.</p>
                                                                        <p>You must make sure you wake everyone up before the day of election: invite family, friends, faith groups, alumni and market WhatsApp lists to join Citizen Monitors. This is how we turn noise into proof, and proof into consequences.</p>
                                                      
                                                                        <h4 style="color: #05a39c; margin-top: 25px;">Anambra is the starting line</h4>
                                                                        <p>The next proving ground is Anambra Governorship election happening on <strong>Saturday, 8 November 2025</strong> (in 40 days). Even if you don’t live in Anambra, help recruit on-ground contacts. If you’re in Anambra, map your polling unit, assemble a 3–5-person team, and practice result-sheet photography now.</p>
                                                                        <p>Clean November data strengthens the case against electoral malfeasance everywhere. Let’s turn Election Day into Evidence Day.</p>
                                                      
                                                                        <p style="margin-top: 25px;">— <strong>Citizen Monitors</strong><br>
                                                                        Guardians of Truth</p>
                                                      
                                                                        <p>📡 <a href="https://www.citizenmonitors.com" style="color:#05a39c; text-decoration:none;">www.citizenmonitors.com</a><br>
                                                                        📱 @CitizenMonitors (X / IG / FB)</p>
                                                      
                                                                        <p style="margin-top: 20px; font-style: italic;">Forward this newsletter. Call today. Nigeria is listening.</p>
                                                                      </td>
                                                                    </tr>
                                                                  </table>
                                                                </td>
                                                              </tr>
                                                            </table>
                                                          `,
                                                        });
                                                      
                                                        export const newsLetterTemplateCredible33 = () =>
                                                          baseTemplate({
                                                            title: "Credible Elections or Bust — 33 Days to Anambra",
                                                            message: `
                                                              <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
                                                                <tr>
                                                                  <td>
                                                                    <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
                                                                      <!-- Header -->
                                                                      <tr>
                                                                        <td style="background-color: #05a39c; color: white; padding: 20px 30px; text-align: center;">
                                                                          <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Credible Elections or Bust</h3>
                                                                          <h4 style="color: #ffffff; margin: 0; font-weight: normal;">33 Days to Anambra</h4>
                                                                        </td>
                                                                      </tr>
                                                        
                                                                      <!-- Body -->
                                                                      <tr>
                                                                        <td style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.6;">
                                                                          <p>Dear Citizen Monitors,</p>
                                                        
                                                                          <p>This is the fight of our lives.</p>
                                                        
                                                                          <p>If elections work, governance works. Budgets reflect real priorities. Services improve. Leaders know they can be removed by votes—not violence or vibes. If elections fail, everything else is theatre.</p>
                                                        
                                                                          <p>That’s why every citizen, at home or abroad, must treat credible elections as a personal duty, not a spectator sport. If we don’t rise, and rise strategically, the country keeps sliding; and getting back up will be far harder.</p>
                                                        
                                                                          <h4 style="color: #05a39c; margin-top: 25px;">The new protest is evidence</h4>
                                                                          <p>Street action can be blocked or ignored. Evidence cannot.</p>
                                                                          <p>Citizen Monitors turns outrage into receipts: clear photos of result sheets, GPS-stamped incident reports, and fast uploads that anyone can cross-check.</p>
                                                        
                                                                          <h4 style="color: #05a39c; margin-top: 25px;">Your role is simple:</h4>
                                                                          <ul style="padding-left: 20px; margin: 0;">
                                                                            <li>If you’re on the ground — capture cleanly.</li>
                                                                            <li>If you’re elsewhere — recruit and verify.</li>
                                                                          </ul>
                                                        
                                                                          <p style="margin-top: 15px;">Add three people to your monitoring circle today—family, friends, faith, or alumni groups. Teach them the basics: photograph the EC8A clearly, keep location on, upload fast. The more verifiable data we gather, the harder it becomes to lie about outcomes.</p>
                                                        
                                                                          <h4 style="color: #05a39c; margin-top: 25px;">Anambra is the starting line</h4>
                                                                          <p>The next proving ground: <strong>Anambra Governorship Election — Saturday, 8 November 2025 (33 days)</strong>.</p>
                                                                          <p>If you’re in Anambra, map your polling unit, form a 3–5 person team, and practice result-sheet photography now.</p>
                                                                          <p>If you’re outside Anambra, or abroad, recruit local contacts and volunteer as a remote validator.</p>
                                                        
                                                                          <p>Clean Anambra elections’ data in November strengthens the national push for credible elections and accountable governance.</p>
                                                        
                                                                          <p><strong>INEC</strong> has confirmed the date and final register; now let’s turn Election Day into Evidence Day.</p>
                                                        
                                                                          <p style="margin-top: 25px;">— <strong>Citizen Monitors</strong><br>
                                                                          Guardians of Truth</p>
                                                        
                                                                          <table cellpadding="0" cellspacing="0" width="100%" style="margin-top: 25px; font-family: Arial, sans-serif; text-align: center;">
                                                                            <tr>
                                                                              <td>
                                                                                <p style="margin: 0; font-size: 16px; color: #05a39c; font-weight: bold;">
                                                                                  📡 <a href="https://www.citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">CitizenMonitors.com</a>
                                                                                </p>
                                                                                <p style="margin: 5px 0 0 0; font-size: 15px; color: #333333;">
                                                                                  📱 <strong>@CitizenMonitors</strong> (X / IG / FB)
                                                                                </p>
                                                                                <p style="margin: 20px 0 0 0; font-size: 14px; font-style: italic; color: #555555;">
                                                                                  🔊 Forward this newsletter. Call today. Nigeria is listening.
                                                                                </p>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                      </tr>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </table>
                                                            `,
                                                          });
                                                        

                                                          export const newsLetterTemplateINEC26 = () =>
                                                            baseTemplate({
                                                              title: "Who Will Save INEC? — Amupitan’s Nomination & 26 Days to Anambra",
                                                              message: `
                                                                <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
                                                                  <tr>
                                                                    <td>
                                                                      <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
                                                                        <!-- Header -->
                                                                        <tr>
                                                                          <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                                                                            <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Who Will Save INEC?</h3>
                                                                            <h4 style="color: #ffffff; margin: 0; font-weight: normal;">Amupitan’s Nomination & 26 Days to Anambra</h4>
                                                                          </td>
                                                                        </tr>
                                                          
                                                                        <!-- Body -->
                                                                        <tr>
                                                                          <td style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.6;">
                                                                            <p>Dear Citizen Monitors,</p>
                                                          
                                                                            <p>As expected, Nigeria just changed referees — as the law requires. President Bola Tinubu has nominated Prof. Joash Ojo Amupitan, SAN as the next INEC Chairman, with the National Council of State giving its nod. The Senate screening is next.</p>
                                                          
                                                                            <p>This process — nomination and Senate approval — demands higher-than-usual transparency.</p>
                                                          
                                                                            <p>Allegations that Amupitan served on Tinubu’s 2023 legal team have been publicly denied (including by the team’s coordinator) yet contradicted by referenced court filings. Optics matter. Citizens are right to insist on guardrails that prove independence, not just claim it.</p>
                                                          
                                                                            <h4 style="color: #06BBAF; margin-top: 25px;">What Happened</h4>
                                                                            <ul style="padding-left: 20px; margin: 0;">
                                                                              <li><strong>7 Oct 2025:</strong> Prof. Mahmood Yakubu steps down at the end of his second term; hands over to May Agbamuche-Mbu as Acting INEC Chair.</li>
                                                                              <li><strong>9 Oct 2025:</strong> President Tinubu nominates Prof. Amupitan; the Council of State approves; Presidency announces. Senate screening is next.</li>
                                                                              <li><strong>13 Oct 2025:</strong> Agbamuche-Mbu remains Acting Chair pending confirmation; public debate on INEC’s independence heats up.</li>
                                                                            </ul>
                                                          
                                                                            <h4 style="color: #06BBAF; margin-top: 25px;">What Citizens Should Demand</h4>
                                                                            <p><em>Peacefully. Lawfully. Consistently.</em></p>
                                                                            <ul style="padding-left: 20px; margin: 0;">
                                                                              <li>An open Senate screening — live-streamed and fully recorded.</li>
                                                                              <li>A published decisions log — to track key INEC administrative actions.</li>
                                                                              <li>Time-bound BVAS/IReV readiness tests — before the Anambra election.</li>
                                                                              <li>Clear recusal rules — for INEC officials in cases involving political actors they’ve previously represented.</li>
                                                                            </ul>
                                                          
                                                                            <p style="margin-top: 10px;">Call, email, and tag your Senators and Representatives this week. Keep receipts.</p>
                                                          
                                                                            <h4 style="color: #06BBAF; margin-top: 25px;">26 Days to Anambra</h4>
                                                                            <p>The next proving ground for credibility is the <strong>Anambra Governorship Election — Saturday, 8 November 2025.</strong></p>
                                                          
                                                                            <p>If you’re in Anambra:</p>
                                                                            <ul style="padding-left: 20px;">
                                                                              <li>Map your polling unit.</li>
                                                                              <li>Build a 3–5 person monitoring circle.</li>
                                                                            </ul>
                                                          
                                                                            <p>If you’re elsewhere or abroad:</p>
                                                                            <ul style="padding-left: 20px;">
                                                                              <li>Recruit on-ground volunteers.</li>
                                                                              <li>Serve as a remote validator for uploads and reports.</li>
                                                                            </ul>
                                                          
                                                                            <p>When elections work, governance works. Let’s make November 8th, Evidence Day.</p>
                                                          
                                                                            <p style="margin-top: 25px;">— <strong>Citizen Monitors</strong><br>
                                                                            Guardians of Truth</p>
                                                          
                                                                            <table cellpadding="0" cellspacing="0" width="100%" style="margin-top: 25px; font-family: Arial, sans-serif; text-align: center;">
                                                                              <tr>
                                                                                <td>
                                                                                  <p style="margin: 0; font-size: 16px; color: #06BBAF; font-weight: bold;">
                                                                                    📡 <a href="https://www.citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">CitizenMonitors.com</a>
                                                                                  </p>
                                                                                  <p style="margin: 5px 0 0 0; font-size: 15px; color: #333333;">
                                                                                    📱 <strong>@CitizenMonitors</strong> (X / IG / FB)
                                                                                  </p>
                                                                                  <p style="margin: 20px 0 0 0; font-size: 14px; font-style: italic; color: #555555;">
                                                                                    🔊 Forward this newsletter. Call today. Nigeria is listening.
                                                                                  </p>
                                                                                </td>
                                                                              </tr>
                                                                            </table>
                                                                          </td>
                                                                        </tr>
                                                                      </table>
                                                                    </td>
                                                                  </tr>
                                                                </table>
                                                              `,
                                                            });
                                                          

                                                            export const userActivitySummaryTemplate = ({ dateRange, login, signup, observer, volunteer, result, incident, flagged, volunteerToObserver, total }: UserActivitySummaryInput) =>
                                                              baseTemplate({
                                                                title: `Citizen Monitors User Activity Summary`,
                                                                message: `
                                                                  <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
                                                                    <tr>
                                                                      <td>
                                                                        <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
                                                                          
                                                                          <!-- Header -->
                                                                          <tr>
                                                                            <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                                                                              <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Citizen Monitors Analytics</h3>
                                                                              <h4 style="color: #ffffff; margin: 0; font-weight: normal;">User Activity Summary — ${dateRange}</h4>
                                                                            </td>
                                                                          </tr>
                                                            
                                                                          <!-- Body -->
                                                                          <tr>
                                                                            <td style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.6;">
                                                                              <p style="text-align:center; color:#666;">Summary of user actions recorded in the system.</p>
                                                            
                                                                              <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                                                                                <tr style="background-color:#f3f3f3;">
                                                                                  <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">Activity</th>
                                                                                  <th style="padding:8px; border-bottom:1px solid #ddd;">Count</th>
                                                                                </tr>
                                                                                <tr><td style="padding:8px; border-bottom:1px solid #eee;">Logins</td><td style="text-align:center;">${login}</td></tr>
                                                                                <tr><td style="padding:8px; border-bottom:1px solid #eee;">Signups</td><td style="text-align:center;">${signup}</td></tr>
                                                                                <tr><td style="padding:8px; border-bottom:1px solid #eee;">Observers</td><td style="text-align:center;">${observer}</td></tr>
                                                                                <tr><td style="padding:8px; border-bottom:1px solid #eee;">Volunteers</td><td style="text-align:center;">${volunteer}</td></tr>
                                                                                <tr><td style="padding:8px; border-bottom:1px solid #eee;">Election Results</td><td style="text-align:center;">${result}</td></tr>
                                                                                <tr><td style="padding:8px; border-bottom:1px solid #eee;">Incident Reports</td><td style="text-align:center;">${incident}</td></tr>
                                                                                <tr><td style="padding:8px; border-bottom:1px solid #eee;">Flagged Results</td><td style="text-align:center;">${flagged}</td></tr>
                                                                                <tr><td style="padding:8px; border-bottom:1px solid #eee;">Volunteer To Observer</td><td style="text-align:center;">${volunteerToObserver}</td></tr>
                                                                                <tr style="background-color:#f9f9f9; font-weight:bold;">
                                                                                  <td style="padding:8px; border-top:2px solid #06BBAF;">Total</td>
                                                                                  <td style="text-align:center; border-top:2px solid #06BBAF;">${total}</td>
                                                                                </tr>
                                                                              </table>
                                                            
                                                                              <p style="margin-top:25px; font-size:14px; color:#666; text-align:center;">
                                                                                This report is generated automatically by the Citizen Monitors Analytics Engine.
                                                                              </p>
                                                                            </td>
                                                                          </tr>
                                                            
                                                                        </table>
                                                                      </td>
                                                                    </tr>
                                                                  </table>
                                                                `,
                                                              });
                                                            
                                                    
                                                              export const newsLetterTemplateCrediblePeople = () =>
                                                                baseTemplate({
                                                                  title: "Citizen Monitors Weekly Newsletter",
                                                                  message: `
                                                                <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
                                                                  <tr>
                                                                    <td>
                                                                      <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
                                                                        
                                                                        <!-- Header -->
                                                                        <tr>
                                                                          <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                                                                            <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Credible People → Credible Leaders</h3>
                                                                            <h4 style="color: #ffffff; margin: 0; font-weight: normal;">Let’s raise the bar before Anambra votes</h4>
                                                                          </td>
                                                                        </tr>
                                                              
                                                                        <!-- Body -->
                                                                        <tr>
                                                                          <td style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.6;">
                                                                            
                                                                            <h4 style="color: #06BBAF; margin-top: 0;">Why Credibility Comes First</h4>
                                                                            <p>If we want credible leaders, we need credible people leading the charge. That’s us. Citizen Monitors turns everyday citizens into <strong>evidence-builders</strong>: we gather clean results, verify incidents, and leave a trail that power can’t wish away.</p>
                                                              
                                                                            <p>Credibility isn’t a title, it’s a habit — precision over hype, responsibility over clout, service over side-taking. When we model that, the system has to respond.</p>
                                                              
                                                                            <h4 style="color: #06BBAF; margin-top: 25px;">What “Credible” Looks Like on Citizen Monitors</h4>
                                                                            <p>Credible people don’t forward rumours. They:</p>
                                                                            <ul style="padding-left: 20px; margin-top: 10px; line-height: 1.8;">
                                                                              <li>✅ Upload clear photos of result sheets with PU, ward, and time stamps</li>
                                                                              <li>✅ Keep location on and correct mistakes fast</li>
                                                                              <li>✅ Are transparent about what they saw, and what they didn’t see</li>
                                                                              <li>✅ Help first-timers practice and double-check entries</li>
                                                                              <li>✅ Escalate only what can be verified</li>
                                                                              <li>✅ Recruit others who care about truth more than trend</li>
                                                                            </ul>
                                                                            <p>Each clean upload raises the bar for leadership.</p>
                                                              
                                                                            <h4 style="color: #06BBAF; margin-top: 25px;">Let’s Do This — In the Next 7 Days…</h4>
                                                                            <ul style="padding-left: 20px; margin-top: 10px; line-height: 1.8;">
                                                                              <li>👥 Build a 3–5 person monitoring circle</li>
                                                                              <li>📸 Assign roles: one captures results, one uploads, one verifies/logs</li>
                                                                              <li>🤝 Invite three credible friends or family — people you’d trust with your name and reputation</li>
                                                                              <li>📢 Share this message to your faith, estate, alumni, and market groups</li>
                                                                            </ul>
                                                              
                                                                            <p><strong>The new protest is evidence.</strong><br>
                                                                            Let’s be the reason leadership gets better.</p>
                                                              
                                                                            <h4 style="color: #06BBAF; margin-top: 25px;">Anambra Governorship — Saturday, 8 November 2025 — 19 Days</h4>
                                                                            <p>If you live in Anambra:</p>
                                                                            <ul style="padding-left: 20px; margin-top: 5px;">
                                                                              <li>Map your polling unit, lock roles, and practice result-sheet photos now.</li>
                                                                            </ul>
                                                                            <p>If you’re outside Anambra (or abroad):</p>
                                                                            <ul style="padding-left: 20px; margin-top: 5px;">
                                                                              <li>Recruit on-ground contacts and volunteer as a remote validator.</li>
                                                                            </ul>
                                                              
                                                                            <p>Clean November data strengthens the national push for <strong>credible elections and credible leaders.</strong></p>
                                                              
                                                                            <p style="margin-top: 20px;"><a href="https://www.citizenmonitors.com" style="color: #06BBAF; text-decoration: none; font-weight: bold;">Join Citizen Monitors → www.citizenmonitors.com</a><br>
                                                                            Be part of the evidence that power can’t ignore.</p>
                                                              
                                                                            <p style="margin-top: 25px;"><strong>Citizen Monitors</strong><br>Guardians of Truth</p>
                                                                            <p style="color: #06BBAF; margin-top: 10px;">📱 @CitizenMonitors (X / IG / FB / YouTube)</p>
                                                              
                                                                            <p style="margin-top: 20px; font-style: italic; color: #555;">Forward this newsletter. Call today. Nigeria is listening.</p>
                                                              
                                                                          </td>
                                                                        </tr>
                                                              
                                                                      </table>
                                                                    </td>
                                                                  </tr>
                                                                </table>
                                                                `,
                                                                });
                                                              


                                                                export const newsLetterTemplateAnambraObservers = () =>
                                                                  baseTemplate({
                                                                    title: "Citizen Monitors Weekly Newsletter",
                                                                    message: `
                                                                  <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
                                                                    <tr>
                                                                      <td>
                                                                        <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
                                                                
                                                                          <!-- Header -->
                                                                          <tr>
                                                                            <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                                                                              <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Anambra Elections: 500 Observers Needed — 12 Days to Go</h3>
                                                                              <h4 style="color: #ffffff; margin: 0; font-weight: normal;">Let’s turn Election Day into Evidence Day</h4>
                                                                            </td>
                                                                          </tr>
                                                                
                                                                          <!-- Body -->
                                                                          <tr>
                                                                            <td style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.6;">
                                                                
                                                                              <p>Dear Citizen Monitors,</p>
                                                                
                                                                              <p><strong>Everyone has a part to play.</strong></p>
                                                                
                                                                              <p>Credible elections aren’t the job of one tribe, party, or “patriot.” It’s everyone’s. If 2027 is to mean something, we must act—peacefully, lawfully, and relentlessly—with the one thing power can’t gaslight: <strong>evidence.</strong></p>
                                                                
                                                                              <h4 style="color: #06BBAF; margin-top: 25px;">Your Part (Simple, Repeatable)</h4>
                                                                              <p>Pick your role and lock it in:</p>
                                                                              <ul style="padding-left: 20px; margin-top: 10px; line-height: 1.8;">
                                                                                <li>📸 <strong>On-ground capturer:</strong> record result sheets (EC8A) or incidents.</li>
                                                                                <li>🕵️ <strong>Remote validator:</strong> double-check uploaded reports.</li>
                                                                                <li>🤝 <strong>Recruiter:</strong> add credible people to the platform every week.</li>
                                                                                <li>🎓 <strong>Trainer:</strong> teach first-timers how to capture cleanly.</li>
                                                                              </ul>
                                                                
                                                                              <p>Keep your location on, label uploads (PU, ward, time), and correct mistakes fast. Then add three people who’ll do the same. That’s how <strong>credibility scales.</strong></p>
                                                                
                                                                              <h4 style="color: #06BBAF; margin-top: 25px;">Anambra: 500 Paid Observers Needed</h4>
                                                                              <p><strong>🗳 Election Day:</strong> Saturday, 8 Nov 2025</p>
                                                                
                                                                              <p>We need <strong>500 observers</strong> to send verifiable evidence from their polling units:</p>
                                                                              <ul style="padding-left: 20px; margin-top: 10px; line-height: 1.8;">
                                                                                <li>✅ Clear photo of signed EC8A, or</li>
                                                                                <li>🎥 Short video of results announced.</li>
                                                                              </ul>
                                                                
                                                                              <p>If you’re in Anambra, <strong>sign up</strong>. If not, <strong>recruit someone who is.</strong><br>
                                                                              Smartphone required. Payment after verification.</p>
                                                                
                                                                              <p style="margin-top: 25px;">Let’s turn <strong>Election Day</strong> into <strong>Evidence Day</strong> — together.</p>
                                                                
                                                                              <p style="margin-top: 25px;"><strong>Citizen Monitors</strong><br>Guardians of Truth</p>
                                                                              <p style="color: #06BBAF; margin-top: 10px;">📱 @CitizenMonitors (X / IG / FB / YouTube)</p>
                                                                
                                                                              <p style="margin-top: 20px; font-style: italic; color: #555;">Forward this newsletter. Call today. Nigeria is listening.</p>
                                                                
                                                                            </td>
                                                                          </tr>
                                                                
                                                                        </table>
                                                                      </td>
                                                                    </tr>
                                                                  </table>
                                                                  `,
                                                                  });
                                                                
                                                                  export const newsLetterTemplateAllRoadsLeadToAnambra = () =>
                                                                    baseTemplate({
                                                                      title: "Citizen Monitors Weekly Newsletter",
                                                                      message: `
                                                                    <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
                                                                      <tr>
                                                                        <td>
                                                                          <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
                                                                            
                                                                            <!-- Header -->
                                                                            <tr>
                                                                              <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                                                                                <h3 style="color: #ffffff; margin: 0; font-size: 22px;">All Roads Lead to Anambra</h3>
                                                                                <h4 style="color: #ffffff; margin: 0; font-weight: normal;">One Week. One State. One Chance to Raise the Standard.</h4>
                                                                              </td>
                                                                            </tr>
                                                                            
                                                                            <!-- Body -->
                                                                            <tr>
                                                                              <td style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.6;">
                                                                                
                                                                                <p>Dear Citizen Monitors,</p>
                                                                  
                                                                                <p><strong>One week. One state. One chance to prove that citizens can raise the standard.</strong></p>
                                                                  
                                                                                <p>Can Nigerians do better? <strong>Absolutely</strong> — when we trade noise for evidence.<br>
                                                                                Can we make institutions do better? <strong>Definitely</strong> — when every polling unit has eyes, proof, and uploads that can’t be denied.</p>
                                                                  
                                                                                <p>This week isn’t for waiting. It’s for moving — calmly, boldly, together.</p>
                                                                  
                                                                                <h4 style="color: #06BBAF; margin-top: 25px;">Your Role This Week</h4>
                                                                                <p>Everyone has a part. Pick yours and lock it in now.</p>
                                                                  
                                                                                <p><strong>If you’re on-ground:</strong></p>
                                                                                <ul style="padding-left: 20px; line-height: 1.8;">
                                                                                  <li>📸 Practice clear, full photos of EC8A (figures + signatures visible).</li>
                                                                                  <li>📍 Keep your location on.</li>
                                                                                  <li>🗑 Clear your phone storage.</li>
                                                                                  <li>🚶 Know your route and stay alert.</li>
                                                                                </ul>
                                                                  
                                                                                <p><strong>If you’re away from Anambra or abroad:</strong></p>
                                                                                <ul style="padding-left: 20px; line-height: 1.8;">
                                                                                  <li>🤝 Recruit others.</li>
                                                                                  <li>🕵️ Verify uploads remotely.</li>
                                                                                  <li>📢 Share our how-tos so new observers don’t make avoidable mistakes.</li>
                                                                                </ul>
                                                                  
                                                                                <p>Tell every voter you know: <strong>Secure your vote with Citizen Monitors — capture, upload, verify.</strong><br>
                                                                                Every image counts. Every upload strengthens the record.</p>
                                                                  
                                                                                <h4 style="color: #06BBAF; margin-top: 25px;">Anambra: 500 Observers Needed (Paid)</h4>
                                                                                <p>We’re recruiting <strong>500 paid observers</strong> in Anambra to build the trail of truth on Election Day.</p>
                                                                  
                                                                                <p>You’ll be paid for verified evidence from your polling unit:</p>
                                                                                <ul style="padding-left: 20px; line-height: 1.8;">
                                                                                  <li>✅ A clear photo of the signed result sheet (EC8A), or</li>
                                                                                  <li>🎥 A short video of the collation officer announcing results.</li>
                                                                                </ul>
                                                                  
                                                                                <p>Payment follows verification.<br>
                                                                                If you’re in Anambra, <strong>sign up today.</strong><br>
                                                                                If you’re not, <strong>send this to someone who is.</strong></p>
                                                                  
                                                                                <p style="margin-top: 25px;"><strong>The new protest is proof.</strong><br>
                                                                                Let’s turn Election Day into Evidence Day — and make the system answer to facts, not noise.</p>
                                                                  
                                                                                <p style="margin-top: 25px;"><strong>Citizen Monitors</strong><br>Guardians of Truth</p>
                                                                                <p style="color: #06BBAF; margin-top: 10px;">📱 @CitizenMonitors (X / IG / FB / YouTube)</p>
                                                                  
                                                                                <p style="margin-top: 20px; font-style: italic; color: #555;">Forward this newsletter. Call today. Nigeria is listening.</p>
                                                                              
                                                                              </td>
                                                                            </tr>
                                                                            
                                                                          </table>
                                                                        </td>
                                                                      </tr>
                                                                    </table>
                                                                    `,
                                                                    });
                                                  


                                                                    export const newsLetterTemplateAnambra2025Results = () =>
                                                                      baseTemplate({
                                                                        title: "Citizen Monitors Weekly Newsletter",
                                                                        message: `
                                                                      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
                                                                        <tr>
                                                                          <td>
                                                                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
                                                                              
                                                                              <!-- Header -->
                                                                              <tr>
                                                                                <td style="background-color: #06BBAF; color: white; padding: 25px 30px; text-align: center;">
                                                                                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Anambra 2025: Who Did the Voters Really Choose?</h3>
                                                                                </td>
                                                                              </tr>
                                                                              
                                                                              <!-- Body -->
                                                                              <tr>
                                                                                <td style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.7;">
                                                                                  
                                                                                  <p>Dear Citizen Monitors,</p>
                                                                    
                                                                                  <p><strong>Anambra has spoken at least on paper.</strong><br>
                                                                                  The incumbent has been returned in a landslide that doesn’t match the lived reality many describe.</p>
                                                                    
                                                                                  <p>Our small stream of field reports and what we all saw online tells a different story:</p>
                                                                                  <ul style="padding-left: 20px; line-height: 1.8;">
                                                                                    <li> Cash moving quietly,</li>
                                                                                    <li> Bags changing hands,</li>
                                                                                    <li> Subtle and not-so-subtle pressure around polling units.</li>
                                                                                  </ul>
                                                                    
                                                                                  <p><strong>The question that should haunt us is simple:</strong><br>
                                                                                  If hunger and fear were on the ballot, can we still call the outcome clean?</p>
                                                                    
                                                                                  <h4 style="color: #06BBAF; margin-top: 25px;">A calm election is not the same as a credible one.</h4>
                                                                                  <p>You can have orderly queues, working BVAS in some polling stations, neatly signed result sheets, no result sheets at others and still have a process where the real contest was who could buy despair the cheapest.</p>
                                                                    
                                                                                  <p>When a voter collects money because “there is no choice,” the ballot may be secret but the will is already broken. And when we accept this as normal, we are not just electing leaders; we are voting for the kind of country our children must survive in.</p>
                                                                    
                                                                                  <h4 style="color: #06BBAF; margin-top: 25px;">Anambra Is a Warning</h4>
                                                                                  <p>For Citizen Monitors, Anambra is not just a result it’s a warning.</p>
                                                                                  <p>We don’t yet have the scale of observers, uploads, and real-time evidence needed to confront this rot head-on. <strong>That must change before 2027.</strong></p>
                                                                    
                                                                                  <h4 style="color: #06BBAF; margin-top: 25px;">Turn Anger Into Resolve</h4>
                                                                                  <p>If this outcome makes you angry, good but don’t waste the anger. Turn it into resolve:</p>
                                                                                  <ul style="padding-left: 20px; line-height: 1.8;">
                                                                                    <li>✅ I will help document the truth.</li>
                                                                                    <li>✅ I will recruit others who will do the same.</li>
                                                                                  </ul>
                                                                    
                                                                                  <p>Anambra has shown how far we still have to go. What we do next will decide whether 2027 becomes just another market day or the moment Nigerians finally choose dignity over price.</p>
                                                                    
                                                                                  <p style="margin-top: 25px;"><strong>Citizen Monitors</strong><br>Guardians of Truth</p>
                                                                                  <p style="color: #06BBAF; margin-top: 10px;">📱 @CitizenMonitors (X / IG / FB / YouTube)</p>
                                                                    
                                                                                  <p style="margin-top: 20px; font-style: italic; color: #555;">Forward this newsletter. Call today. Nigeria is listening.</p>
                                                                                
                                                                                </td>
                                                                              </tr>
                                                                              
                                                                            </table>
                                                                          </td>
                                                                        </tr>
                                                                      </table>
                                                                      `,
                                                                      });
                                                                    export const newsLetterTemplateUpcoming = () =>
                                                                      baseTemplate({
                                                                        title: "Citizen Monitors Weekly Newsletter",
                                                                        message: `
                  <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
  <tr>
    <td>
      <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

        <!-- Header -->
        <tr>
          <td style="background-color: #06BBAF; color: #ffffff; padding: 20px 30px; text-align: center;">
            <h3 style="margin: 0; font-size: 22px; color: #ffffff;">
              Government Is Interested in Your Money
            </h3>
            <h4 style="margin: 5px 0 0; font-weight: normal; color: #ffffff;">
              Citizen Engagement Beyond Election Day
            </h4>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

            <p><strong>Dear Citizen Monitors,</strong></p>

            <p>
              Every day, government policies quietly reach into your pocket through taxes, levies, tariffs, service charges, and inflationary decisions.
            </p>

            <p>
              The truth is simple:
              <strong>government is deeply interested in your money.</strong>
            </p>

            <p>
              But here’s the more important question:
              <strong>how involved are you in governance?</strong>
            </p>

            <p>
              Too often, citizens engage only at election time.
              Yet the real decisions that shape our daily lives happen long after votes are counted in budgets, regulations, contracts, and enforcement practices.
              When citizens step back, accountability weakens.
              When citizens engage, governance improves.
            </p>

            <p>
              Being involved does not require holding public office.
              It starts with staying informed, asking questions,
              demanding transparency, and monitoring how public resources are used.
              It means paying attention to proposed laws,
              speaking up when policies are unjust,
              and supporting civic efforts that promote accountability.
            </p>

            <h4 style="color:#06BBAF; margin-top:25px;">
              Participation Is the Difference
            </h4>

            <p>
              At Citizen Monitors, we believe governance works best when citizens participate
              consistently not occasionally.
              From tracking public projects to questioning questionable policies,
              every action counts.
              Silence, on the other hand, is often interpreted as consent.
            </p>

            <h4 style="color:#06BBAF; margin-top:25px;">
              This Week’s Civic Challenge
            </h4>

            <ul style="padding-left:20px;">
              <li>Follow a public policy issue that affects you</li>
              <li>Ask your representative a direct question</li>
              <li>Share verified information with your community</li>
              <li>Support citizen-led accountability initiatives</li>
              <li>Help someone register on <a href="https://www.citizenmonitors.com" style="color:#06BBAF; text-decoration:none;">www.citizenmonitors.com</a></li>
            </ul>

            <p>
              Democracy does not thrive on apathy.
              It survives on participation.
            </p>

            <p>
              If government is interested in your money,
              you should be equally interested in how government is run.
            </p>

            <p>
              Stay engaged. Stay informed. Stay involved.
            </p>

            <p style="margin-top:25px;">
              <strong>With regards,</strong><br>
              <strong>Citizen Monitors</strong><br>
              Guardians of Truth
            </p>

            <p style="margin-top:10px;">
              📱 @CitizenMonitors (X / IG / FB / YouTube)
            </p>

          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>




                                                                      `,
                                                                      });

export const newsLetterTemplateETransmission = () =>
  baseTemplate({
    title: "Citizen Monitors Weekly Newsletter",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">E-Transmission or Manual Collation; which should supersede?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>As Nigeria prepares for future elections, a critical question remains: should manual collation continue alongside electronic transmission, or has the time come for one to clearly prevail especially in legal disputes?</p>

                  <p>This is often framed as a manual versus electronic debate. In truth, the real issue is <strong>data integrity</strong>. Electronic transmission was introduced to reduce human interference between polling units and final results, limiting manipulation and restoring trust.</p>

                  <p>The BVAS already has the capacity for electronic input and transmission of results. The challenge is not technology, but process. Manual collation still operates as a parallel and often dominant system, creating dangerous ambiguity. <strong>Where two systems coexist, the weaker one becomes the loophole.</strong></p>

                  <h4 style="color: #06BBAF; margin-top: 25px;">The Hard Truth About Electronic Transmission</h4>

                  <p>If results are manipulated at the source on Form EC8, the same false figures can be entered into BVAS and electronically transmitted, giving fraud a digital seal of legitimacy. This exposes a hard truth: <strong>electronic collation is only as credible as the data fed into it.</strong> When votes are cast, counted, and first recorded manually, technology merely conveys compromised data.</p>

                  <h4 style="color: #06BBAF; margin-top: 25px;">The Real Reform Question</h4>

                  <p>The real reform question, therefore, is not whether electronic transmission should replace manual collation, but whether manual data input should exist at all. If electronic transmission is adopted, it must supersede manual collation not merely accompany it. Otherwise, reform becomes performance.</p>

                  <p>Only electronic voting, where votes are captured directly at the point of casting, can truly secure electronic collation. A dual system creates the illusion of reform while preserving old vulnerabilities.</p>

                  <h4 style="color: #06BBAF; margin-top: 25px;">Democracy Cannot Be Protected by Half-Measures</h4>

                  <p>At Citizen Monitors, we believe democracy cannot be protected by half-measures. Nigerians deserve election results that are traceable, verifiable, and resistant to manipulation from origin to outcome.</p>

                  <p>The integrity of our elections depends on asking hard questions:</p>
                  <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>Who benefits from manual collation?</li>
                    <li>What role should it still play, if any?</li>
                    <li>And what does genuine reform truly require?</li>
                  </ul>

                  <p>Stay engaged. Stay informed. Demand integrity and clarity.</p>

                  <p style="margin-top: 25px;"><strong>With Regards,</strong><br>
                  <strong>Citizen Monitors</strong><br>
                  Guardians of Truth</p>

                  <p style="color: #06BBAF; margin-top: 10px;">📱 @CitizenMonitors (X / IG / FB / YouTube)</p>

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplateCitizensGetUp = () =>
  baseTemplate({
    title: "Citizens have to get up!",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Citizens have to get up!</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>There comes a moment in the life of every nation when silence becomes consent.</p>

                  <p><strong>Nigeria is at such a moment.</strong></p>

                  <p>For too long, we have outsourced responsibility. We complain in private, debate in groups, forward messages in frustration, yet retreat when it is time to act. We expect change to arrive through personalities, elections, or divine intervention, while we remain spectators in decisions that shape our daily lives.</p>

                  <p>But governance does not fear complaints. It responds to organized, informed, and consistent civic pressure.</p>

                  <p>If roads are collapsing, if policies are inconsistent, if public funds lack transparency, if leadership feels distant; the solution is not apathy. The solution is participation.</p>

                  <h4 style="color: #06BBAF; margin-top: 25px;">The people have to get up.</h4>

                  <p><strong>Get up intellectually</strong> — understand the laws being passed in your name.</p>
                  <p><strong>Get up socially</strong> — engage your community associations and civic platforms.</p>
                  <p><strong>Get up politically</strong> — hold representatives accountable beyond election season.</p>
                  <p><strong>Get up economically</strong> — demand clarity on how public resources are allocated and spent.</p>

                  <p>Democracy is not self-executing. It requires citizens who insist on standards.</p>

                  <p>The tragedy of many societies is not oppression alone, it is resignation. When citizens normalise dysfunction, institutions decay faster. But when citizens become deliberate, informed, and persistent; governance adjusts.</p>

                  <p>This is not a call for outrage. It is a call for responsibility.</p>

                  <p>The future will not be shaped only by those in office. It will be shaped by those who refuse to disengage.</p>

                  <p>The people have to get up; not in anger, but in awareness. Not in noise, but in discipline. Not once, but consistently.</p>

                  <p>And that work begins with you.</p>

                  <p>Stay engaged. Stay informed. Stay involved.</p>

                  <p style="margin-top: 25px;"><strong>With Regards,</strong><br>
                  <strong>Citizen Monitors.</strong><br>
                  Guardians of Truth.</p>

                  <p style="color: #06BBAF; margin-top: 10px;">📱 @CitizenMonitors (X / IG / FB/YouTube)</p>

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

const NEWSLETTER_SOCIAL_LINKS = {
  x: "https://x.com/citizenmonitors",
  instagram: "https://www.instagram.com/citizenmonitors",
  facebook: "https://www.facebook.com/citizenmonitors",
  youtube: "https://www.youtube.com/@citizenmonitors",
} as const;

const DEFAULT_NEWSLETTER_UNSUBSCRIBE_URL =
  "https://www.citizenmonitors.com/portal/settings/notifications";

const newsletterAnchorStyle =
  "color: #0066cc; text-decoration: underline; font-weight: 600;";

 export const getNewsletterUnsubscribeUrl = (unsubscribeLink?: string): string =>
  unsubscribeLink?.trim() ||
  process.env.NEWSLETTER_UNSUBSCRIBE_URL?.trim() ||
  DEFAULT_NEWSLETTER_UNSUBSCRIBE_URL;

export const newsletterPlainTextFooter = (unsubscribeLink?: string): string => {
  const link = getNewsletterUnsubscribeUrl(unsubscribeLink);
  const { x, instagram, facebook, youtube } = NEWSLETTER_SOCIAL_LINKS;

  return `
With Regards;
Citizen Monitors.
Guardians of Truth.

Follow @CitizenMonitors:
X: ${x}
Instagram: ${instagram}
Facebook: ${facebook}
YouTube: ${youtube}

You are receiving this email because you subscribed to Citizen Monitors updates.
Unsubscribe: ${link}
Or reply to this email with UNSUBSCRIBE.
`.trim();
};

export const newsletterFooterTemplate = (unsubscribeLink?: string) => {
  const link = getNewsletterUnsubscribeUrl(unsubscribeLink);
  const { x, instagram, facebook, youtube } = NEWSLETTER_SOCIAL_LINKS;

  return `
  <p style="margin-top: 25px;"><strong>With Regards;</strong><br>
  <strong>Citizen Monitors.</strong><br>
  <em>Guardians of Truth.</em></p>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 16px;">
    <tr>
      <td style="font-size: 15px; line-height: 1.9; color: #333333; font-family: Arial, sans-serif;">
        <strong style="color: #06BBAF;">Follow @CitizenMonitors</strong> —
        <a href="${x}" target="_blank" rel="noopener noreferrer" style="${newsletterAnchorStyle}">X</a> |
        <a href="${instagram}" target="_blank" rel="noopener noreferrer" style="${newsletterAnchorStyle}">Instagram</a> |
        <a href="${facebook}" target="_blank" rel="noopener noreferrer" style="${newsletterAnchorStyle}">Facebook</a> |
        <a href="${youtube}" target="_blank" rel="noopener noreferrer" style="${newsletterAnchorStyle}">YouTube</a>
      </td>
    </tr>
  </table>

  <p style="margin-top: 16px; font-size: 12px; line-height: 1.7; color: #666666; font-family: Arial, sans-serif;">
    You are receiving this email because you subscribed to Citizen Monitors updates.<br>
    <a href="${link}" target="_blank" rel="noopener noreferrer" style="${newsletterAnchorStyle}">Unsubscribe from newsletters</a>
    or reply to this email with <strong>UNSUBSCRIBE</strong>.
  </p>
`;
};


export const newsLetterTemplateAmendedElectoralAct = () =>
  baseTemplate({
    title: "Will Nigerians unite for credible 2027 elections?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Will Nigerians unite for credible 2027 elections?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>Nigeria’s 2027 General Elections will not be won in 2027. It will be decided by what Nigerians choose to do, starting now.</p>

                  <p>For years, the pattern has repeated itself: outrage, hope, participation… then fragmentation. The result? Elections that fall short of credibility, and a democracy that struggles to deliver. This cycle will not break on its own.</p>

                  <p>If credible elections are the goal, then coordinated citizen action must be the strategy. Not next year. Not during campaigns. Now.</p>

                  <p>Here is where the shift begins:</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">1. Secure Your Vote Early</h4>
                  <p>If you are not registered, nothing else matters. If your registration details are inaccurate, you are already at risk of disenfranchisement.</p>
                  <p><strong>Action:</strong> Complete your voter registration, confirm your polling unit, and ensure those around you do the same.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">2. Build Local Accountability Circles</h4>
                  <p>Credible elections are protected at the polling unit level; not on social media.</p>
                  <p><strong>Action:</strong> Form or join a small network (friends, estate, community) committed to covering specific polling units. Assign roles; mobilisation, monitoring, reporting.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">3. Track the Process, Not Just the Outcome</h4>
                  <p>Election Day is only the final stage. Manipulation often happens earlier through unclear guidelines or weak enforcement.</p>
                  <p><strong>Action:</strong> Follow electoral updates, question inconsistencies, and support organisations working on election transparency; like Citizen Monitors.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">4. Demand Verifiable Technology</h4>
                  <p>Technology without transparency is just digital opacity.</p>
                  <p><strong>Action:</strong> Advocate for systems that are auditable, with clear processes for result transmission and public verification.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">5. Reject Division as a Political Tool</h4>
                  <p>Ethnic and religious narratives are not accidental; they are strategic distractions.</p>
                  <p><strong>Action:</strong> Challenge divisive rhetoric. Prioritize competence, track record, and integrity in every political conversation.</p>

                  <p>The reality is this: institutions rarely exceed the expectations citizens consistently enforce. If Nigerians act in isolation, 2027 will follow a familiar script. If Nigerians act in coordination; with clarity, persistence, and shared standards, then credible elections move from possibility to probability.</p>

                  <p>This is not a call for optimism. It is a call for discipline. 2027 has already begun. What you do next will determine how it ends.</p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplateNigeriansOppositionSpearhead = () =>
  baseTemplate({
    title: "Citizen Monitors Weekly Newsletter",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Nigerians are the opposition; who is the spearhead?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>In every functioning democracy, the opposition plays a critical role: it questions, scrutinizes, and offers alternatives. But in Nigeria today, a pressing question confronts us, if Nigerians themselves have become the opposition, then who is the spearhead?</p>

                  <p>Across the country, citizens are increasingly stepping into roles traditionally occupied by political actors. From demanding accountability on social media, to organising grassroots movements, to tracking public spending and elections, Nigerians are no longer waiting to be represented, they are asserting themselves.</p>

                  <p>This shift is not accidental. It is a response to widening gaps:</p>
                  <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>Between campaign promises and governance outcomes</li>
                    <li>Between public resources and public welfare</li>
                    <li>Between leadership and accountability</li>
                  </ul>

                  <p>In this vacuum, citizens have emerged as the most consistent voice of opposition. But while this distributed resistance is powerful, it raises a strategic concern: can a movement without a clear spearhead sustain momentum and deliver systemic change?</p>

                  <p>History suggests that effective civic resistance often requires both:</p>
                  <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>Mass participation, and</li>
                    <li>Coordinated leadership or direction</li>
                  </ul>

                  <p>Without coordination, energy dissipates. Without credibility, leadership is rejected. Nigerians are therefore confronted with a delicate balance, how to organise without being co-opted, and how to lead without losing legitimacy.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">So, who should be the spearhead?</h4>
                  <p>Is it:</p>
                  <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>Credible civic organisations that can aggregate citizen voices?</li>
                    <li>Influential public thinkers and policy advocates?</li>
                    <li>A new generation of political actors emerging from civic spaces?</li>
                    <li>Or a decentralized model where leadership is situational and collective?</li>
                  </ul>

                  <p>There is no easy answer. But one thing is clear: the era of passive citizenship is over.</p>

                  <p>For meaningful change to occur, citizens must move from reaction to strategy, building structures that outlast moments, and influence that transcends platforms.</p>

                  <p>At Citizen Monitors, we believe the answer lies in informed, organised, and sustained civic engagement. Leadership must not only emerge, it must be accountable to the very citizens it represents.</p>

                  <p>As we reflect on this, we ask you: What does leadership look like in a citizen-led opposition? And what role will you play in shaping it?</p>

                  <p>The future of Nigeria's democracy may well depend on how we answer.</p>

                  <p><strong>The Citizen Monitors platform/app is the tool for all to start with.</strong></p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplateInecIndependence = () =>
  baseTemplate({
    title: "Is INEC still independent?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Is INEC still independent?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>As Nigeria gradually approaches the 2027 general elections, one question sits at the heart of our democracy: How independent is the Independent National Electoral Commission (INEC)?</p>

                  <p>Independence is not a ceremonial label, it is the backbone of electoral credibility. Without it, elections risk becoming procedural exercises rather than genuine expressions of the people's will.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">The Structural Question</h4>
                  <p>INEC's independence is, in theory, guaranteed by law. Yet, its leadership appointments, funding mechanisms, and operational pressures often raise legitimate concerns. When those who oversee elections are appointed by political actors, the perception (fair or not) of influence becomes unavoidable.</p>

                  <p>This is not merely about legality; it is about trust.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">The Operational Reality</h4>
                  <p>Beyond structure, independence must be reflected in action:</p>
                  <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>Can INEC enforce electoral laws without fear or favour?</li>
                    <li>Does it act decisively against malpractice, regardless of political affiliation?</li>
                    <li>Are its processes transparent enough to inspire public confidence?</li>
                  </ul>

                  <p>Recent electoral cycles have shown both improvements and setbacks. Technological innovations like BVAS have enhanced transparency, but inconsistencies in execution continue to erode trust.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">Why This Matters for 2027</h4>
                  <p>The stakes in 2027 will be significantly higher. A growing youth population, increased political awareness, and rising economic pressures mean citizens are paying closer attention than ever before.</p>

                  <p>If INEC is perceived as compromised:</p>
                  <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>Voter apathy may deepen</li>
                    <li>Electoral disputes may increase</li>
                    <li>Democratic legitimacy could weaken</li>
                  </ul>

                  <p>Conversely, a demonstrably independent INEC could:</p>
                  <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>Rebuild public trust</li>
                    <li>Strengthen democratic institutions</li>
                    <li>Reduce post-election tensions</li>
                  </ul>

                  <h4 style="color: #06BBAF; margin-top: 20px;">The Role of Citizens</h4>
                  <p>Independence is not sustained by institutions alone, it is defended by citizens.</p>

                  <p>This is where vigilance becomes critical. Citizens must;</p>
                  <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>Demand transparency in appointments and funding</li>
                    <li>Monitor electoral processes at every level</li>
                    <li>Hold INEC accountable through lawful civic engagement</li>
                  </ul>

                  <p>Democracy is not self-executing. It requires constant pressure from an informed and active citizenry.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">The Bottom Line</h4>
                  <p>INEC's independence ahead of 2027 is not a theoretical debate, it is a defining factor for Nigeria's democratic future.</p>

                  <p>The question is no longer whether INEC should be independent.</p>

                  <p><strong>The real question is: Will Nigerians insist that it is?</strong></p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplateInecChairmanAmupitanResign = () =>
  baseTemplate({
    title: "Should INEC Chairman, Prof. Joash Amupitan resign?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Should INEC Chairman, Prof. Joash Amupitan resign?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>This week's question is uncomfortable, but necessary. Should the INEC Chairman resign?</p>

                  <p>Elections are not just events. They are agreements. A contract between citizens and the system. When that contract is broken, the issue is not just about results, it is about legitimacy.</p>

                  <p>The Independent National Electoral Commission (INEC) carries the burden of public confidence. Once that confidence is compromised, leadership becomes less about authority and more about accountability.</p>

                  <p><strong>So, what does resignation represent in this context?</strong></p>

                  <p>For some, it is a symbolic reset, a signal that the institution acknowledges failure and is willing to rebuild credibility.</p>

                  <p>For others, it risks becoming a superficial solution, removing one individual without addressing deeper structural and systemic flaws within the electoral process.</p>

                  <p>Sometimes, resignation is not just about blame. It is about restoring faith. In democracies where institutions matter, accountability is not optional, it is expected. Leadership must not only be fair; it must be seen to be fair.</p>

                  <p>As Nigeria looks ahead to future elections, one question lingers: What action will genuinely rebuild trust in the system?</p>

                  <p>Because without trust, the process loses meaning. And when the process loses meaning, democracy itself is at risk.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">What can Citizens do?</h4>

                  <p><strong>Start with organised civic pressure.</strong> Fragmented outrage achieves little; coordinated advocacy does. Civil society groups, professional bodies, and citizen platforms should align messaging and demands; clear, specific, and sustained. Public trust is rebuilt not by noise, but by consistency.</p>

                  <p><strong>Next is legislative engagement.</strong> The National Assembly has oversight responsibility over INEC. Citizens can escalate pressure through petitions, public hearings, and direct engagement with representatives. Lawmakers respond when issues become politically costly to ignore.</p>

                  <p><strong>Then comes legal recourse.</strong> The courts remain a viable pathway. Strategic litigation, well-argued and evidence-based, can compel transparency or trigger institutional consequences.</p>

                  <p><strong>Equally critical is electoral vigilance.</strong> Groups like Yiaga Africa and Centre for Democracy and Development have shown that parallel vote tabulation and independent monitoring can constrain malpractice. This is where the Citizen Monitors platform comes in. Citizens should support, volunteer, download the Citizen Monitors app and digitally secure their polling units.</p>

                  <p><strong>Don't ignore information discipline.</strong> Disinformation thrives in moments like this. Citizens must rely on verified data, credible reports, and documented evidence, otherwise, legitimate concerns get diluted.</p>

                  <p><strong>Finally, let's prepare for the long game; reform.</strong> Whether or not INEC Chairman resigns, systemic fixes are non-negotiable, legal clarity on electronic transmission, transparent result management systems, and enforceable accountability mechanisms within INEC must be agitated for.</p>

                  <p>Resignation can be symbolic. Reform is structural. If the former doesn't happen, citizens must relentlessly pursue the latter.</p>

                  <p><strong>If the INEC Chairman refuses to resign, citizens must shift from who to what the office must answer for.</strong></p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplateInecForensicAudit = () =>
  baseTemplate({
    title: "INEC Forensic Audit; Real or Imagined?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">INEC Forensic Audit; Real or Imagined?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>In recent days, claims of a "forensic audit" by the Independent National Electoral Commission (INEC) have circulated widely, particularly in connection with alleged digital investigations of political actors' online activities. The question is simple, but consequential: is this audit real, or is it a narrative filling an information vacuum?</p>

                  <p>First, what would a genuine forensic audit entail? In electoral governance, a forensic audit is a structured, evidence-based review, typically involving digital forensics, data validation, and procedural compliance checks. It is not rumour-driven. It is documented, methodical, and crucially communicated through official channels.</p>

                  <p>So far, there has been no verifiable, formal disclosure from INEC about the auditing firm that conducted the exercise. That absence matters. Institutions like INEC operate within legal and procedural frameworks; actions of this magnitude do not occur in silence.</p>

                  <p>What we are likely witnessing is a familiar dynamic: speculation amplified by political tension. In a low-trust environment, silence breeds conjecture, and conjecture hardens into "fact" through repetition.</p>

                  <p>This raises a deeper issue, not just about whether an audit exists, but about institutional communication. When public confidence is fragile, ambiguity becomes costly. INEC's credibility depends not only on what it does, but on how clearly it communicates what it is doing.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">For citizens and observers, the discipline is straightforward:</h4>
                  <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>Separate verified statements from viral claims</li>
                    <li>Demand primary sources, not screenshots</li>
                    <li>Treat anonymous "insider" narratives with caution</li>
                  </ul>

                  <p>If a forensic audit was conducted, it should be formally acknowledged with specifics. Until then, the burden of proof remains unmet.</p>

                  <p>In the end, this is less about a single claim and more about a system under scrutiny. Trust in elections is not built on speculation. It is built on transparency, consistency, and verifiable truth.</p>

                  <p>We will continue to track developments and provide clarity as facts emerge.</p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplatePoliceBrutalityLeadershipOrInstitutional = () =>
  baseTemplate({
    title: "Police Brutality in Nigeria; Leadership or Institutional Failure?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Police Brutality in Nigeria; Leadership or Institutional Failure?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>Police brutality in Nigeria is no longer a peripheral concern, it is a defining test of governance, accountability, and the social contract between citizens and the state. The question we must confront is why it persists: is this primarily a failure of leadership, or a deeper institutional breakdown?</p>

                  <p>At first glance, leadership appears to be the obvious culprit. Political leaders set the tone for law enforcement culture. They appoint key officials, determine reform priorities, and signal, through action or silence, what behaviour is tolerated. When misconduct is met with delayed responses, opaque investigations, or outright denial, it sends a clear message down the chain of command: accountability is negotiable.</p>

                  <p>Yet, reducing police brutality to leadership failure alone risks oversimplifying a far more entrenched issue. The Nigerian policing system operates within structural constraints that have evolved over decades; underfunding, inadequate training, weak internal disciplinary mechanisms, and a culture that often prioritizes force over service. These are not problems that emerge overnight, nor are they solved by rhetoric alone.</p>

                  <p>Institutionally, there are critical gaps. Oversight bodies frequently lack independence or enforcement power. Complaint systems are either inaccessible or ineffective, leaving victims without meaningful recourse. Recruitment processes do not always emphasize psychological evaluation or community-oriented policing values. The result is a system where misconduct can occur with minimal risk of consequence.</p>

                  <p>However, institutions do not reform themselves. Leadership remains the catalyst, or barrier, to systemic change. Where leadership is decisive, reforms tend to follow: clearer use-of-force policies, transparent disciplinary procedures, investment in training, and the integration of technology such as body cameras. Where leadership is absent or complicit, institutional decay accelerates.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">So, which is it; leadership or institutional failure?</h4>

                  <p>In reality, the two are inseparable. Weak leadership allows institutional flaws to fester; fragile institutions, in turn, limit the effectiveness of even well-intentioned leaders. Addressing police brutality requires a dual approach: leadership that is willing to enforce accountability without hesitation, and institutional reform that embeds accountability into the system itself.</p>

                  <p>This is not merely a policing issue, it is a governance issue. It speaks to how power is exercised, how justice is administered, and how citizens are valued. Sustainable change will demand more than public outrage; it will require policy consistency, civic engagement, and a redefinition of policing as a service rather than a force.</p>

                  <p>The path forward is clear, even if it is not easy: reform leadership incentives, strengthen institutional safeguards, and centre the rights and dignity of citizens at every level of law enforcement.</p>

                  <p>Until then, the question will remain, not just unanswered, but unresolved.</p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplateNigerianVotersPartyOrPoliticianLoyalty = () =>
  baseTemplate({
    title: "Nigerian Voters; Loyal to Politicians or Political Parties?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Nigerian Voters; Loyal to Politicians or Political Parties?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>As Nigeria gradually inches toward another electoral cycle, one question continues to shape the nation's political reality: are Nigerian voters truly loyal to political parties, or are they simply loyal to powerful politicians?</p>

                  <p>In many established democracies, political parties are built on ideology, long-term policy direction, and institutional identity. Voters often align with parties because of shared beliefs on governance, economy, social values, or national priorities. But in Nigeria, the situation appears far more complicated.</p>

                  <p>Over the years, Nigerian politics has increasingly revolved around personalities rather than party structures. Politicians move freely from one party to another, often carrying their supporters along with them. What was once described as "cross carpeting" has now become almost a routine political strategy. Strikingly, many voters who once fiercely defended a party suddenly switch allegiance the moment their preferred political figure defects elsewhere.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">Do Nigerians vote for manifestos, or for familiar names?</h4>

                  <p>The evidence suggests that individuals often matter more than institutions. From local council elections to presidential contests, charismatic politicians with strong ethnic, regional, religious, or financial influence tend to overshadow party ideology. In many cases, voters are less concerned about what a political party represents and more interested in who is flying its flag.</p>

                  <p>This reality weakens democratic development.</p>

                  <p>When political parties become mere vehicles for personal ambition rather than institutions driven by ideas, accountability suffers. Ideology disappears. Internal democracy weakens. Long-term national planning becomes secondary to political survival. Elections then become popularity contests instead of serious debates about governance and policy.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">Yet, the blame cannot rest solely on politicians</h4>

                  <p>Nigerian parties themselves have struggled to build strong ideological identities. Most parties campaign on similar promises: security, jobs, infrastructure, and anti-corruption. Very few clearly define how their approach fundamentally differs from others. As a result, voters often find it difficult to develop genuine party loyalty rooted in ideas or policy convictions.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">Still, there are signs of political evolution</h4>

                  <p>The 2023 elections demonstrated that younger voters are beginning to pay closer attention to governance records, transparency, and competence. Social media conversations, civic engagement, and issue-based advocacy are slowly reshaping political participation. For many citizens, especially first-time voters, blind loyalty is gradually giving way to greater scrutiny.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">But the transition remains incomplete</h4>

                  <p>Nigeria's democracy cannot mature fully until political parties become stronger than individual politicians. Institutions must outlive personalities. Voters must demand consistency, ideology, and accountability rather than emotional attachment to political figures.</p>

                  <p>The future of Nigerian democracy may ultimately depend on whether citizens continue to follow politicians wherever they go, or begin to insist that parties stand for something beyond the ambitions of the men and women who lead them.</p>

                  <p>As always, the conversation continues as the Citizen Monitors App launches June 1st, 2026. We will keep you informed.</p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

  
export const newsLetterTemplate2027CanNigeriaBeSaved = () =>
  baseTemplate({
    title: "2027 Elections, can this Nigeria be Saved?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">2027 Elections, can this Nigeria be Saved?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>As Nigeria slowly marches toward the 2027 elections, one uncomfortable question hangs heavily in the air: Can this Nigeria still be saved?</p>

                  <p>Across the country, frustration is no longer hidden. From rising food prices to worsening insecurity, from youth unemployment to collapsing public trust in institutions, millions of Nigerians are asking whether elections still represent hope, or simply another cycle of disappointment.</p>

                  <p>For many citizens, the problem is no longer just about politicians. It is about a political culture that rewards loyalty over competence, propaganda over performance, and power over service. Every election season comes with promises of reform, yet ordinary Nigerians continue to battle the same hardships year after year.</p>

                  <p>The deeper concern is that citizens are gradually losing faith in the democratic process itself. When people no longer believe their votes matter, democracy becomes dangerously hollow.</p>

                  <p>But despite the anger and fatigue, Nigeria still stands at a crossroad, rather than a dead end.</p>

                  <p>The 2027 elections could become another recycling exercise of familiar faces and failed ideas. Or they could mark the beginning of a civic awakening driven by informed voters, stronger institutions, and issue-based politics.</p>

                  <p>The real battle may not be between political parties. It may be between apathy and participation.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">Can Nigeria be saved?</h4>

                  <p>Yes, but not by slogans. Not by ethnicity. Not by online outrage.</p>

                  <p>Nigeria can only be saved when citizens begin to demand accountability with consistency, reward competence over sentiment, and understand that democracy is not an event every four years, but a continuous responsibility.</p>

                  <p>The future of Nigeria may ultimately depend on whether Nigerians themselves still believe the country is worth fighting for.</p>

                  <p>As 2027 approaches, one thing is clear; the elections will not only determine who governs Nigeria. They may determine whether Nigerians still have faith in the idea of Nigeria itself.</p>

                  <p>Thank you for being a part of our community. Together, let's strive for a better Nigeria, as we draw closer to our 72-hour X space from 29th-31st of May, 2026; discussing "Credible 2027 Elections in Nigeria"; as a prelude to the launch of the Citizen Monitors App.</p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplatePartyPrimariesAndInsecurity = () =>
  baseTemplate({
    title: "The Politics of Party Primaries and Insecurity.",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">The Politics of Party Primaries and Insecurity.</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>Nigeria's political conversations are once again shifting toward party primaries, alliances, defections, endorsements, and power negotiations. Across the country, politicians are calculating their next moves, while citizens are left wondering whether governance itself has become secondary to electoral ambitions.</p>

                  <p>Amid the noise of political manoeuvring, what happens to national security when politics becomes the priority?</p>

                  <p>Insecurity is no longer a distant headline affecting "other people." It has become part of daily Nigerian life. Kidnappings, communal clashes, armed robberies, terrorism, cult violence, and attacks on communities continue to spread fear across both rural and urban areas. Citizens increasingly feel abandoned, while trust in institutions continues to weaken.</p>

                  <p>Yet, rather than presenting clear policy alternatives, many political actors appear more focused on controlling party structures than addressing the nation's security crisis. Internal party battles now dominate headlines more than solutions to insecurity. Regional calculations often overshadow national interest. And in some cases, insecurity itself becomes a political tool; exploited to mobilize fear, suppress participation, or discredit opponents.</p>

                  <p>Party primaries are supposed to strengthen democracy by allowing parties to present their best candidates. Instead, they often expose the weaknesses within our political system. Imposition of candidates, vote-buying and godfather politics continue to shape outcomes. When leadership selection lacks credibility, governance itself suffers.</p>

                  <p>The consequences are serious. Leaders who emerge from flawed political processes may feel more accountable to political sponsors than to ordinary Nigerians. Security appointments become political settlements. Law enforcement agencies are dragged into political disputes. Communities begin to interpret insecurity through ethnic or partisan lenses. Gradually, national unity weakens while distrust grows.</p>

                  <p>The danger is that Nigerians may become desensitized, accepting insecurity as normal while politicians continue campaigning as though the country is stable. But democracy cannot survive where citizens live in fear.</p>

                  <p>No election slogan can replace effective governance. No party convention can substitute for public safety. And no political coalition can succeed in the long term, if Nigerians continue to feel unsafe in their homes, schools, highways, and communities.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">As voters prepare for another round of political promises, we must demand more than speeches and propaganda. Nigerians must begin to ask tougher questions:</h4>
                  <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>What are the candidates' security strategies?</li>
                    <li>How will communities regain trust in government?</li>
                    <li>And most importantly, can politicians place national stability above political ambition?</li>
                  </ul>

                  <p>The politics of party primaries may determine who gets power, but insecurity will determine whether that power has meaning. Nigeria needs more responsible leadership.</p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplateCitizenMonitors72Hours = () =>
  baseTemplate({
    title: "Citizen Monitors 72 Hours; A Weekend of Civic Engagement and National Conversation.",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Citizen Monitors 72 Hours; A Weekend of Civic Engagement and National Conversation.</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>From Friday, May 29 to Sunday, May 31, 2026, the Citizen Monitors 72 Hours X Space demonstrated the power of citizens coming together to discuss the issues shaping Nigeria's future.</p>

                  <p>For seventy-two consecutive hours, participants from across Nigeria and the diaspora engaged in robust conversations on governance, elections, accountability, security, economic challenges, and citizen participation. What began as a digital conversation evolved into a vibrant civic forum where diverse voices exchanged ideas, challenged assumptions, and explored solutions to some of the country's most pressing concerns.</p>

                  <p>The success of the weekend was not measured merely by the number of speakers, listeners, or hours spent online. Its true achievement lay in the quality of engagement. Citizens, professionals, activists, public servants, political stakeholders, and ordinary Nigerians shared perspectives in an atmosphere that encouraged dialogue rather than division.</p>

                  <p>At a time when many citizens feel disconnected from political processes, Citizen Monitors 72 Hours conversation provided a platform where Nigerians all over the world, asked difficult questions, demanding accountability, and contributed meaningfully to discussions about the nation's future. The conversations reinforced a simple but powerful truth: democracy functions best when citizens remain informed, engaged, and willing to participate.</p>

                  <p>Under one theme, "Credible 2027 Elections," several topics emerged throughout the weekend. Participants highlighted the importance of strengthening democratic institutions ahead of the 2027 elections, improving transparency in governance, enhancing public trust in electoral processes, and promoting issue-based political engagement. There was also widespread agreement that citizens must move beyond periodic voting and embrace continuous civic participation.</p>

                  <p>The discussions further underscored the growing role of digital platforms in fostering civic education and public accountability. In an era where misinformation and political polarization often dominate public discourse, the Citizen Monitors 72 Hours X Space offered an opportunity for constructive engagement rooted in facts, experience, and shared national aspirations.</p>

                  <p>As the curtains closed at midnight Sunday, 31st of May, 2026, one message resonated clearly: the future of Nigeria cannot be left solely to politicians, institutions, or government agencies. It requires active citizens who are willing to stay informed, ask questions, monitor public affairs, and contribute to nation-building.</p>

                  <p>We extend our appreciation to every moderator, speaker, listener, partner, and supporter who made the May 29–31 edition a success. Your commitment demonstrates that civic engagement remains alive and that Nigerians continue to seek meaningful conversations about the future of their country.</p>

                  <p>The conversations may have ended for now, but the work of building a better Nigeria continues. The Citizen Monitors app drops today. Please download from Google Play store and App Store.</p>

                  <p style="margin-top: 20px; font-style: italic; color: #555555;">
                    Informing Citizens. Strengthening Democracy. Inspiring Accountability.
                  </p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplate72HoursDemocracyWhatNext = () =>
  baseTemplate({
    title: "72 Hours of Democracy, What Next?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">72 Hours of Democracy, What Next?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p><strong>What happens after the microphones are switched off?</strong></p>

                  <p>Democracy does not improve merely because conversations take place. It improves when conversations translate into action. The value of the Citizen Monitors' seventy-two-hour engagement will ultimately be measured not by the number of speakers, listeners, or trending moments; but by the impact it creates on public consciousness and civic participation.</p>

                  <p>Citizens have expressed concerns about the credibility of future elections, inability of citizens to register for permanent voters cards (PVC), the growing disconnect between political leaders and the people, worsening economic realities, insecurity, and the weakening of public trust in institutions. Yet there's also a recurring message of hope; that citizens still possess the power to influence outcomes when they organise, engage, and hold leaders accountable.</p>

                  <p>The challenge before Nigerians is to move from spectators to stakeholders. Democracy cannot be outsourced to politicians, electoral bodies, or civil society organisations alone. Every citizen has a role to play; whether by voting, demanding transparency, participating in community affairs, engaging elected representatives, or supporting reforms that strengthen institutions.</p>

                  <p>Citizen Monitors is committed to the beginning of a larger movement. The platform has demonstrated that there is an appetite for serious, issue-based political engagement. The next phase must focus on sustaining these conversations, translating recommendations into advocacy, monitoring government performance, and building a community of informed citizens committed to democratic accountability.</p>

                  <p>As Nigeria moves steadily towards the 2027 elections, the stakes could not be higher. The decisions made today will shape the quality of leadership, governance, and national development for years to come. The real test of democracy is not whether citizens can talk. It is whether they can remain engaged for months that follow.</p>

                  <p>The conversation has ended, but the work has just begun.</p>

                  <p>As we reflect on the successes and challenges faced during this initiative, we invite you to consider: <strong>What comes next?</strong></p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">Here are a few key insights:</h4>
                  <ol style="padding-left: 20px; line-height: 1.8;">
                    <li><strong>Sustaining Engagement:</strong> The momentum gained must not fade. We encourage all participants to stay involved in local governance and civic activities.</li>
                    <li><strong>Feedback Mechanisms:</strong> We are establishing channels for Citizen Monitors to share their experiences and suggestions for improvement. Your voices are crucial in shaping future initiatives that may include litigations.</li>
                    <li><strong>Upcoming Events:</strong> Stay tuned for workshops and forums designed to empower citizens with the tools needed to effect change in our communities as the Citizen Monitors App is launched.</li>
                  </ol>

                  <p>We look forward to your continued participation and insights as we strive to strengthen our democracy together.</p>

                  <p>Thank you for being an essential part of this journey!</p>

                  <p style="margin-top: 20px; font-style: italic; color: #555555;">
                    Informing Citizens. Strengthening Democracy. Inspiring Accountability.
                  </p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplateN210TrillionMissing = () =>
  baseTemplate({
    title: "Politics; Or Is N210 Trillion Really Missing?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Politics; Or Is N210 Trillion Really Missing?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>Nigeria never runs short of controversies. While citizens are grappling with inflation, insecurity, unemployment, and a cost-of-living crisis, the national conversation is about N210 trillion missing from NNPC.</p>

                  <p>The number is staggering. It is larger than Nigeria's annual budget several times over. It is a figure that, if true, raises serious questions about public finance, governance, and accountability. Unsurprisingly, political actors have seized the moment. Accusations are flying, defences are being mounted, and social media has become a battleground of claims and counterclaims. Beyond the politics lies a more important question. What exactly is missing?</p>

                  <p>Public debates in Nigeria often begin with sensational headlines and end without clarity. Figures are thrown around without sufficient explanation. Citizens are left confused, while politicians retreat into partisan camps. One side insists there has been monumental corruption; the other argues that accounting interpretations are being deliberately misrepresented for political gain. For ordinary Nigerians, however, the issue is not merely about who wins the political argument. The issue is trust.</p>

                  <p>Why can't Nigerian citizens trust government institutions to provide transparent accounts of public resources? Can't oversight institutions effectively perform their duties without political interference? Can't allegations involving public funds be investigated thoroughly and independently? Most importantly, why can't Nigerians receive clear explanations that go beyond political talking points?</p>

                  <p>Whether the disputed figure is N210 trillion, N21 trillion, or any other amount, citizens deserve facts, not propaganda. We deserve institutions that are strong enough to investigate allegations and transparent enough to communicate their findings. Democracy cannot function effectively when public confidence in government is constantly eroded.</p>

                  <p>Unfortunately, our political culture encourages spectacle over substance. Complex financial and governance issues are reduced to partisan slogans. Supporters of political parties defend or attack, based on loyalty rather than evidence. In the process, the truth often becomes secondary.</p>

                  <p>Nigeria's future depends not only on credible elections, but also on the strength of her institutions. A democracy where allegations of missing public funds cannot be independently verified or conclusively addressed, is a democracy vulnerable to cynicism and distrust.</p>

                  <p>As citizens, we must resist the temptation to view every controversy through a partisan lens. Instead, we should demand transparency, accountability, and evidence. The question is not whether our preferred politicians are right or wrong, but if the institutions responsible for safeguarding public resources are working as they should.</p>

                  <p>The debate over this N210 trillion will eventually fade from the headlines. Another controversy will replace it. The underlying challenge will remain: building a Nigeria where facts matter more than politics, and accountability matters more than loyalty.</p>

                  <p><strong>Until then, is it politics, or is N210 Trillion really missing?</strong></p>

                  <p style="margin-top: 20px; font-style: italic; color: #555555;">
                    Informing Citizens. Strengthening Democracy. Inspiring Accountability.
                  </p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });


  
export const newsLetterTemplateNigerianJudiciaryComeOutside = () =>
  baseTemplate({
    title: "Nigerian Judiciary, Come Outside.",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Nigerian Judiciary, Come Outside.</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>For every democracy to survive, citizens must trust that justice is predictable, impartial and rooted in law. Unfortunately, many Nigerians are increasingly confronted with a troubling reality: court judgments that appear to contradict one another, sometimes within days, leaving citizens wondering whether the law is guided by principle or by convenience.</p>

                  <p>One court delivers a judgment today. Another court, with coordinate jurisdiction, issues a different order tomorrow. Cases thought to be settled are suddenly reopened. Political office holders removed by one ruling, are restored by another. Party leadership disputes travel from one courtroom to the next, producing conflicting orders that leave Nigerians confused and institutions weakened.</p>

                  <p>This growing culture of judicial contradictions has consequences beyond legal technicalities. It damages public confidence. Investors become wary. Citizens lose faith in the rule of law. Political actors increasingly view courtrooms as extensions of political battlefields rather than temples of justice.</p>

                  <p>No democracy can function effectively when litigants shop for favourable courts, or when judges of equal jurisdiction issue orders that undermine one another. Justice should be based on established legal principles, not on which courtroom a litigant can reach first.</p>

                  <p>When the Executive branch buys vehicles for judges, builds houses for them, or dispenses favours that should ordinarily come from the judiciary's own budget, perceptions of indebtedness are created. Justice must not only be done; it must be seen to be done. A judge should never appear beholden to the same arm of government whose actions he or she may be called upon to review.</p>

                  <p>The judiciary remains the last hope of the common man. But hope itself depends on consistency and independence. Citizens may disagree with judgments, but they must never doubt that similar cases will be treated similarly and that the law speaks with one voice.</p>

                  <p>The National Judicial Council must continue to strengthen discipline and accountability within the Bench. Equally important, the constitutional guarantee of financial autonomy for the judiciary must be fully implemented. Their salaries, housing, transportation and working conditions should be provided institutionally, not through the generosity of governors, presidents, ministers or political office holders. Judges deserve decent welfare, but that welfare must come through transparent appropriations, not executive gifts that can compromise, or be perceived to compromise their impartiality.</p>

                  <p>Nigerians deserve a judiciary that inspires confidence, not confusion; certainty, not contradictions; independence, not dependence.</p>

                  <p>The courts are not merely buildings where cases are decided. They are the guardians of justice and the foundation upon which democracy rests.</p>

                  <p><strong>And so, Nigerian Judiciary, come outside. Who exactly is speaking for the law?</strong></p>

                  <p style="margin-top: 20px; font-style: italic; color: #555555;">
                    Promoting transparency, accountability and informed public discourse.
                  </p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });
  

export const newsLetterTemplateEkitiElectionFlaws2027 = () =>
  baseTemplate({
    title: "Ekiti Election Flaws; A Sign for 2027 Elections?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Ekiti Election Flaws; A Sign for 2027 Elections?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>The recently concluded Ekiti State governorship election was expected to reassure Nigerians that the country is making steady progress towards credible elections. Instead, it has raised difficult questions that deserve honest answers.</p>

                  <p>While election day was largely peaceful in many areas, reports of logistical delays, malfunctioning technology, poor communication, allegations of vote buying, and concerns over result management; have once again exposed familiar weaknesses in Nigeria's electoral process. These are not merely isolated incidents; they are warning signs that the country ignores at her peril.</p>

                  <p>The Ekiti election should not simply be viewed as a state election. It is a dress rehearsal for the 2027 general elections. If relatively smaller elections continue to experience avoidable operational failures, what confidence should Nigerians have when over ninety-three million voters head to the polls in 2027?</p>

                  <p>Every election presents an opportunity to strengthen democracy by identifying weaknesses and correcting them before they become national crises. Unfortunately, Nigeria has often treated election flaws as temporary inconveniences, rather than systemic problems requiring urgent reforms.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">Several questions now confront electoral stakeholders.</h4>
                  <ol style="padding-left: 22px; line-height: 1.9;">
                    <li>Are election officials receiving adequate training?</li>
                    <li>Is election technology being sufficiently tested before deployment?</li>
                    <li>Are security agencies effectively preventing voter intimidation and vote buying?</li>
                    <li>Are political parties committed to democratic competition or merely focused on winning at all costs?</li>
                    <li>Most importantly, are electoral institutions learning from previous elections?</li>
                  </ol>

                  <p><strong>The forthcoming Osun State elections will show if we learnt anything.</strong></p>

                  <p>Nigeria cannot afford another cycle where citizens celebrate peaceful voting only to lose confidence during collation and declaration of results. Electoral integrity is measured not only by what happens at polling units, but throughout the entire process, from voter registration to final declaration. This is why citizens must use the Citizen Monitors App for collating election results from their polling units, and remain engaged beyond election day.</p>

                  <p>Democracy cannot be outsourced to election officials alone. Civil Society Organisations, political parties, the media, security agencies, and ordinary Nigerians all have roles to play in protecting the integrity of elections.</p>

                  <p>Technology presents new opportunities. Digital tools for election observation, incident reporting, and independent verification, like the Citizen Monitors App, will improve transparency when deployed effectively. Citizen participation in documenting electoral processes has become increasingly important in strengthening public trust.</p>

                  <p>The Electoral Act provides a framework, but laws alone cannot guarantee credible elections. Institutions must demonstrate independence. Officials must uphold professionalism. Political actors must respect the rules. Citizens must insist on, and contribute to, accountability.</p>

                  <p>The lessons from Ekiti should trigger immediate reforms, not wait till after another disputed national election. Nigeria still has time before 2027, for deliberate action towards solving the Ekiti Election challenges.</p>

                  <p>Will Ekiti become another forgotten election with familiar excuses, or will it become the turning point that helps Nigeria deliver her most credible elections yet? The answer depends on what we choose to do now. Democracy works best when citizens do more than vote.</p>

                  <p style="margin-top: 20px; font-style: italic; color: #555555;">
                    Promoting transparency, accountability and informed public discourse.
                  </p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplateNigeriaReadyFor2027Elections = () =>
  baseTemplate({
    title: "How Ready is Nigeria for the 2027 Elections?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">How Ready is Nigeria for the 2027 Elections?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>Is Nigeria truly ready to conduct an election that Nigerians can trust? Every election cycle, we promise ourselves that the next one will be better. Yet, after every election, we are left with familiar complaints: vote buying, violence, voter suppression, delayed logistics, poor result management, weak enforcement of electoral laws, and endless court cases.</p>

                  <p><strong>Are the institutions responsible for delivering credible elections prepared?</strong></p>

                  <p>A credible election is not built on election day. It is built over months, and years; through planning, transparency, training, technology, adequate funding, and above all, public confidence.</p>

                  <p>Is the electoral umpire adequately prepared to manage one of Africa's largest elections? Are security agencies developing strategies that prioritise voter safety, rather than intimidation? Did political parties conduct transparent primaries? Are Nigerian courts ready to deliver timely justice without becoming the final destination for every electoral contest?</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">Then there is the question of technology.</h4>
                  <p>Technology has transformed elections around the world, but technology is only as effective as the integrity of those deploying it. Electronic accreditation, digital voter registers and electronic transmission of results can improve transparency, but cannot substitute for political will. Systems must be reliable, secure, and protected from manipulation.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">Another concern is voter participation.</h4>
                  <p>Millions of Nigerians, especially young people, have become disillusioned with the electoral process. Many believe their votes do not count. Restoring confidence will require more than public assurances. It demands visible reforms, accountability for electoral offences, and consistent transparency throughout the electoral process. Political parties also have a responsibility. If internal party democracy fails, the quality of leadership presented to Nigerians also suffers.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">Perhaps the greatest challenge remains the Nigerian citizen.</h4>
                  <p>Too often, citizens become active only during election campaigns and then disappear until the next cycle. Democracy requires continuous participation; asking questions, demanding accountability, verifying information, reporting violations, and insisting that institutions perform their constitutional duties.</p>

                  <p><strong>The responsibility of protecting democracy cannot be outsourced.</strong></p>

                  <p>This is where civic technology, like the Citizens Monitor App, and citizen participation become indispensable. Citizens equipped with the right tools can document incidents, monitor polling units, report irregularities, and strengthen public oversight. Transparency increases when ordinary Nigerians become active participants rather than passive observers.</p>

                  <p>The 2027 elections will not simply determine who occupies public office. They will test the resilience of Nigeria's democratic institutions, the independence of electoral management, the professionalism of security agencies, the maturity of political parties, and the vigilance of citizens. The question, therefore, is not whether Nigeria will conduct elections in 2027. It certainly will. We have budgeted for it. The real question is whether those elections will deepen democracy or further weaken public trust. The answer depends on what all of us do between now and election day.</p>

                  <p style="margin-top: 20px; font-style: italic; color: #555555;">
                    Promoting transparency, accountability and informed public discourse.
                  </p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplateNigeriaFakeAgenciesRealGovernment = () =>
  baseTemplate({
    title: "Nigeria: Fake Agencies, Real Government?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">Nigeria: Fake Agencies, Real Government?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>In recent weeks, Nigerians have watched an alarming trend unfold. Individuals with no legal authority establishing government agencies, appointed themselves officials, printed identity cards, opened offices, collected fees from unsuspecting citizens, and operated for months, sometimes years (and even be appropriated for in the national budget), before being exposed.</p>

                  <p><strong>How can fake institutions thrive in a country with real government institutions?</strong></p>

                  <p>This goes beyond fraud. It is a reflection of deeper governance challenges. When regulatory oversight is weak, enforcement agencies are reactive rather than proactive, and citizens are left without clear channels to verify information, impostors find fertile ground. Every fake agency that survives for months; is evidence that legitimate institutions are either absent, overwhelmed, or simply not paying enough attention.</p>

                  <p>The irony is striking. While ordinary Nigerians struggle with endless documentation, permits, taxes, and regulations from genuine government agencies, fraudulent operators are able to create parallel institutions with little resistance. It raises uncomfortable questions about coordination among security agencies, regulatory bodies, and public information systems.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">This is why citizen participation matters.</h4>
                  <p>Governance cannot be left to government alone. Citizens must actively question, verify, report, and demand accountability. Public vigilance is one of the strongest defence against fraud, corruption, and institutional failure.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">Technology now gives us the opportunity to do exactly that.</h4>
                  <p>We are pleased to announce that the <strong>Citizen Monitors App is now LIVE on Android</strong>.</p>
                  <p>The app enables citizens to document incidents, report governance concerns, monitor elections, and contribute credible, verifiable information that strengthens transparency and accountability across Nigeria. Democracy works best when citizens are informed and actively engaged; not just during elections, but every single day.</p>

                  <p>Whether it is election malpractice, abuse of office, public service failures, or suspicious activities affecting your community, your voice matters, and your evidence matters even more. The fight for accountability begins with participation. A stronger democracy emerges when citizens become active monitors.</p>

                  <p>Download the Citizen Monitors App today on your Android device and become part of a growing movement committed to protecting Nigeria's democracy, strengthening institutions, and ensuring that public office remains accountable to the people. And do tell everyone you know about the App. If all the Polling Units in Nigeria are manned by Citizen Monitors, the next elections, starting with the Osun gubernatorial, will be more credible.</p>

                  <p><strong>The future of Nigeria should never be left to fake institutions, nor passive citizens.</strong></p>

                  <p>Stay informed. Stay engaged. Stay accountable.</p>

                  <p style="margin-top: 20px; font-style: italic; color: #555555;">
                    Promoting transparency, accountability and informed public discourse.
                  </p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplateEfccVersusNigeriansAntiCorruptionOrAntiOpposition = () =>
  baseTemplate({
    title: "EFCC versus Nigerians; anti-corruption or anti-opposition?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">EFCC versus Nigerians; anti-corruption or anti-opposition?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>The Economic and Financial Crimes Commission (EFCC) was established with a clear mandate to investigate and prosecute economic and financial crimes without fear nor favour. It was meant to be Nigeria's foremost anti-corruption institution, restoring public confidence that no one is above the law.</p>

                  <p><strong>But increasingly, many Nigerians are asking:</strong></p>
                  <p>Is the EFCC fighting corruption, or fighting the opposition?</p>

                  <p>This question is not born out of sympathy for corruption. Far from it. Nigerians want corrupt public officials prosecuted, regardless of political affiliation. What concerns many citizens is the growing perception that the EFCC's actions are often loud against political opponents, but noticeably quieter when allegations involve those aligned with the government of the day.</p>

                  <p>History offers examples that fuel this perception. Politicians under investigation have often found their legal troubles disappear after defecting to the ruling party. Others become the subject of dramatic raids, televised arrests, and prolonged media trials, only for cases to drag on indefinitely or quietly fade away. Whether these outcomes are coincidental or not, the public perception has become increasingly difficult to ignore.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">The problem with selective justice</h4>
                  <p>The problem with selective justice is that it eventually ceases to be justice.</p>

                  <p>An anti-corruption agency derives its legitimacy not from the number of arrests it makes, but from the consistency with which it applies the law. If similar offences receive different treatments depending on political affiliations, public trust inevitably erodes.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">Independence matters ahead of elections</h4>
                  <p>This is particularly important as Nigeria approaches another election cycle. Institutions responsible for enforcing the law must remain demonstrably independent. The credibility of the EFCC matters not only in recovering stolen assets, but also in strengthening democracy. Citizens must believe that investigations are driven by evidence, not political calculations.</p>

                  <p>This is not to suggest that public officials under investigation should enjoy immunity. On the contrary: anyone accused of financial crimes should be investigated thoroughly and, where sufficient evidence exists, prosecuted diligently. The same standard should apply to everyone - government officials, opposition politicians, business leaders, and ordinary citizens.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">A fearless EFCC, not a partisan one</h4>
                  <p>The fight against corruption cannot succeed if it is seen as a weapon against political rivals. Once an institution acquires that reputation, every legitimate prosecution becomes open to suspicion, and genuine accountability becomes harder.</p>

                  <p>Nigeria needs a fearless EFCC; not a partisan one. The Commission owes its allegiance to the Constitution, not to any administration. Its success should be measured by fairness, professionalism, and the confidence it inspires among Nigerians.</p>

                  <p><strong>When the EFCC knocks on a politician's door, do Nigerians see justice at work, or politics in uniform?</strong></p>

                  <p>A credible democracy depends on institutions that are trusted by all, not feared by some and protected by others.</p>

                  <p style="margin-top: 20px; font-style: italic; color: #555555;">
                    Promoting transparency, accountability and informed public discourse.
                  </p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });

export const newsLetterTemplate2027ElectionsWhoIsBuyingYourVote = () =>
  baseTemplate({
    title: "2027 Elections; who is buying your vote and why?",
    message: `
      <table cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; padding: 20px 0;">
        <tr>
          <td>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #06BBAF; color: white; padding: 20px 30px; text-align: center;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">2027 Elections; who is buying your vote and why?</h3>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

                  <p><strong>Dear Citizen Monitors,</strong></p>

                  <p>Vote buying is no longer a rumour confined to election day. It has evolved into a sophisticated political strategy, disguised as "empowerment," "palliatives," "transport support," "thank-you packages," or outright cash inducements. The question every Nigerian should ask is why are politicians willing to pay for votes?</p>

                  <p><strong>The answer is simple; because your vote is valuable.</strong></p>

                  <p>A vote determines who controls public resources, who awards contracts, who appoints officials, who influences security, education, healthcare, infrastructure, and ultimately, who shapes the future of the nation. If a vote were worthless, no politician would spend billions of naira trying to obtain it.</p>

                  <p>When politicians purchase votes, they are not making an investment in the people; they are making an investment in power. Like any investor, they expect returns. Those returns often come through inflated contracts, abandoned projects, diversion of public funds, and governance that prioritises political survival over public service. The cost of vote buying is ultimately paid by citizens through poor roads, inadequate schools, underfunded hospitals, unreliable electricity, insecurity, and lost economic opportunities.</p>

                  <p>It is tempting to justify accepting money because of hardship. Many Nigerians face genuine economic challenges, and a few thousand naira can seem like immediate relief. Yet that short-term gain can translate into four years of diminished accountability. The value exchanged at polling units, is often far less than the value lost through ineffective governance.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">How vote buying weakens democracy</h4>
                  <p>Vote buying also weakens democracy in another critical way. It shifts political competition away from ideas, competence and integrity, and towards financial muscle. Candidates with the best policies may lose to those with the deepest pockets. Elections become transactions rather than expressions of the people's will.</p>

                  <h4 style="color: #06BBAF; margin-top: 20px;">This is why every citizen has a role to play.</h4>
                  <p>Ask candidates difficult questions. Demand to know their plans before accepting their promises. Report incidents of vote buying where it is safe to do so. Encourage conversations in your communities about the long-term consequences of selling votes. Above all, remember that your ballot is a public trust, not a commodity.</p>

                  <p>At Citizen Monitors, we believe that credible elections begin with informed citizens. Our mission is to equip Nigerians with the knowledge and tools needed to safeguard electoral integrity before, during and after election day.</p>
                  <p>The Citizen Monitors App empowers citizens to verify polling unit information, report electoral incidents, document irregularities with evidence, and contribute to greater transparency throughout the electoral process. Every verified report strengthens public accountability and helps protect the credibility of our elections.</p>

                  <p>As the countdown to 2027 continues, we ask; If someone is willing to buy your vote today, what do they expect to recover tomorrow? Democracy is strongest when citizens understand the true value of their vote and refuse to exchange it for temporary rewards.</p>

                  <p><strong>Your vote is your voice. Protect it. Use it wisely.</strong></p>

                  <p style="margin-top: 20px; font-style: italic; color: #555555;">
                    Promoting transparency, accountability and informed public discourse.
                  </p>

                  ${newsletterFooterTemplate()}

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
      `,
  });
