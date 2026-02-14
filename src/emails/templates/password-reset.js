const { baseLayout } = require('../layouts/base');

function passwordResetEmail({ name, resetUrl }) {
  return {
    subject: 'Reset your password — Raspond',
    html: baseLayout({
      title: 'Reset Your Password', preheader: 'You requested a password reset.',
      body: `<h2>Reset your password</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Click the button below to set a new password.</p>
        <p style="text-align:center;margin:32px 0;"><a href="${resetUrl}" class="btn">Reset Password</a></p>
        <p class="muted">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        <hr class="divider">
        <p class="muted">Direct link: ${resetUrl}</p>`,
    }),
  };
}
module.exports = { passwordResetEmail };
