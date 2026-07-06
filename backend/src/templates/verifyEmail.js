const verifyEmailTemplate = (verificationUrl, userName) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #1e3a8a; text-align: center; margin-bottom: 24px;">Verify Your Email Address</h2>
      <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hello ${userName || 'User'},</p>
      <p style="font-size: 16px; color: #334155; line-height: 1.5;">Thank you for registering with the Tourist Management Portal. Please click the button below to verify your email address and activate your account:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Verify Email</a>
      </div>
      <p style="font-size: 14px; color: #64748b; line-height: 1.5;">Or copy and paste this link into your browser:</p>
      <p style="font-size: 14px; color: #2563eb; word-break: break-all; line-height: 1.5;">${verificationUrl}</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">If you did not create an account, you can safely ignore this email.</p>
    </div>
  `;
};

module.exports = verifyEmailTemplate;
