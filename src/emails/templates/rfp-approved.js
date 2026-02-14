const { baseLayout } = require('../layouts/base');

function rfpApprovedEmail({ userName, rfpTitle, orgName, exportUrl }) {
  return {
    subject: `"${rfpTitle}" is fully approved! 🎉 — Raspond`,
    html: baseLayout({
      title: 'RFP Approved', preheader: `All approvers have signed off on ${rfpTitle}.`,
      body: `<h2>RFP Approved! ✅</h2>
        <p>Hi ${userName || 'there'},</p>
        <p><strong>"${rfpTitle}"</strong> has been fully approved!</p>
        <div class="info-box">
          <p><strong>RFP:</strong> ${rfpTitle}</p>
          <p><strong>Organization:</strong> ${orgName}</p>
          <p><strong>Status:</strong> Ready for export</p>
        </div>
        <p style="text-align:center;margin:32px 0;"><a href="${exportUrl}" class="btn">Export & Submit</a></p>`,
    }),
  };
}
module.exports = { rfpApprovedEmail };
