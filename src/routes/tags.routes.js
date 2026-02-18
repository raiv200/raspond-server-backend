const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireOrgMember } = require('../middleware/orgAccess');
const c = require('../controllers/tags.controller');

router.use(authenticate, requireOrgMember);

router.post('/bulk', c.bulkCreateTags);
router.post('/', c.createTag);
router.get('/stats', c.getTagStats);          // must be before /:id
router.get('/headers', c.getUniqueHeaders);
router.get('/headers/:header', c.getTagsByHeader);
router.get('/:id', c.getTag);
router.put('/:id', c.updateTag);
router.delete('/:id', c.deleteTag);
router.get('/', c.getAllTags);

module.exports = router;
