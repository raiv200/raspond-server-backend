const prisma = require('../config/database');
const { INVITE_EXPIRY_DAYS, INVITE_STATUSES } = require('../config/constants');
const { BadRequestError, NotFoundError, ConflictError } = require('../utils/errors');

async function createInvites(orgId, inviterId, { emails, role }) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);
  const invites = [];

  for (const email of emails) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMember = await prisma.orgMember.findUnique({
        where: { userId_orgId: { userId: existingUser.id, orgId } },
      });
      if (existingMember) continue;
    }

    const existingInvite = await prisma.orgInvite.findFirst({
      where: { email, orgId, status: INVITE_STATUSES.PENDING },
    });
    if (existingInvite) {
      await prisma.orgInvite.update({ where: { id: existingInvite.id }, data: { expiresAt, role } });
      invites.push(existingInvite);
      continue;
    }

    const invite = await prisma.orgInvite.create({
      data: { orgId, email, role, invitedBy: inviterId, expiresAt },
    });
    invites.push(invite);
  }
  return invites;
}

async function joinByInviteCode(userId, inviteCode) {
  const invite = await prisma.orgInvite.findUnique({
    where: { code: inviteCode },
    include: { org: true },
  });

  if (!invite) throw new NotFoundError('Invalid invite code');
  if (invite.status !== INVITE_STATUSES.PENDING) throw new BadRequestError(`This invite has been ${invite.status.toLowerCase()}`);
  if (new Date() > invite.expiresAt) {
    await prisma.orgInvite.update({ where: { id: invite.id }, data: { status: INVITE_STATUSES.EXPIRED } });
    throw new BadRequestError('This invite has expired');
  }

  // User joining via invite already has their own org — they join this one as invited role
  const existingMember = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId, orgId: invite.orgId } },
  });
  if (existingMember) throw new ConflictError('You are already a member of this organization');

  const [member] = await prisma.$transaction([
    prisma.orgMember.create({
      data: { userId, orgId: invite.orgId, role: invite.role },
      include: { org: true },
    }),
    prisma.orgInvite.update({
      where: { id: invite.id },
      data: { status: INVITE_STATUSES.ACCEPTED },
    }),
  ]);

  return member;
}

async function getInviteDetails(inviteCode) {
  const invite = await prisma.orgInvite.findUnique({
    where: { code: inviteCode },
    include: {
      org: { select: { id: true, name: true, slug: true, logo: true } },
    },
  });

  if (!invite) throw new NotFoundError('Invalid invite code');
  if (invite.status !== INVITE_STATUSES.PENDING) throw new BadRequestError(`This invite has been ${invite.status.toLowerCase()}`);
  if (new Date() > invite.expiresAt) {
    await prisma.orgInvite.update({ where: { id: invite.id }, data: { status: INVITE_STATUSES.EXPIRED } });
    throw new BadRequestError('This invite has expired');
  }

  return {
    code: invite.code,
    email: invite.email,
    role: invite.role,
    org: invite.org,
    expiresAt: invite.expiresAt,
  };
}

async function getOrgInvites(orgId) {
  return prisma.orgInvite.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
}

async function revokeInvite(inviteId, orgId) {
  const invite = await prisma.orgInvite.findFirst({ where: { id: inviteId, orgId } });
  if (!invite) throw new NotFoundError('Invite not found');
  return prisma.orgInvite.update({ where: { id: inviteId }, data: { status: INVITE_STATUSES.REVOKED } });
}

module.exports = { createInvites, joinByInviteCode, getInviteDetails, getOrgInvites, revokeInvite };
