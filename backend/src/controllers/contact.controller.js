/**
 * Contact Controller:
 * 
 * Stateless Forwarding Architecture Choice:
 * Rather than writing contact form submissions to a MongoDB collection and building a full
 * database-backed ticketing dashboard panel, this controller operates as a lightweight,
 * stateless forwarder. Submissions are validated, formatted into an email template, and dispatched
 * directly to the admin's CONTACT_EMAIL inbox using the existing Nodemailer transporter setup.
 * 
 * This design is highly appropriate because:
 *   1. It avoids database storage bloat for transient support requests.
 *   2. Admins can manage conversations directly using standard email threads.
 *   3. It remains simple, clean, and fast with minimal architectural overhead.
 */

const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/email');
const buildContactFormHtml = require('../templates/contactFormEmail');

// @desc    Submit contact form (Stateless Email forward)
// @route   POST /api/contact
// @access  Public
const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  // Basic Validation
  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Please fill in all required fields (name, email, and message)');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  // Retrieve contact target address from environment variable
  const adminEmail = process.env.CONTACT_EMAIL || 'admin@touristportal.com';

  // Build template and dispatch email
  try {
    const html = buildContactFormHtml({ name, email, message });
    await sendEmail({
      to: adminEmail,
      subject: `New Portal Support Request from ${name}`,
      html
    });

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you shortly!'
    });
  } catch (err) {
    console.error('Contact email dispatch failed:', err.message);
    res.status(500);
    throw new Error('Failed to send message. Please try again later.');
  }
});

module.exports = {
  submitContactForm
};
