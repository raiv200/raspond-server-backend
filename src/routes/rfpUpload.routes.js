const router = require('express').Router();
const c = require('../controllers/rfpUpload.controller');
const { authenticate } = require('../middleware/auth');
const { requireOrgMember, requireMinRole } = require('../middleware/orgAccess');
const { uploadDocument } = require('../middleware/upload');

router.post('/upload', authenticate, requireOrgMember, requireMinRole('BID_MANAGER', 'BID_EXECUTIVE'), uploadDocument, c.uploadDocument);

module.exports = router;
