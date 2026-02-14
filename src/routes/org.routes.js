const router = require('express').Router();
const c = require('../controllers/org.controller');
const { authenticate } = require('../middleware/auth');
const { requireOrgMember, requireRole } = require('../middleware/orgAccess');
const { validate } = require('../middleware/validate');
const { updateOrgSchema } = require('../utils/validators/org.validator');

// Get current user's org details
router.get('/current', authenticate, requireOrgMember, c.getOrg);
// Update org (Bid Manager only)
router.put('/current', authenticate, requireOrgMember, requireRole('BID_MANAGER'), validate(updateOrgSchema), c.updateOrg);
// Delete org (Bid Manager only)
router.delete('/current', authenticate, requireOrgMember, requireRole('BID_MANAGER'), c.deleteOrg);

module.exports = router;
