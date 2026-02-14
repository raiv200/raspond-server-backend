const prisma = require('../config/database');
const { forbidden, notFound } = require('../utils/response');
const { ORG_ROLES } = require('../config/constants');

/**
 * Check if user has access to the RFP.
 * - Bid Manager: sees ALL RFPs in org
 * - Bid Executive / Team Member: only sees RFPs they are a member of (RfpMember)
 *
 * Also loads the RFP with sections. Attaches req.rfp.
 */
async function requireRfpAccess(req, res, next) {
  try {
    const { rfpId } = req.params;
    const userId = req.user.id;

    const rfp = await prisma.rfp.findUnique({
      where: { id: rfpId },
      include: {
        sections: {
          include: { questions: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!rfp) {
      return notFound(res, 'RFP not found');
    }

    // Ensure RFP belongs to user's org
    if (req.org && rfp.orgId !== req.org.id) {
      return notFound(res, 'RFP not found in this organization');
    }

    // Bid Manager sees everything
    if (req.orgMember?.role === ORG_ROLES.BID_MANAGER) {
      req.rfp = rfp;
      req.rfpRole = 'FULL_ACCESS';
      return next();
    }

    // Bid Executive / Team Member — must be an RFP member
    const rfpMember = await prisma.rfpMember.findUnique({
      where: { userId_rfpId: { userId, rfpId } },
    });

    // Also allow the creator
    if (!rfpMember && rfp.createdById !== userId) {
      return forbidden(res, 'You do not have access to this RFP');
    }

    req.rfp = rfp;
    req.rfpRole = req.orgMember?.role === ORG_ROLES.BID_EXECUTIVE ? 'EXECUTIVE_ACCESS' : 'MEMBER_ACCESS';
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * For Team Members: check section-level access.
 * Bid Manager and Bid Executive can access all sections in their assigned RFPs.
 * Team Members can only access sections they have SectionAccess for.
 *
 * Attaches req.sectionAccess.
 */
async function requireSectionAccess(req, res, next) {
  try {
    const { sectionId } = req.params;
    const userId = req.user.id;

    // Bid Manager and Bid Executive have full section access within their RFPs
    if (req.orgMember?.role !== ORG_ROLES.TEAM_MEMBER) {
      req.sectionAccess = { permission: 'EDIT' };
      return next();
    }

    // Team Member — check SectionAccess
    const access = await prisma.sectionAccess.findUnique({
      where: { sectionId_userId: { sectionId, userId } },
    });

    if (!access) {
      return forbidden(res, 'You do not have access to this section');
    }

    req.sectionAccess = access;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Check that section access allows editing (not just viewing).
 */
function requireSectionEdit(req, res, next) {
  if (req.orgMember?.role !== ORG_ROLES.TEAM_MEMBER) {
    return next(); // Manager and Executive can always edit
  }

  if (!req.sectionAccess || req.sectionAccess.permission !== 'EDIT') {
    return forbidden(res, 'You only have view access to this section');
  }

  next();
}

module.exports = { requireRfpAccess, requireSectionAccess, requireSectionEdit };
