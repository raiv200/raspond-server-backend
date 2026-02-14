const prisma = require('../config/database');
const { RFP_STATUSES } = require('../config/constants');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const emailService = require('./email.service');

async function submitRfp(rfpId, userId, data) {
  const rfp = await prisma.rfp.findUnique({
    where: { id: rfpId },
    include: { 
      org: true, 
      members: { include: { user: true } }, 
      submission: true,
      createdBy: { select: { id: true, name: true, email: true } }
    },
  });
  if (!rfp) throw new NotFoundError('RFP not found');
  if (rfp.submission) throw new BadRequestError('This RFP has already been submitted');

  const contributors = await prisma.rfpMember.count({ where: { rfpId } });

  const submission = await prisma.submission.create({
    data: {
      rfpId, submittedById: userId, submissionMethod: data.submissionMethod,
      recipientEmail: data.recipientEmail, submissionBody: data.submissionBody,
      exportFormat: data.exportFormat, totalTimeMinutes: data.totalTimeMinutes,
      aiSuggestionsCount: data.aiSuggestionsCount || 0, contributorsCount: contributors,
    },
  });

  await prisma.rfp.update({ where: { id: rfpId }, data: { status: RFP_STATUSES.SUBMITTED } });

  // Send notification to all RFP team members
  for (const member of rfp.members) {
    emailService.sendRfpSubmitted(member.user.email, {
      userName: member.user.name, rfpTitle: rfp.title, company: rfp.company,
      orgName: rfp.org.name, totalTime: data.totalTimeMinutes, contributors,
      dashboardUrl: `${process.env.FRONTEND_URL}/orgs/${rfp.org.slug}/dashboard`,
    }).catch(() => {});
  }

  // Send the RFP response to the client's email if provided
  if (data.recipientEmail) {
    const submitter = rfp.members.find(m => m.userId === userId)?.user || rfp.createdBy;
    emailService.sendClientSubmission(data.recipientEmail, {
      rfpTitle: rfp.title,
      company: rfp.company,
      orgName: rfp.org.name,
      submitterName: submitter.name,
      submissionBody: data.submissionBody,
      exportUrl: `${process.env.FRONTEND_URL}/orgs/${rfp.org.slug}/rfps/${rfpId}/export`,
    }).catch(() => {});
  }

  return submission;
}

async function getSubmission(rfpId) {
  const submission = await prisma.submission.findUnique({
    where: { rfpId },
    include: { submittedBy: { select: { id: true, name: true, email: true, avatar: true } } },
  });
  if (!submission) throw new NotFoundError('No submission found');
  return submission;
}

async function exportRfp(rfpId, format) {
  const rfp = await prisma.rfp.findUnique({
    where: { id: rfpId },
    include: {
      sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
      org: true, createdBy: { select: { name: true, email: true } },
    },
  });
  if (!rfp) throw new NotFoundError('RFP not found');

  return {
    format: format || 'json',
    rfp: {
      title: rfp.title, company: rfp.company, organization: rfp.org.name, createdBy: rfp.createdBy.name,
      sections: rfp.sections.map((s) => ({
        title: s.title,
        questions: s.questions.map((q) => ({ title: q.title, question: q.fullQuestion, answer: q.answer || '(Not answered)' })),
      })),
    },
    message: `Export in ${format || 'JSON'} format. PDF/DOCX generation to be implemented.`,
  };
}

module.exports = { submitRfp, getSubmission, exportRfp };
