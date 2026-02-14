const router = require('express').Router();
const c = require('../controllers/rfp.controller');
const { authenticate } = require('../middleware/auth');
const { requireOrgMember, requireMinRole } = require('../middleware/orgAccess');
const { requireRfpAccess } = require('../middleware/rfpAccess');
const { validate } = require('../middleware/validate');
const { createRfpFromStructureSchema, updateRfpSchema, updateStructureSchema, saveAnswerSchema, addRfpMembersSchema } = require('../utils/validators/rfp.validator');

// List RFPs (filtered by role)
router.get('/', authenticate, requireOrgMember, c.listRfps);

// Create RFP (Bid Manager + Bid Executive)
router.post('/create-from-structure', authenticate, requireOrgMember, requireMinRole('BID_EXECUTIVE'), validate(createRfpFromStructureSchema), c.createFromStructure);

// Single RFP
router.get('/:rfpId', authenticate, requireOrgMember, requireRfpAccess, c.getRfp);
router.put('/:rfpId', authenticate, requireOrgMember, requireRfpAccess, requireMinRole('BID_EXECUTIVE'), validate(updateRfpSchema), c.updateRfp);
router.put('/:rfpId/structure', authenticate, requireOrgMember, requireRfpAccess, requireMinRole('BID_EXECUTIVE'), validate(updateStructureSchema), c.updateStructure);
router.delete('/:rfpId', authenticate, requireOrgMember, requireMinRole('BID_EXECUTIVE'), c.deleteRfp);

// RFP members
router.post('/:rfpId/members', authenticate, requireOrgMember, requireRfpAccess, requireMinRole('BID_EXECUTIVE'), validate(addRfpMembersSchema), c.addMembers);
router.delete('/:rfpId/members/:userId', authenticate, requireOrgMember, requireRfpAccess, requireMinRole('BID_EXECUTIVE'), c.removeMember);

// Section access (who can see/edit which sections — for team members)
router.get('/:rfpId/section-access', authenticate, requireOrgMember, requireRfpAccess, requireMinRole('BID_EXECUTIVE'), c.getSectionAccess);
router.put('/:rfpId/section-access', authenticate, requireOrgMember, requireRfpAccess, requireMinRole('BID_EXECUTIVE'), c.setSectionAccess);

// Answers
router.get('/:rfpId/questions/:qId/answer', authenticate, requireOrgMember, requireRfpAccess, c.getAnswer);
router.put('/:rfpId/questions/:qId/answer', authenticate, requireOrgMember, requireRfpAccess, validate(saveAnswerSchema), c.saveAnswer);

module.exports = router;
