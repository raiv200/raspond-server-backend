const resend = require('../config/resend');
const { welcomeEmail } = require('../emails/templates/welcome');
const { verifyEmailTemplate } = require('../emails/templates/verify-email');
const { passwordResetEmail } = require('../emails/templates/password-reset');
const { orgInviteEmail } = require('../emails/templates/org-invite');
const { rfpAssignedEmail } = require('../emails/templates/rfp-assigned');
const { approvalRequestedEmail } = require('../emails/templates/approval-requested');
const { changesRequestedEmail } = require('../emails/templates/changes-requested');
const { rfpApprovedEmail } = require('../emails/templates/rfp-approved');
const { rfpSubmittedEmail } = require('../emails/templates/rfp-submitted');
const { clientSubmissionEmail } = require('../emails/templates/client-submission');

async function sendEmail(to, { subject, html }) {
  if (!resend) {
    console.log('📧 [Email Preview] To:', to, '| Subject:', subject);
    return { success: true, preview: true };
  }
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject, html,
    });
    console.log('📧 Email sent to:', to);
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error('📧 Email failed:', err.message);
    return { success: false, error: err.message };
  }
}

async function sendWelcome(to, data) { const t = welcomeEmail(data); return sendEmail(to, t); }
async function sendVerifyEmail(to, data) { const t = verifyEmailTemplate(data); return sendEmail(to, t); }
async function sendPasswordReset(to, data) { const t = passwordResetEmail(data); return sendEmail(to, t); }
async function sendOrgInvite(to, data) { const t = orgInviteEmail(data); return sendEmail(to, t); }
async function sendRfpAssigned(to, data) { const t = rfpAssignedEmail(data); return sendEmail(to, t); }
async function sendApprovalRequested(to, data) { const t = approvalRequestedEmail(data); return sendEmail(to, t); }
async function sendChangesRequested(to, data) { const t = changesRequestedEmail(data); return sendEmail(to, t); }
async function sendRfpApproved(to, data) { const t = rfpApprovedEmail(data); return sendEmail(to, t); }
async function sendRfpSubmitted(to, data) { const t = rfpSubmittedEmail(data); return sendEmail(to, t); }
async function sendClientSubmission(to, data) { const t = clientSubmissionEmail(data); return sendEmail(to, t); }

module.exports = { sendWelcome, sendVerifyEmail, sendPasswordReset, sendOrgInvite, sendRfpAssigned, sendApprovalRequested, sendChangesRequested, sendRfpApproved, sendRfpSubmitted, sendClientSubmission };
