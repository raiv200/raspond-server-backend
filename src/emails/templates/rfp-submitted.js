const { baseLayout } = require('../layouts/base');

function rfpSubmittedEmail({ userName, rfpTitle, company, orgName, totalTime, contributors, dashboardUrl }) {
  return {
    subject: `"${rfpTitle}" submitted to ${company || 'client'} 🚀 — Raspond`,
    html: baseLayout({
      title: 'RFP Submitted', preheader: `${rfpTitle} has been successfully submitted!`,
      body: `<h2>RFP Submitted! 🚀</h2>
        <p>Hi ${userName || 'there'},</p>
        <p><strong>"${rfpTitle}"</strong> has been submitted${company ? ` to <strong>${company}</strong>` : ''}.</p>
        <div class="info-box">
          <p><strong>RFP:</strong> ${rfpTitle}</p>
          ${company ? `<p><strong>Client:</strong> ${company}</p>` : ''}
          <p><strong>Organization:</strong> ${orgName}</p>
          ${totalTime ? `<p><strong>Total Time:</strong> ${totalTime} minutes</p>` : ''}
          ${contributors ? `<p><strong>Contributors:</strong> ${contributors} team members</p>` : ''}
        </div>
        <p style="text-align:center;margin:32px 0;"><a href="${dashboardUrl}" class="btn">Back to Dashboard</a></p>`,
    }),
  };
}
module.exports = { rfpSubmittedEmail };
