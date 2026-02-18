const axios = require('axios');

const AI_URL = process.env.RASPOND_AI_URL || 'http://localhost:8000/api/v1';

async function ingestDocument(documentId, s3Url, orgId, workspaceId) {
  try {
    const response = await axios.post(`${AI_URL}/ingest-url`, {
      s3_url: s3Url,
      document_id: documentId,
      org_id: orgId,
      workspace_id: workspaceId || null,
    });
    return response.data;
  } catch (error) {
    console.error('AI Service Error:', error?.message || error);
    throw new Error('Failed to trigger AI ingestion');
  }
}

module.exports = { ingestDocument };
