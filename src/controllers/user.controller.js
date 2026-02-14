const userService = require('../services/user.service');
const { success, badRequest } = require('../utils/response');

async function updateProfile(req, res, next) {
  try { return success(res, await userService.updateProfile(req.user.id, req.body), 'Profile updated'); } catch (err) { next(err); }
}
async function changePassword(req, res, next) {
  try { return success(res, await userService.changePassword(req.user.id, req.body)); } catch (err) { next(err); }
}
async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) return badRequest(res, 'No file uploaded');
    return success(res, await userService.uploadAvatar(req.user.id, req.file.path), 'Avatar uploaded');
  } catch (err) { next(err); }
}
async function removeAvatar(req, res, next) {
  try { return success(res, await userService.removeAvatar(req.user.id), 'Avatar removed'); } catch (err) { next(err); }
}

module.exports = { updateProfile, changePassword, uploadAvatar, removeAvatar };
