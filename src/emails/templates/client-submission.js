const { baseLayout } = require('../layouts/base');

function clientSubmissionEmail({ rfpTitle, company, orgName, submitterName, submissionBody, exportUrl }) {
  return {
    subject: `RFP Submission: ${rfpTitle}${company ? ` for ${company}` : ''}`,
    html: baseLayout({
      title: 'RFP Submission', 
      preheader: `${orgName} has submitted their response to ${rfpTitle}.`,
      body: `<h2>RFP Response Submission</h2>
        <p>Hello,</p>
        <p>${orgName} has completed and submitted their response to your RFP${company ? ` for ${company}` : ''}.</p>
        
        <div class="info-box">
          <p><strong>RFP Title:</strong> ${rfpTitle}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
          <p><strong>Submitted by:</strong> ${submitterName} (${orgName})</p>
        </div>

        ${submissionBody ? `<div style="margin: 24px 0;">
          <p><strong>Message from ${orgName}:</strong></p>
          <div style="background: #f8f9fa; border-left: 3px solid #3B82F6; padding: 16px; margin: 12px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${submissionBody}</p>
          </div>
        </div>` : ''}

        <p style="text-align:center;margin:32px 0;">
          <a href="${exportUrl}" class="btn">View RFP Response</a>
        </p>
        
        <p class="muted">This RFP response was prepared using Raspond - RFP Collaboration Platform.</p>`,
    }),
  };
}

module.exports = { clientSubmissionEmail };
