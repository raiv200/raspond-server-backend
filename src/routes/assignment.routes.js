const router = require('express').Router();
const c = require('../controllers/assignment.controller');
const { authenticate } = require('../middleware/auth');
const { requireOrgMember, requireMinRole } = require('../middleware/orgAccess');
const { requireRfpAccess } = require('../middleware/rfpAccess');
const { validate } = require('../middleware/validate');
const { bulkAssignmentSchema } = require('../utils/validators/rfp.validator');

router.get('/:rfpId/assignments', authenticate, requireOrgMember, requireRfpAccess, c.getAssignments);
router.put('/:rfpId/assignments', authenticate, requireOrgMember, requireRfpAccess, requireMinRole('BID_EXECUTIVE'), validate(bulkAssignmentSchema), c.bulkSetAssignments);

module.exports = router;
