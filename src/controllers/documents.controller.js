const documentsService = require('../services/documents.service');
const { notificationService } = require('../services/notification.service');
const { success, created, badRequest } = require('../utils/response');

async function streamProgress(req, res, next) {
  const documentId = req.params.id;
  console.log(`[SSE] Client connecting for document: ${documentId}`);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  await notificationService.subscribe(documentId, sendUpdate);
  sendUpdate({ message: 'Connected to progress stream', status: 'connected' });

  req.on('close', () => {
    console.log(`[SSE] Client disconnected for document: ${documentId}`);
    notificationService.unsubscribe(documentId, sendUpdate);
    res.end();
  });
}

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) return badRequest(res, 'No file uploaded');
    const doc = await documentsService.processDocumentUpload(
      req.file,
      req.org.id,
      req.user.id,
      req.body.workspaceId
    );
    return created(res, { document: doc }, 'Document uploaded');
  } catch (err) {
    next(err);
  }
}

async function getDocuments(req, res, next) {
  try {
    const documents = await documentsService.getDocumentsByOrgId(req.org.id);
    return success(res, { documents });
  } catch (err) {
    next(err);
  }
}

async function getDocumentTags(req, res, next) {
  try {
    const tags = await documentsService.getDocumentTags(req.params.id);
    return success(res, { tags });
  } catch (err) {
    next(err);
  }
}

module.exports = { streamProgress, uploadDocument, getDocuments, getDocumentTags };
