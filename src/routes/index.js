const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/org', require('./org.routes'));
router.use('/org', require('./member.routes'));
router.use('/rfps', require('./rfpUpload.routes'));
router.use('/rfps', require('./rfp.routes'));
router.use('/rfps', require('./assignment.routes'));
router.use('/rfps', require('./approval.routes'));
router.use('/rfps', require('./submission.routes'));
router.use('/collaboration', require('./collaboration.routes'));
router.use('/tags', require('./tags.routes'));
router.use('/documents', require('./documents.routes'));

module.exports = router;
