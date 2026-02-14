const rfpUploadService = require('../services/rfpUpload.service');
const { success, badRequest } = require('../utils/response');

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) return badRequest(res, 'No document file uploaded');
    return success(res, await rfpUploadService.processUploadedDocument(req.file), 'Document processed');
  } catch (err) { next(err); }
}

module.exports = { uploadDocument };
