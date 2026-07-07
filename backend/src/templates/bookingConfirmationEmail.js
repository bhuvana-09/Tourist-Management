/**
 * Booking Confirmation Email HTML Template
 */
const buildBookingConfirmationHtml = ({ bookingId, packageName, guests, totalPrice, travelDate, userName }) => {
  const formattedDate = new Date(travelDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb; margin-top: 0;">Booking Confirmed! 🎉</h2>
      <p>Dear ${userName || 'Traveler'},</p>
      <p>Thank you for booking with us. We are pleased to confirm that your payment has been successfully verified and your booking status is now <strong>Confirmed</strong>.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e293b; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 40%;">Booking ID:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${bookingId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Package Name:</td>
            <td style="padding: 6px 0; color: #0f172a;">${packageName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Date of Travel:</td>
            <td style="padding: 6px 0; color: #0f172a;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Number of Guests:</td>
            <td style="padding: 6px 0; color: #0f172a;">${guests}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Total Paid:</td>
            <td style="padding: 6px 0; color: #22c55e; font-weight: bold;">$${totalPrice}</td>
          </tr>
        </table>
      </div>

      <p>If you have any questions or need to make adjustments, please contact our support team.</p>
      <p style="margin-bottom: 0;">Happy Travels,<br><strong>Tourist Management Portal Team</strong></p>
    </div>
  `;
};

module.exports = buildBookingConfirmationHtml;
