const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

/**
 * Generate a TipTap Cloud JWT token for a user to access all question
 * documents inside an RFP.
 *
 * Token includes allowedDocumentNames for every question in the RFP,
 * so the user can switch questions without requesting a new token.
 *
 * Document naming convention: rfp-{rfpId}-question-{questionId}
 */
async function generateTipTapToken(userId, rfpId) {
  const appId = process.env.TIPTAP_APP_ID;
  const secret = process.env.TIPTAP_APP_SECRET;

  if (!appId || !secret) {
    return { enabled: false, message: 'TipTap Cloud not configured.' };
  }

  // Verify user has access to this RFP
  const rfp = await prisma.rfp.findUnique({
    where: { id: rfpId },
    include: {
      members: { where: { userId }, take: 1 },
      sections: {
        include: {
          questions: { select: { id: true } },
        },
      },
    },
  });

  if (!rfp) {
    throw Object.assign(new Error('RFP not found'), { statusCode: 404 });
  }

  // Check access: user is creator OR is an RFP member
  const hasAccess = rfp.createdById === userId || rfp.members.length > 0;
  if (!hasAccess) {
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  }

  // Build list of all document names the user can access
  const allowedDocumentNames = rfp.sections
    .flatMap((s) => s.questions)
    .map((q) => `rfp-${rfpId}-question-${q.id}`);

  // Create TipTap JWT with proper claims
  // Reference: https://tiptap.dev/docs/collaboration/getting-started/authenticate
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    nbf: now,
    exp: now + 86400, // 24 hours
    iss: 'https://cloud.tiptap.dev',
    aud: appId,
    allowedDocumentNames,
  };

  const token = jwt.sign(payload, secret, { algorithm: 'HS256' });

  // Fetch user details for the response
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, color: true },
  });

  return {
    token,
    appId,
    documentNames: allowedDocumentNames,
    user: {
      id: user.id,
      name: user.name,
      color: user.color,
    },
  };
}

function getCollabStatus() {
  const configured = !!(process.env.TIPTAP_APP_ID && process.env.TIPTAP_APP_SECRET);
  return { enabled: configured, provider: configured ? 'tiptap-cloud' : null };
}

module.exports = { generateTipTapToken, getCollabStatus };