const prisma = require('../config/database');
const inviteService = require('../services/invite.service');
const emailService = require('../services/email.service');
const { success, created, forbidden, notFound } = require('../utils/response');
const { ORG_ROLES } = require('../config/constants');

async function listMembers(req, res, next) {
  try {
    const members = await prisma.orgMember.findMany({
      where: { orgId: req.org.id },
      include: { user: { select: { id: true, name: true, email: true, avatar: true, title: true, color: true, createdAt: true } } },
      orderBy: { joinedAt: 'asc' },
    });
    return success(res, members);
  } catch (err) { next(err); }
}

async function inviteMembers(req, res, next) {
  try {
    const invites = await inviteService.createInvites(req.org.id, req.user.id, req.body);
    for (const invite of invites) {
      if (invite.email) {
        const inviteUrl = `${process.env.FRONTEND_URL}/join/${invite.code}`;
        emailService.sendOrgInvite(invite.email, {
          inviterName: req.user.name, orgName: req.org.name, role: invite.role, inviteUrl,
        }).catch(() => {});
      }
    }
    return created(res, invites, 'Invitations sent');
  } catch (err) { next(err); }
}

async function getInviteDetails(req, res, next) {
  try {
    const details = await inviteService.getInviteDetails(req.params.inviteCode);
    return success(res, details);
  } catch (err) { next(err); }
}

async function joinOrg(req, res, next) {
  try {
    const member = await inviteService.joinByInviteCode(req.user.id, req.params.inviteCode);
    return success(res, member, 'Successfully joined organization');
  } catch (err) { next(err); }
}

async function removeMember(req, res, next) {
  try {
    const { userId } = req.params;
    const target = await prisma.orgMember.findUnique({ where: { userId_orgId: { userId, orgId: req.org.id } } });
    if (!target) return notFound(res, 'Member not found');
    if (target.role === ORG_ROLES.BID_MANAGER) return forbidden(res, 'Cannot remove the Bid Manager');
    await prisma.orgMember.delete({ where: { userId_orgId: { userId, orgId: req.org.id } } });
    return success(res, null, 'Member removed');
  } catch (err) { next(err); }
}

async function updateMemberRole(req, res, next) {
  try {
    const { userId } = req.params;
    const target = await prisma.orgMember.findUnique({ where: { userId_orgId: { userId, orgId: req.org.id } } });
    if (!target) return notFound(res, 'Member not found');
    if (target.role === ORG_ROLES.BID_MANAGER) return forbidden(res, 'Cannot change Bid Manager role');
    const updated = await prisma.orgMember.update({
      where: { userId_orgId: { userId, orgId: req.org.id } },
      data: { role: req.body.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return success(res, updated, 'Role updated');
  } catch (err) { next(err); }
}

async function getInvites(req, res, next) {
  try { return success(res, await inviteService.getOrgInvites(req.org.id)); } catch (err) { next(err); }
}

async function revokeInvite(req, res, next) {
  try { return success(res, await inviteService.revokeInvite(req.params.inviteId, req.org.id), 'Invite revoked'); } catch (err) { next(err); }
}

module.exports = { listMembers, inviteMembers, getInviteDetails, joinOrg, removeMember, updateMemberRole, getInvites, revokeInvite };
