const router = require('express').Router();
const c = require('../controllers/orgMember.controller');
const { authenticate } = require('../middleware/auth');
const { requireOrgMember, requireRole, requireMinRole } = require('../middleware/orgAccess');
const { validate } = require('../middleware/validate');
const { inviteMemberSchema, updateMemberRoleSchema } = require('../utils/validators/org.validator');

router.get('/members', authenticate, requireOrgMember, c.listMembers);
router.post('/invites', authenticate, requireOrgMember, requireMinRole('BID_EXECUTIVE'), validate(inviteMemberSchema), c.inviteMembers);
router.get('/invites', authenticate, requireOrgMember, requireMinRole('BID_EXECUTIVE'), c.getInvites);
router.delete('/invites/:inviteId', authenticate, requireOrgMember, requireMinRole('BID_EXECUTIVE'), c.revokeInvite);
router.delete('/members/:userId', authenticate, requireOrgMember, requireRole('BID_MANAGER'), c.removeMember);
router.put('/members/:userId/role', authenticate, requireOrgMember, requireRole('BID_MANAGER'), validate(updateMemberRoleSchema), c.updateMemberRole);
// Join org via invite code (any authenticated user, no org required)
router.post('/join/:inviteCode', authenticate, c.joinOrg);
// Get invite details (any authenticated user, no org required — used on join page)
router.get('/invite/:inviteCode/details', authenticate, c.getInviteDetails);

module.exports = router;
