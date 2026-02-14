const { baseLayout } = require('../layouts/base');

function rfpAssignedEmail({ assigneeName, rfpTitle, sectionTitle, orgName, rfpUrl }) {
  return {
    subject: `You've been assigned to "${rfpTitle}" — Raspond`,
    html: baseLayout({
      title: 'RFP Assignment', preheader: `You've been assigned to write answers for "${sectionTitle}".`,
      body: `<h2>New RFP Assignment</h2>
        <p>Hi ${assigneeName || 'there'},</p>
        <p>You've been assigned as a <strong>writer</strong> for a section:</p>
        <div class="info-box">
          <p><strong>RFP:</strong> ${rfpTitle}</p>
          <p><strong>Section:</strong> ${sectionTitle}</p>
          <p><strong>Organization:</strong> ${orgName}</p>
        </div>
        <p style="text-align:center;margin:32px 0;"><a href="${rfpUrl}" class="btn">Open RFP</a></p>`,
    }),
  };
}
module.exports = { rfpAssignedEmail };
