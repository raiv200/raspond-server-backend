const { baseLayout } = require('../layouts/base');

function verifyEmailTemplate({ name, otp }) {
  return {
    subject: `${otp} is your Raspond verification code`,
    html: baseLayout({
      title: 'Verify Your Email', preheader: `Your verification code is ${otp}`,
      body: `<h2>Verify your email</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Enter the following code to verify your email address:</p>
        <div style="text-align:center;margin:32px 0;">
          <div style="display:inline-block;background-color:#F0F4FF;border:2px dashed #3B82F6;border-radius:12px;padding:20px 40px;">
            <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1a1a2e;font-family:monospace;">${otp}</span>
          </div>
        </div>
        <p style="text-align:center;color:#64748B;font-size:14px;">This code expires in <strong>10 minutes</strong>.</p>
        <hr class="divider">
        <p class="muted">If you didn't create an account, you can safely ignore this email.</p>`,
    }),
  };
}
module.exports = { verifyEmailTemplate };
