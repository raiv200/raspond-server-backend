function baseLayout({ title, preheader = '', body }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background-color: #3B82F6; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 40px 32px; }
    .content h2 { color: #1a1a2e; font-size: 22px; margin-top: 0; margin-bottom: 16px; }
    .content p { color: #4a5568; font-size: 15px; line-height: 1.7; margin-bottom: 16px; }
    .btn { display: inline-block; padding: 14px 32px; background-color: #3B82F6; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
    .info-box { background-color: #F0F4FF; border-left: 4px solid #3B82F6; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .info-box p { margin: 4px 0; color: #334155; font-size: 14px; }
    .footer { padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 4px 0; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .muted { color: #94a3b8; font-size: 13px; }
  </style>
  ${preheader ? `<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>Raspond</h1></div>
    <div class="content">${body}</div>
    <div class="footer">
      <p>Raspond — RFP Collaboration Platform</p>
      <p>You received this email because you have an account on Raspond.</p>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { baseLayout };
