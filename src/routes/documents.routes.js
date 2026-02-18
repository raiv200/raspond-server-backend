const router = require('express').Router();
const multer = require('multer');
const os = require('os');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { requireOrgMember } = require('../middleware/orgAccess');
const c = require('../controllers/documents.controller');

const upload = multer({
  dest: path.join(os.tmpdir(), 'raspond-uploads'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// SSE stream — auth only, no org middleware needed
router.get('/:id/stream', authenticate, c.streamProgress);

// All other routes require org membership
router.use(authenticate, requireOrgMember);

router.post('/', upload.single('file'), c.uploadDocument);
router.get('/:id/tags', c.getDocumentTags);
router.get('/', c.getDocuments);

module.exports = router;
