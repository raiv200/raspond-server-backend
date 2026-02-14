const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema, setupAccountSchema } = require('../utils/validators/auth.validator');

router.post('/register', validate(registerSchema), c.register);
router.post('/login', validate(loginSchema), c.login);
router.post('/verify-email', validate(verifyOtpSchema), c.verifyEmail);
router.post('/resend-otp', validate(resendOtpSchema), c.resendOtp);
router.get('/me', authenticate, c.getMe);
router.post('/refresh', c.refresh);
router.put('/setup', authenticate, validate(setupAccountSchema), c.setupAccount);

module.exports = router;
