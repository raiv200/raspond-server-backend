const { baseLayout } = require('../layouts/base');

function orgInviteEmail({ inviterName, orgName, role, inviteUrl }) {
  return {
    subject: `You're invited to join ${orgName} on Raspond`,
    html: baseLayout({
      title: 'Organization Invite', preheader: `${inviterName} invited you to join ${orgName}.`,
      body: `<h2>You've been invited!</h2>
        <p><strong>${inviterName}</strong> invited you to join <strong>${orgName}</strong> as a <strong>${role.replace('_', ' ')}</strong>.</p>
        <div class="info-box">
          <p><strong>Organization:</strong> ${orgName}</p>
          <p><strong>Your Role:</strong> ${role.replace('_', ' ')}</p>
          <p><strong>Invited by:</strong> ${inviterName}</p>
        </div>
        <p style="text-align:center;margin:32px 0;"><a href="${inviteUrl}" class="btn">Accept Invitation</a></p>
        <p class="muted">This invitation expires in 7 days.</p>`,
    }),
  };
}
module.exports = { orgInviteEmail };
