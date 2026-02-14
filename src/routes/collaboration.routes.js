const router = require('express').Router();
const c = require('../controllers/collaboration.controller');
const { authenticate } = require('../middleware/auth');

router.post('/token', authenticate, c.getToken);
router.get('/status', c.getStatus);
router.get('/users', authenticate, c.getUsers);

module.exports = router;
