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
             
       <img src="https://citizenmonitors.com/assets/svgviewer-png-output.png" alt="svgviewer-png-output.png" width="150" height="50">
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

                                        