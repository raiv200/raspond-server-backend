const { baseLayout } = require('../layouts/base');

function approvalRequestedEmail({ approverName, rfpTitle, sectionTitle, orgName, reviewUrl }) {
  return {
    subject: `Your approval is needed for "${rfpTitle}" — Raspond`,
    html: baseLayout({
      title: 'Approval Requested', preheader: `A section in ${rfpTitle} is ready for your review.`,
      body: `<h2>Approval Requested</h2>
        <p>Hi ${approverName || 'there'},</p>
        <p>A section has been submitted for your review:</p>
        <div class="info-box">
          <p><strong>RFP:</strong> ${rfpTitle}</p>
          ${sectionTitle ? `<p><strong>Section:</strong> ${sectionTitle}</p>` : '<p><strong>Scope:</strong> Entire document</p>'}
          <p><strong>Organization:</strong> ${orgName}</p>
        </div>
        <p style="text-align:center;margin:32px 0;"><a href="${reviewUrl}" class="btn">Review Now</a></p>`,
    }),
  };
}
module.exports = { approvalRequestedEmail };
