const prisma = require('../config/database');
const { ORG_ROLES } = require('../config/constants');
const { NotFoundError } = require('../utils/errors');

async function createRfpFromStructure(orgId, userId, data) {
  const rfp = await prisma.rfp.create({
    data: {
      title: data.title,
      description: data.description,
      company: data.company,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      estimatedValue: data.estimatedValue,
      orgId,
      createdById: userId,
      // Auto-add creator as RFP member
      members: {
        create: { userId },
      },
      sections: {
        create: data.sections.map((section) => ({
          title: section.title,
          order: section.order,
          questions: {
            create: section.questions.map((q) => ({
              title: q.title,
              fullQuestion: q.fullQuestion,
              description: q.description,
              order: q.order,
              maxChars: q.maxChars || 3000,
            })),
          },
        })),
      },
    },
    include: {
      sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  // Add additional members if specified
  if (data.members && data.members.length > 0) {
    for (const memberId of data.members) {
      if (memberId !== userId) {
        await prisma.rfpMember.upsert({
          where: { userId_rfpId: { userId: memberId, rfpId: rfp.id } },
          update: {},
          create: { userId: memberId, rfpId: rfp.id },
        });
      }
    }
  }

  return rfp;
}

/**
 * List RFPs based on user's role:
 * - BID_MANAGER: sees all org RFPs
 * - BID_EXECUTIVE / TEAM_MEMBER: sees only assigned RFPs
 */
async function listOrgRfps(orgId, userId, userRole) {
  let where = { orgId };

  if (userRole !== ORG_ROLES.BID_MANAGER) {
    // Only show RFPs where user is a member or creator
    where = {
      orgId,
      OR: [
        { members: { some: { userId } } },
        { createdById: userId },
      ],
    };
  }

  const rfps = await prisma.rfp.findMany({
    where,
    include: {
      sections: {
        include: { questions: { select: { id: true, answer: true } } },
      },
      createdBy: { select: { id: true, name: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      _count: { select: { sections: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rfps.map((rfp) => {
    const totalQuestions = rfp.sections.reduce((sum, s) => sum + s.questions.length, 0);
    const answeredQuestions = rfp.sections.reduce(
      (sum, s) => sum + s.questions.filter((q) => q.answer).length, 0
    );

    return {
      id: rfp.id, title: rfp.title, description: rfp.description,
      company: rfp.company, dueDate: rfp.dueDate, estimatedValue: rfp.estimatedValue,
      status: rfp.status, createdBy: rfp.createdBy, createdAt: rfp.createdAt, updatedAt: rfp.updatedAt,
      sectionCount: rfp._count.sections, totalQuestions, answeredQuestions,
      progress: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
      collaborators: rfp.members.map((m) => m.user),
    };
  });
}

/**
 * Get RFP details. For TEAM_MEMBER, filter sections to only those they have access to.
 */
async function getRfpDetails(rfpId, userId, userRole) {
  const rfp = await prisma.rfp.findUnique({
    where: { id: rfpId },
    include: {
      sections: {
        include: {
          questions: { orderBy: { order: 'asc' } },
          assignments: {
            include: { user: { select: { id: true, name: true, email: true, avatar: true, color: true } } },
          },
          access: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
          approvals: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
        },
        orderBy: { order: 'asc' },
      },
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      },
      globalApprovers: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { order: 'asc' },
      },
      createdBy: { select: { id: true, name: true, email: true, avatar: true } },
      submission: true,
    },
  });

  if (!rfp) throw new NotFoundError('RFP not found');

  // For TEAM_MEMBER, mark which sections they can access
  if (userRole === ORG_ROLES.TEAM_MEMBER) {
    const accessibleSectionIds = await prisma.sectionAccess.findMany({
      where: { userId, sectionId: { in: rfp.sections.map((s) => s.id) } },
      select: { sectionId: true, permission: true },
    });

    const accessMap = new Map(accessibleSectionIds.map((a) => [a.sectionId, a.permission]));

    rfp.sections = rfp.sections.map((section) => ({
      ...section,
      accessible: accessMap.has(section.id),
      permission: accessMap.get(section.id) || null,
      // Hide questions if no access
      questions: accessMap.has(section.id) ? section.questions : [],
    }));
  } else {
    // Manager and Executive see all sections
    rfp.sections = rfp.sections.map((section) => ({
      ...section,
      accessible: true,
      permission: 'EDIT',
    }));
  }

  return rfp;
}

async function updateRfp(rfpId, data) {
  const updateData = {};
  if (data.title) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.company !== undefined) updateData.company = data.company;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.estimatedValue !== undefined) updateData.estimatedValue = data.estimatedValue;
  if (data.status) updateData.status = data.status;

  return prisma.rfp.update({ where: { id: rfpId }, data: updateData });
}

async function updateStructure(rfpId, { sections }) {
  const existingSections = await prisma.section.findMany({
    where: { rfpId }, include: { questions: true },
  });

  const existingSectionIds = existingSections.map((s) => s.id);
  const incomingSectionIds = sections.filter((s) => s.id).map((s) => s.id);

  // Delete removed sections
  const toDelete = existingSectionIds.filter((id) => !incomingSectionIds.includes(id));
  if (toDelete.length > 0) {
    await prisma.section.deleteMany({ where: { id: { in: toDelete } } });
  }

  for (const section of sections) {
    if (section.id) {
      await prisma.section.update({ where: { id: section.id }, data: { title: section.title, order: section.order } });

      const existingQIds = existingSections.find((s) => s.id === section.id)?.questions.map((q) => q.id) || [];
      const incomingQIds = section.questions.filter((q) => q.id).map((q) => q.id);
      const qToDelete = existingQIds.filter((id) => !incomingQIds.includes(id));
      if (qToDelete.length > 0) await prisma.question.deleteMany({ where: { id: { in: qToDelete } } });

      for (const q of section.questions) {
        if (q.id) {
          await prisma.question.update({ where: { id: q.id }, data: { title: q.title, fullQuestion: q.fullQuestion, description: q.description, order: q.order } });
        } else {
          await prisma.question.create({ data: { sectionId: section.id, title: q.title, fullQuestion: q.fullQuestion, description: q.description, order: q.order, maxChars: q.maxChars || 3000 } });
        }
      }
    } else {
      await prisma.section.create({
        data: {
          rfpId, title: section.title, order: section.order,
          questions: { create: section.questions.map((q) => ({ title: q.title, fullQuestion: q.fullQuestion, description: q.description, order: q.order, maxChars: q.maxChars || 3000 })) },
        },
      });
    }
  }

  return getRfpDetails(rfpId, null, ORG_ROLES.BID_MANAGER);
}

async function deleteRfp(rfpId) {
  await prisma.rfp.delete({ where: { id: rfpId } });
  return { message: 'RFP deleted' };
}

async function addRfpMembers(rfpId, userIds) {
  for (const userId of userIds) {
    await prisma.rfpMember.upsert({
      where: { userId_rfpId: { userId, rfpId } },
      update: {},
      create: { userId, rfpId },
    });
  }
  return prisma.rfpMember.findMany({
    where: { rfpId },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
  });
}

async function removeRfpMember(rfpId, userId) {
  await prisma.rfpMember.delete({ where: { userId_rfpId: { userId, rfpId } } });
  // Also remove section access
  await prisma.sectionAccess.deleteMany({ where: { userId, section: { rfpId } } });
  return { message: 'Member removed from RFP' };
}

async function getAnswer(questionId) {
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) throw new NotFoundError('Question not found');
  return { answer: question.answer, answerJson: question.answerJson, answeredAt: question.answeredAt };
}

async function saveAnswer(questionId, { answer, answerJson }) {
  return prisma.question.update({
    where: { id: questionId },
    data: { answer, answerJson, answeredAt: answer ? new Date() : null },
  });
}

/**
 * Set section access for team members.
 * sectionAccess: [{ sectionId, userId, permission: 'VIEW' | 'EDIT' }]
 */
async function setSectionAccess(rfpId, sectionAccess) {
  // Clear existing access for affected sections
  const sectionIds = [...new Set(sectionAccess.map((a) => a.sectionId))];
  await prisma.sectionAccess.deleteMany({ where: { sectionId: { in: sectionIds } } });

  // Create new access records
  for (const access of sectionAccess) {
    await prisma.sectionAccess.create({
      data: {
        sectionId: access.sectionId,
        userId: access.userId,
        permission: access.permission || 'EDIT',
      },
    });

    // Also ensure user is an RFP member
    await prisma.rfpMember.upsert({
      where: { userId_rfpId: { userId: access.userId, rfpId } },
      update: {},
      create: { userId: access.userId, rfpId },
    });
  }

  return { message: 'Section access updated' };
}

async function getSectionAccess(rfpId) {
  const sections = await prisma.section.findMany({
    where: { rfpId },
    include: {
      access: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      },
    },
    orderBy: { order: 'asc' },
  });
  return sections;
}

module.exports = {
  createRfpFromStructure, listOrgRfps, getRfpDetails, updateRfp, updateStructure,
  deleteRfp, addRfpMembers, removeRfpMember, getAnswer, saveAnswer,
  setSectionAccess, getSectionAccess,
};
