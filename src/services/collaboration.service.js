const jwt = require('jsonwebtoken');

function generateTipTapToken(userId, documentId) {
  const appId = process.env.TIPTAP_APP_ID;
  const secret = process.env.TIPTAP_APP_SECRET;
  if (!appId || !secret) return { enabled: false, message: 'TipTap Cloud not configured.' };

  const token = jwt.sign({ iat: Math.floor(Date.now() / 1000), allowedDocumentNames: [documentId] }, secret, { expiresIn: '24h' });
  return { enabled: true, token, appId };
}

function getCollabStatus() {
  const configured = !!(process.env.TIPTAP_APP_ID && process.env.TIPTAP_APP_SECRET);
  return { enabled: configured, provider: configured ? 'tiptap-cloud' : null };
}

module.exports = { generateTipTapToken, getCollabStatus };
