const prisma = require('../config/database');
const { APPROVAL_STATUSES, RFP_STATUSES } = require('../config/constants');
const { ForbiddenError } = require('../utils/errors');
const emailService = require('./email.service');

async function getApprovals(rfpId) {
  const approvals = await prisma.approval.findMany({
    where: { rfpId },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      section: { select: { id: true, title: true, order: true } },
    },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });

  const total = approvals.length;
  const approved = approvals.filter((a) => a.status === APPROVAL_STATUSES.APPROVED).length;

  return {
    approvals,
    progress: {
      total, approved,
      pending: approvals.filter((a) => a.status === APPROVAL_STATUSES.PENDING).length,
      changesRequested: approvals.filter((a) => a.status === APPROVAL_STATUSES.CHANGES_REQUESTED).length,
      percentage: total > 0 ? Math.round((approved / total) * 100) : 0,
    },
  };
}

async function approveSection(rfpId, sectionId, userId, notes) {
  const assignment = await prisma.sectionAssignment.findFirst({ where: { sectionId, userId, role: 'APPROVER' } });
  if (!assignment) throw new ForbiddenError('You are not an approver for this section');

  const approval = await prisma.approval.upsert({
    where: { rfpId_sectionId_userId: { rfpId, sectionId, userId } },
    update: { status: APPROVAL_STATUSES.APPROVED, notes, decidedAt: new Date() },
    create: { rfpId, sectionId, userId, status: APPROVAL_STATUSES.APPROVED, notes, order: assignment.order, decidedAt: new Date() },
  });

  await checkAndProgressApprovals(rfpId);
  return approval;
}

async function requestChanges(rfpId, sectionId, userId, notes) {
  const rfp = await prisma.rfp.findUnique({ where: { id: rfpId }, include: { org: true } });
  const assignment = await prisma.sectionAssignment.findFirst({ where: { sectionId, userId, role: 'APPROVER' } });
  if (!assignment) throw new ForbiddenError('You are not an approver for this section');

  const approval = await prisma.approval.upsert({
    where: { rfpId_sectionId_userId: { rfpId, sectionId, userId } },
    update: { status: APPROVAL_STATUSES.CHANGES_REQUESTED, notes, decidedAt: new Date() },
    create: { rfpId, sectionId, userId, status: APPROVAL_STATUSES.CHANGES_REQUESTED, notes, order: assignment.order, decidedAt: new Date() },
  });

  await prisma.rfp.update({ where: { id: rfpId }, data: { status: RFP_STATUSES.IN_PROGRESS } });

  // Notify writers
  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  const writers = await prisma.sectionAssignment.findMany({ where: { sectionId, role: 'WRITER' }, include: { user: true } });
  const approver = await prisma.user.findUnique({ where: { id: userId } });

  for (const w of writers) {
    emailService.sendChangesRequested(w.user.email, {
      writerName: w.user.name, approverName: approver.name, rfpTitle: rfp.title,
      sectionTitle: section.title, notes, rfpUrl: `${process.env.FRONTEND_URL}/orgs/${rfp.org.slug}/rfps/${rfpId}/edit`,
    }).catch(() => {});
  }

  return approval;
}

async function approveDocument(rfpId, userId, notes) {
  const globalApprover = await prisma.rfpGlobalApprover.findUnique({ where: { rfpId_userId: { rfpId, userId } } });
  if (!globalApprover) throw new ForbiddenError('You are not a global approver for this RFP');

  const approval = await prisma.approval.upsert({
    where: { rfpId_sectionId_userId: { rfpId, sectionId: null, userId } },
    update: { status: APPROVAL_STATUSES.APPROVED, notes, decidedAt: new Date() },
    create: { rfpId, sectionId: null, userId, status: APPROVAL_STATUSES.APPROVED, notes, order: globalApprover.order, decidedAt: new Date() },
  });

  await checkAndProgressApprovals(rfpId);
  return approval;
}

async function getReviewStatus(rfpId) {
  const rfp = await prisma.rfp.findUnique({
    where: { id: rfpId },
    include: {
      sections: { include: { questions: { select: { id: true, answer: true } } } },
      globalApprovers: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { order: 'asc' } },
    },
  });

  const totalQ = rfp.sections.reduce((s, sec) => s + sec.questions.length, 0);
  const answered = rfp.sections.reduce((s, sec) => s + sec.questions.filter((q) => q.answer).length, 0);
  const allApprovals = await prisma.approval.findMany({ where: { rfpId } });
  const approvedCount = allApprovals.filter((a) => a.status === APPROVAL_STATUSES.APPROVED).length;

  return {
    rfpId, status: rfp.status,
    completion: { totalQuestions: totalQ, answered, percentage: totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0 },
    approval: { total: allApprovals.length, approved: approvedCount, percentage: allApprovals.length > 0 ? Math.round((approvedCount / allApprovals.length) * 100) : 0 },
    globalApprovers: rfp.globalApprovers,
  };
}

async function checkAndProgressApprovals(rfpId) {
  const rfp = await prisma.rfp.findUnique({ where: { id: rfpId }, include: { org: true } });
  const allApprovals = await prisma.approval.findMany({ where: { rfpId } });
  const pending = allApprovals.filter((a) => a.status === APPROVAL_STATUSES.PENDING);
  const changesReq = allApprovals.some((a) => a.status === APPROVAL_STATUSES.CHANGES_REQUESTED);

  if (allApprovals.length > 0 && pending.length === 0 && !changesReq) {
    await prisma.rfp.update({ where: { id: rfpId }, data: { status: RFP_STATUSES.COMPLETED } });

    const creator = await prisma.user.findUnique({ where: { id: rfp.createdById } });
    if (creator) {
      emailService.sendRfpApproved(creator.email, {
        userName: creator.name, rfpTitle: rfp.title, orgName: rfp.org.name,
        exportUrl: `${process.env.FRONTEND_URL}/orgs/${rfp.org.slug}/rfps/${rfpId}/export`,
      }).catch(() => {});
    }
  }
}

module.exports = { getApprovals, approveSection, requestChanges, approveDocument, getReviewStatus };
