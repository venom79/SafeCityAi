export const sendResetEmail = async (email, link) => {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          email: process.env.EMAIL_FROM,
          name: "SafeCity AI"
        },
        to: [{ email }],
        subject: "Reset Your Password",
        htmlContent: `
          <div style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
            
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
              <tr>
                <td align="center">

                  <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                    
                    <!-- HEADER -->
                    <tr>
                      <td style="background:#000000;padding:20px;text-align:center;">
                        <h2 style="color:#ffffff;margin:0;font-size:22px;">
                          SafeCityAI
                        </h2>
                      </td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                      <td style="padding:30px;color:#333;">
                        
                        <h3 style="margin-top:0;">Reset Your Password</h3>

                        <p style="font-size:14px;line-height:1.6;">
                          We received a request to reset your password. Click the button below to set a new password.
                        </p>

                        <!-- BUTTON -->
                        <div style="text-align:center;margin:30px 0;">
                          <a href="${link}" 
                            style="
                              background:#000000;
                              color:#ffffff;
                              text-decoration:none;
                              padding:12px 24px;
                              border-radius:6px;
                              font-weight:bold;
                              display:inline-block;
                            ">
                            Reset Password
                          </a>
                        </div>

                        <p style="font-size:13px;color:#555;">
                          This link will expire in <strong>15 minutes</strong>.
                        </p>

                        <p style="font-size:13px;color:#555;">
                          If you did not request a password reset, you can safely ignore this email.
                        </p>

                      </td>
                    </tr>

                    <!-- DIVIDER -->
                    <tr>
                      <td style="border-top:1px solid #eee;"></td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                      <td style="padding:20px;text-align:center;font-size:12px;color:#888;">
                        
                        <p style="margin:5px 0;">
                          © ${new Date().getFullYear()} SafeCityAI. All rights reserved.
                        </p>

                        <p style="margin:5px 0;">
                          This is an automated security email. Do not reply.
                        </p>

                        <p style="margin:5px 0;">
                          If this wasn’t you, your account is still secure and no changes have been made.
                        </p>

                      </td>
                    </tr>

                  </table>

                </td>
              </tr>
            </table>

          </div>
        `
      })
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(error)
    }

  } catch (err) {
    console.error("Email send failed:", err)
    throw err
  }
}