const prisma = require('../config/database');
const { BadRequestError } = require('../utils/errors');

async function getOrgDetails(orgId) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, title: true, color: true } },
        },
        orderBy: { joinedAt: 'asc' },
      },
      _count: { select: { members: true, rfps: true } },
      rfps: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, status: true, company: true, dueDate: true, createdAt: true },
      },
    },
  });

  const activeRfps = await prisma.rfp.count({
    where: { orgId, status: { in: ['DRAFT', 'IN_PROGRESS', 'IN_REVIEW'] } },
  });
  const completedRfps = await prisma.rfp.count({
    where: { orgId, status: { in: ['COMPLETED', 'SUBMITTED'] } },
  });

  return {
    ...org,
    stats: { totalMembers: org._count.members, totalRfps: org._count.rfps, activeRfps, completedRfps },
  };
}

async function updateOrg(orgId, data) {
  if (data.slug) {
    const existing = await prisma.organization.findFirst({ where: { slug: data.slug, NOT: { id: orgId } } });
    if (existing) throw new BadRequestError('Organization slug already taken');
  }

  return prisma.organization.update({
    where: { id: orgId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.logo !== undefined && { logo: data.logo }),
    },
  });
}

async function deleteOrg(orgId, userId) {
  // Verify user is BID_MANAGER (additional safety check)
  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });
  
  if (!membership || membership.role !== 'BID_MANAGER') {
    throw new BadRequestError('Only Bid Managers can delete the organization');
  }

  // Delete organization (cascade deletes will handle all related data)
  await prisma.organization.delete({ where: { id: orgId } });
  
  return { message: 'Organization deleted successfully' };
}

module.exports = { getOrgDetails, updateOrg, deleteOrg };
