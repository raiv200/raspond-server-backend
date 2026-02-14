const collabService = require('../services/collaboration.service');
const prisma = require('../config/database');
const { success, badRequest } = require('../utils/response');

async function getToken(req, res, next) {
  try {
    const { documentId } = req.body;
    if (!documentId) return badRequest(res, 'documentId is required');
    return success(res, collabService.generateTipTapToken(req.user.id, documentId));
  } catch (err) { next(err); }
}
async function getStatus(req, res, next) {
  try { return success(res, collabService.getCollabStatus()); } catch (err) { next(err); }
}
async function getUsers(req, res, next) {
  try {
    const { ids } = req.query;
    if (!ids) return badRequest(res, 'ids query parameter is required');
    const users = await prisma.user.findMany({
      where: { id: { in: ids.split(',').filter(Boolean) } },
      select: { id: true, name: true, email: true, avatar: true, color: true },
    });
    return success(res, users);
  } catch (err) { next(err); }
}

module.exports = { getToken, getStatus, getUsers };
