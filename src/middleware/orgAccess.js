const prisma = require('../config/database');
const { forbidden, notFound } = require('../utils/response');
const { ORG_ROLES, ROLE_HIERARCHY } = require('../config/constants');

/**
 * Load user's org membership. Since each user has one org,
 * we find it from their membership. Attaches req.org and req.orgMember.
 *
 * If orgId is in params, validates against that specific org.
 * Otherwise finds the user's org automatically.
 */
async function requireOrgMember(req, res, next) {
  try {
    const userId = req.user.id;
    let orgId = req.params.orgId;

    let member;

    if (orgId) {
      // Validate specific org
      member = await prisma.orgMember.findUnique({
        where: { userId_orgId: { userId, orgId } },
        include: { org: true },
      });
    } else {
      // Find user's org (they only have one)
      member = await prisma.orgMember.findFirst({
        where: { userId },
        include: { org: true },
      });
    }

    if (!member) {
      return forbidden(res, 'You are not a member of any organization');
    }

    req.org = member.org;
    req.orgMember = member;

    // Make orgId available in params for downstream use
    if (!req.params.orgId) {
      req.params.orgId = member.orgId;
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Require minimum role. Uses hierarchy: BID_MANAGER > BID_EXECUTIVE > TEAM_MEMBER
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.orgMember) {
      return forbidden(res, 'Organization membership required');
    }

    if (!allowedRoles.includes(req.orgMember.role)) {
      return forbidden(res, `This action requires one of: ${allowedRoles.join(', ')}`);
    }

    next();
  };
}

/**
 * Require minimum role level (using hierarchy number).
 * requireMinRole('BID_EXECUTIVE') allows BID_EXECUTIVE and BID_MANAGER.
 */
function requireMinRole(minRole) {
  return (req, res, next) => {
    if (!req.orgMember) {
      return forbidden(res, 'Organization membership required');
    }

    const userLevel = ROLE_HIERARCHY[req.orgMember.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
      return forbidden(res, `This action requires at least ${minRole} role`);
    }

    next();
  };
}

module.exports = { requireOrgMember, requireRole, requireMinRole };
