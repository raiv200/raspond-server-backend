const collabService = require('../services/collaboration.service');
const prisma = require('../config/database');
const { success, badRequest, notFound, forbidden } = require('../utils/response');

async function getToken(req, res, next) {
  try {
    const { rfpId } = req.body;

    if (!rfpId) {
      return badRequest(res, 'rfpId is required');
    }

    const result = await collabService.generateTipTapToken(req.user.id, rfpId);

    // If TipTap is not configured, the service returns { enabled: false }
    if (result.enabled === false) {
      return badRequest(res, result.message || 'TipTap Cloud not configured');
    }

    return success(res, result);
  } catch (err) {
    // Handle known errors from service
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 403) return forbidden(res, err.message);
    next(err);
  }
}

async function getStatus(req, res, next) {
  try {
    return success(res, collabService.getCollabStatus());
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const { ids } = req.query;

    if (!ids || typeof ids !== 'string') {
      return badRequest(res, 'ids query parameter is required');
    }

    const userIds = ids.split(',').map((id) => id.trim()).filter(Boolean);

    if (userIds.length === 0) {
      return success(res, []);
    }

    // Limit to prevent abuse
    if (userIds.length > 50) {
      return badRequest(res, 'Too many IDs (max 50)');
    }

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, color: true },
    });

    return success(res, users);
  } catch (err) {
    next(err);
  }
}

module.exports = { getToken, getStatus, getUsers };