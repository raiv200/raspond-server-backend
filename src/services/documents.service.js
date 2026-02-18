const prisma = require('../config/database');
const { uploadFile } = require('./s3.service');
const { ingestDocument } = require('./ai.service');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

const AI_LOG = path.join(process.cwd(), 'ai-trigger.log');

async function processDocumentUpload(file, orgId, userId, workspaceId) {
  // 1. Upload to S3
  const timestamp = Date.now();
  const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${orgId}/${timestamp}_${safeFilename}`;
  const s3Url = await uploadFile(file.path, key, file.mimetype);

  // 2. Create DB record
  const docId = randomUUID();
  const fileType = file.originalname.split('.').pop()?.toLowerCase() || 'unknown';

  const doc = await prisma.documents.create({
    data: {
      id: docId,
      org_id: orgId,
      filename: file.originalname,
      file_type: fileType,
      s3_url: s3Url,
      workspace_id: workspaceId || null,
      created_by: userId || null,
      status: 'UPLOADED',
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  // 3. Trigger AI ingestion (non-blocking on failure)
  try {
    fs.appendFileSync(
      AI_LOG,
      `[${new Date().toISOString()}] Triggering AI for doc ${docId}, s3: ${s3Url}\n`
    );
    const result = await ingestDocument(docId, s3Url, orgId, workspaceId);
    fs.appendFileSync(
      AI_LOG,
      `[${new Date().toISOString()}] AI triggered: ${JSON.stringify(result)}\n`
    );
    console.log(`AI ingestion triggered successfully for doc ${docId}`);
  } catch (error) {
    fs.appendFileSync(
      AI_LOG,
      `[${new Date().toISOString()}] AI trigger failed: ${error?.message || error}\n`
    );
    console.error('Failed to trigger AI ingestion:', error?.message || error);
  }

  // 4. Cleanup temp file
  if (file.path && fs.existsSync(file.path)) {
    try { fs.unlinkSync(file.path); } catch (e) { console.warn('Failed to delete temp file:', e); }
  }

  return doc;
}

async function getDocumentsByOrgId(orgId) {
  return prisma.documents.findMany({
    where: { org_id: orgId },
    orderBy: { created_at: 'desc' },
  });
}

async function getDocumentTags(documentId) {
  const docTags = await prisma.document_tags.findMany({
    where: { documentId },
    include: { tag: true },
  });
  return docTags.map((dt) => ({
    id: dt.tag.id,
    header: dt.tag.header,
    subheader: dt.tag.subheader,
    orgId: dt.tag.orgId,
  }));
}

module.exports = { processDocumentUpload, getDocumentsByOrgId, getDocumentTags };
