const resetPasswordEmailTemplate = (resetUrl, userName) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #1e3a8a; text-align: center; margin-bottom: 24px;">Reset Your Password</h2>
      <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hello ${userName || 'User'},</p>
      <p style="font-size: 16px; color: #334155; line-height: 1.5;">We received a request to reset your password for the Tourist Management Portal. Please click the button below to set a new password. This link will expire in 15 minutes:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #64748b; line-height: 1.5;">Or copy and paste this link into your browser:</p>
      <p style="font-size: 14px; color: #ef4444; word-break: break-all; line-height: 1.5;">${resetUrl}</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `;
};

module.exports = resetPasswordEmailTemplate;
