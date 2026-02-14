const router = require('express').Router();
const c = require('../controllers/approval.controller');
const { authenticate } = require('../middleware/auth');
const { requireOrgMember } = require('../middleware/orgAccess');
const { requireRfpAccess } = require('../middleware/rfpAccess');

router.get('/:rfpId/approvals', authenticate, requireOrgMember, requireRfpAccess, c.getApprovals);
router.post('/:rfpId/sections/:sectionId/approve', authenticate, requireOrgMember, requireRfpAccess, c.approveSection);
router.post('/:rfpId/sections/:sectionId/request-changes', authenticate, requireOrgMember, requireRfpAccess, c.requestChanges);
router.post('/:rfpId/approve', authenticate, requireOrgMember, requireRfpAccess, c.approveDocument);
router.get('/:rfpId/review-status', authenticate, requireOrgMember, requireRfpAccess, c.getReviewStatus);

module.exports = router;
