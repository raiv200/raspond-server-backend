const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const { success, created, badRequest } = require('../utils/response');

async function register(req, res, next) {
  try {
    const { user, tokens, otp } = await authService.register(req.body);
    emailService.sendVerifyEmail(user.email, { name: user.name, otp }).catch(() => {});
    return created(res, { user, ...tokens }, 'Account created — OTP sent to your email');
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { user, tokens } = await authService.login(req.body);
    return success(res, { user, ...tokens }, 'Login successful');
  } catch (err) { next(err); }
}

async function verifyEmail(req, res, next) {
  try {
    const result = await authService.verifyEmail(req.body);
    // Send welcome email after successful verification
    const user = await authService.getUserByEmail(req.body.email);
    if (user) {
      emailService.sendWelcome(user.email, { name: user.name }).catch(() => {});
    }
    return success(res, result);
  } catch (err) { next(err); }
}

async function resendOtp(req, res, next) {
  try {
    const { otp, name } = await authService.resendOtp(req.body.email);
    emailService.sendVerifyEmail(req.body.email, { name, otp }).catch(() => {});
    return success(res, null, 'New OTP sent to your email');
  } catch (err) { next(err); }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, user);
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return badRequest(res, 'Refresh token is required');
    const tokens = await authService.refreshTokens(refreshToken);
    return success(res, tokens, 'Tokens refreshed');
  } catch (err) { next(err); }
}

async function setupAccount(req, res, next) {
  try {
    const result = await authService.setupAccount(req.user.id, req.body);
    return success(res, result, 'Account setup complete');
  } catch (err) { next(err); }
}

module.exports = { register, login, verifyEmail, resendOtp, getMe, refresh, setupAccount };
