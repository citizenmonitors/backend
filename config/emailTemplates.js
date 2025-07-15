const baseTemplate = ({
    message,
    buttonText,
    buttonLink,
    verifyCode,
  }) => `
  <div style="font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 10pt">
    <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;padding:20px">
      <tr><td align="center">
        <table width="600" style="background:#fff;padding:20px;border-radius:4px">
          <tr>
            <td align="center" style="padding-bottom:20px">
             
       <img src="https://www.citizenmonitors.com/assets/citizen-monitors-logo.png" alt="citizen-monitors-logo" width="150" height="50">
        </td>
          </tr>
    
          <tr>
            <td style="font-size:16px;color:#555;padding-bottom:20px">
              ${message}
            </td>
          </tr>
          ${
            verifyCode
              ? `<tr><td align="center" style="padding-bottom:30px;">
                  <strong style="background-color:#06bbaf;color:#fff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:16px;display:inline-block">
                   ${verifyCode}</strong>
                </td></tr>`
              : ""
          }
          ${
            buttonText && buttonLink
              ? `<tr><td align="center" style="padding-bottom:30px">
                  <a href="${buttonLink}" style="background-color:#06bbaf;color:#fff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:16px;display:inline-block" target="_blank">
                    ${buttonText}
                  </a>
                </td></tr>`
              : ""
          }
          <tr>
            <td style="font-size:13px;color:#888;border-top:1px solid #e0e0e0;padding-top:20px;text-align:center">
              © 2025 Citizen Monitors | 
              <a href="https://citizenmonitors.com" style="color:#1d72b8;text-decoration:none" target="_blank">citizenmonitors.com</a>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </div>
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

                                        
                                        