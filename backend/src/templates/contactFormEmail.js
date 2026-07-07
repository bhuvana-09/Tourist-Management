/**
 * Contact Form Email HTML Template
 */
const buildContactFormHtml = ({ name, email, message }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #1e3a8a; margin-top: 0;">New Contact Form Submission ✉️</h2>
      <p>Hello Admin,</p>
      <p>A new visitor has submitted the contact form on the Tourist Management Portal. Here are the details:</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
        <h3 style="margin-top: 0; color: #1e293b; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Submission Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 30%;">Name:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Email:</td>
            <td style="padding: 6px 0; color: #0f172a;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Message:</td>
            <td style="padding: 6px 0; color: #0f172a; white-space: pre-wrap; line-height: 1.5;">${message}</td>
          </tr>
        </table>
      </div>

      <p style="margin-bottom: 0; color: #64748b; font-size: 12px;">This email was sent automatically from the Tourist Management Portal contact form.</p>
    </div>
  `;
};

module.exports = buildContactFormHtml;
