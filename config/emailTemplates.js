const baseTemplate = ({ message, buttonText, buttonLink, verifyCode }) => `
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
            © 2025 Citizen Monitors | 
            <a href="https://citizenmonitors.com" style="color:#1d72b8;text-decoration:none;" target="_blank">citizenmonitors.com</a>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;

// Forgot password email
  export const forgotPasswordTemplate = (resetLink) =>
    baseTemplate({
      title: "Reset Your Password for Your Citizen Monitors Account",
      message: `We received a request to reset the password for your Citizen Monitors account. If you made this request, you can reset your password securely by clicking the button below.`,
      buttonText: "Reset Password",
      buttonLink: resetLink,
    });
  
  // Registration welcome email
  export const registrationCode = (verificationCode) =>
    baseTemplate({
      title: "Welcome to Citizen Monitors - Verify Your Account",
      message: `Thank you for registering with <b>Citizen Monitors</b>. To complete your account setup, please use the verification code below:<br><br>`,
      verifyCode: verificationCode,
    });


 // Resend verification code email
export const resendCode = (verificationCode) =>
    baseTemplate({
      title: "Resend Verification Code - Citizen Monitors",
      message: `It seems you need another verification code to complete your account setup with <b>Citizen Monitors</b>. Please use the verification code below to verify your account:<br><br>`,
      verifyCode: verificationCode,
    });
  
    export const approveObserverTemplate = (firstName, pollingUnit) =>
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
  

        export const observerRoleUpdateTemplate = (firstName, pollingUnit) =>
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

            export const observerDowngradeTemplate = (firstName, pollingUnit, adminReason) =>
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

                export const observerRoleAvailableTemplate = (firstName, pollingUnit) =>
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

                    export const adminRoleInvitationTemplate = (firstName, role) =>
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

                        export const adminSuspensionTemplate = (firstName) =>
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

                            export const emailChangeNotificationTemplate = (newEmail) =>
                                baseTemplate({
                                  title: "Email Change Request - Citizen Monitors",
                                  message: `
                                    <p>You have requested to change your email address to <b>${newEmail}</b>.</p>
                                    <p>Please check <b>${newEmail}</b> for the verification code to confirm the change.</p>
                                    <p>If you did not make this request, please contact our support team immediately.</p>
                                  `,
                                });

                                export const emailVerificationCodeTemplate = (verificationCode) =>
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

                            
                                    export const resendVerificationCodeTemplate = (verificationCode) =>
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


                                        export const supportRequestTemplate = (firstName, lastName, email, phoneNumber, category, message) =>
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
                                          export const podcastNotificationTemplate = (title, content) =>
                                            baseTemplate({
                                              title: "New Podcast Notification - Citizen Monitors",
                                              message: `
                                                <p>You have a new podcast in your inbox.</p>
                                                <p><strong>Title:</strong> ${title}</p>
                                                <p><strong>Content Preview:</strong> ${content.slice(0, 50)}...</p>
                                                <p>Please log in to your account to view the full podcast.</p>
                                              `,
                                            });
                                            export const electionNotificationTemplate = (electionName, startDate, endDate) =>
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
                                                          

                                                            export const userActivitySummaryTemplate = ({ dateRange, login, signup, observer, volunteer, result, incident, flagged, volunteerToObserver, total }) =>
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
              Offline Mode to be Activated for Citizen Monitors App.
            </h3>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 30px; color: #000000; font-size: 18px; line-height: 1.7;">

            <p><strong>Dear Citizen Monitors,</strong></p>

            <p>
              One of the most consistent challenges citizen observers face during elections is unreliable
              connectivity. Weak networks, deliberate disruptions, or complete blackouts often occur precisely
              when evidence matters most.
            </p>

            <p>
              We have taken this reality seriously.
            </p>

            <p>
              We are pleased to announce that <strong>Offline Mode</strong> will be available when the
              Citizen Monitors app launches in <strong>June 2026</strong>.
              This feature ensures that citizen vigilance does not depend on network availability.
            </p>

            <h4 style="color:#06BBAF; margin-top:25px;">
              What Offline Mode Means
            </h4>

            <ul style="padding-left:20px;">
              <li>Citizen Monitors can capture photos, videos, notes, and incident reports without internet access.</li>
              <li>All entries are securely stored on the device.</li>
              <li>Once connectivity is restored, data syncs automatically to the central platform unaltered and time-stamped.</li>
            </ul>

            <p>
              This means that even if you cannot access the Citizen Monitors website,
              the downloaded app on your phone will still allow you to upload and store
              documentation until internet connectivity is restored.
            </p>

            <h4 style="color:#06BBAF; margin-top:25px;">
              Why This Matters
            </h4>

            <p>
              Election malpractice thrives in gaps - gaps in coverage, gaps in evidence,
              and gaps in reporting. Offline Mode closes one of the most critical gaps by
              ensuring that every polling unit can still be documented, even when systems
              fail or are deliberately compromised.
            </p>

            <p>
              This upgrade strengthens three core principles:
            </p>

            <ul style="padding-left:20px;">
              <li>Continuity of evidence</li>
              <li>Protection of citizen observers</li>
              <li>Integrity of post-election review and accountability</li>
            </ul>

            <h4 style="color:#06BBAF; margin-top:25px;">
              What Happens Next
            </h4>

            <p>
              Between now and June 2026, we will:
            </p>

            <ul style="padding-left:20px;">
              <li>Share feature previews and user guides</li>
              <li>Open limited testing with selected Citizen Monitors</li>
              <li>Release updated security and data-handling protocols</li>
            </ul>

            <p>
              We are building for the conditions we know exist
              not the conditions institutions pretend exist.
            </p>

            <p>
              <strong>When the network goes dark, accountability should not.</strong>
            </p>

            <p>
              Stay engaged. Stay ready.
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
