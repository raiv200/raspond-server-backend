const router = require('express').Router();
const c = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateProfileSchema, changePasswordSchema } = require('../utils/validators/user.validator');
const { uploadAvatar } = require('../middleware/upload');

router.put('/profile', authenticate, validate(updateProfileSchema), c.updateProfile);
router.put('/password', authenticate, validate(changePasswordSchema), c.changePassword);
router.post('/avatar', authenticate, uploadAvatar, c.uploadAvatar);
router.delete('/avatar', authenticate, c.removeAvatar);

module.exports = router;
