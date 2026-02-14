const prisma = require('../config/database');
const { NotFoundError } = require('../utils/errors');
const emailService = require('./email.service');

async function getAssignments(rfpId) {
  const sections = await prisma.section.findMany({
    where: { rfpId },
    include: {
      assignments: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true, color: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  const globalApprovers = await prisma.rfpGlobalApprover.findMany({
    where: { rfpId },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    orderBy: { order: 'asc' },
  });

  return { sections, globalApprovers };
}

async function bulkSetAssignments(rfpId, orgId, { assignments, globalApprovers }) {
  const rfp = await prisma.rfp.findUnique({ where: { id: rfpId }, include: { org: true } });
  if (!rfp) throw new NotFoundError('RFP not found');

  await prisma.$transaction(async (tx) => {
    for (const assignment of assignments) {
      await tx.sectionAssignment.deleteMany({ where: { sectionId: assignment.sectionId } });

      for (const writerId of assignment.writers) {
        await tx.sectionAssignment.create({
          data: { sectionId: assignment.sectionId, userId: writerId, role: 'WRITER' },
        });
        // Auto-add as RFP member and section access
        await tx.rfpMember.upsert({
          where: { userId_rfpId: { userId: writerId, rfpId } },
          update: {}, create: { userId: writerId, rfpId },
        });
        await tx.sectionAccess.upsert({
          where: { sectionId_userId: { sectionId: assignment.sectionId, userId: writerId } },
          update: { permission: 'EDIT' },
          create: { sectionId: assignment.sectionId, userId: writerId, permission: 'EDIT' },
        });
      }

      for (const approver of assignment.approvers) {
        await tx.sectionAssignment.create({
          data: { sectionId: assignment.sectionId, userId: approver.userId, role: 'APPROVER', order: approver.order },
        });
        await tx.rfpMember.upsert({
          where: { userId_rfpId: { userId: approver.userId, rfpId } },
          update: {}, create: { userId: approver.userId, rfpId },
        });
      }
    }

    await tx.rfpGlobalApprover.deleteMany({ where: { rfpId } });
    for (const ga of globalApprovers) {
      await tx.rfpGlobalApprover.create({ data: { rfpId, userId: ga.userId, order: ga.order } });
    }
  });

  // Send emails to assigned writers (fire-and-forget)
  for (const assignment of assignments) {
    const section = await prisma.section.findUnique({ where: { id: assignment.sectionId } });
    for (const writerId of assignment.writers) {
      const writer = await prisma.user.findUnique({ where: { id: writerId } });
      if (writer && section) {
        emailService.sendRfpAssigned(writer.email, {
          assigneeName: writer.name, rfpTitle: rfp.title, sectionTitle: section.title,
          orgName: rfp.org.name, rfpUrl: `${process.env.FRONTEND_URL}/orgs/${rfp.org.slug}/rfps/${rfpId}/edit`,
        }).catch(() => {});
      }
    }
  }

  return getAssignments(rfpId);
}

module.exports = { getAssignments, bulkSetAssignments };
