const { baseLayout } = require('../layouts/base');

function changesRequestedEmail({ writerName, approverName, rfpTitle, sectionTitle, notes, rfpUrl }) {
  return {
    subject: `Changes requested on "${rfpTitle}" — Raspond`,
    html: baseLayout({
      title: 'Changes Requested', preheader: `${approverName} requested changes on your section.`,
      body: `<h2>Changes Requested</h2>
        <p>Hi ${writerName || 'there'},</p>
        <p><strong>${approverName}</strong> reviewed your section and requested changes:</p>
        <div class="info-box">
          <p><strong>RFP:</strong> ${rfpTitle}</p>
          <p><strong>Section:</strong> ${sectionTitle}</p>
        </div>
        ${notes ? `<div style="background-color:#FFF7ED;border-left:4px solid #F97316;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0;">
          <p style="margin:0;color:#9A3412;font-size:13px;font-weight:600;">Reviewer notes:</p>
          <p style="margin:8px 0 0;color:#431407;">${notes}</p>
        </div>` : ''}
        <p style="text-align:center;margin:32px 0;"><a href="${rfpUrl}" class="btn">Edit Section</a></p>`,
    }),
  };
}
module.exports = { changesRequestedEmail };
