const router = require('express').Router();
const c = require('../controllers/submission.controller');
const { authenticate } = require('../middleware/auth');
const { requireOrgMember, requireMinRole } = require('../middleware/orgAccess');
const { requireRfpAccess } = require('../middleware/rfpAccess');

router.post('/:rfpId/export', authenticate, requireOrgMember, requireRfpAccess, requireMinRole('BID_MANAGER,BID_EXECUTIVE'), c.exportRfp);
router.post('/:rfpId/submit', authenticate, requireOrgMember, requireRfpAccess, requireMinRole('BID_MANAGER,BID_EXECUTIVE'), c.submitRfp);
router.get('/:rfpId/submission', authenticate, requireOrgMember, requireRfpAccess, c.getSubmission);

module.exports = router;
