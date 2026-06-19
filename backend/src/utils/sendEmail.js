/**
 * Send an email via Brevo API. Errors are logged but not thrown
 * so that email failure doesn't crash the auth flow.
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(`[Email] Sending to: ${to}, subject: "${subject}"`);
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'AuthApp', email: process.env.BREVO_FROM_EMAIL },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
        console.error('[Email] Brevo error:', JSON.stringify(data));
    } else {
        console.log('[Email] Sent successfully:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('[Email] Send error:', err.message);
  }
};

// ─── Email Templates ────────────────────────────────────────────────────────

const sendOtpEmail = (to, otp) =>
  sendEmail({
    to,
    subject: 'Your verification code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #E5E7EB;border-radius:12px">
        <h2 style="color:#111827;margin-bottom:8px">Email Verification</h2>
        <p style="color:#6B7280">Use the code below to verify your email address.</p>
        <div style="font-size:40px;font-weight:700;letter-spacing:8px;color:#4F46E5;text-align:center;padding:24px 0">${otp}</div>
        <p style="color:#6B7280;font-size:14px">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>`,
  });

const sendPasswordResetEmail = (to, deepLink, webLink) =>
  sendEmail({
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #E5E7EB;border-radius:12px">
        <h2 style="color:#111827;margin-bottom:8px">Password Reset</h2>
        <p style="color:#6B7280">Click the button below to reset your password. This link is valid for <strong>15 minutes</strong>.</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${deepLink}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
        </div>
        <p style="color:#9CA3AF;font-size:12px">If the button doesn't work, copy this link:<br/><a href="${webLink}">${webLink}</a></p>
        <p style="color:#9CA3AF;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>`,
  });

module.exports = { sendEmail, sendOtpEmail, sendPasswordResetEmail };
