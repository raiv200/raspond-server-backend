const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { getRandomColor, OTP_EXPIRY_MINUTES, ORG_ROLES } = require('../config/constants');
const { generateUniqueSlug } = require('../utils/slugify');
const { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } = require('../utils/errors');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpExpiry() {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

async function register({ email, password, name }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError('An account with this email already exists');

  const passwordHash = await hashPassword(password);
  const otp = generateOtp();

  const user = await prisma.user.create({
    data: {
      email,
      name: name || email.split('@')[0],
      passwordHash,
      color: getRandomColor(),
      verifyOtp: otp,
      verifyExpires: getOtpExpiry(),
    },
    select: { id: true, email: true, name: true, avatar: true, color: true, emailVerified: true, createdAt: true },
  });

  const tokens = generateTokenPair(user);
  return { user, tokens, otp };
}

async function verifyEmail({ email, otp }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundError('User not found');
  if (user.emailVerified) throw new BadRequestError('Email is already verified');
  if (!user.verifyOtp || user.verifyOtp !== otp) throw new BadRequestError('Invalid OTP code');
  if (!user.verifyExpires || new Date() > user.verifyExpires) throw new BadRequestError('OTP has expired — request a new one');

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyOtp: null, verifyExpires: null },
  });

  return { message: 'Email verified successfully' };
}

async function resendOtp(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundError('User not found');
  if (user.emailVerified) throw new BadRequestError('Email is already verified');

  const otp = generateOtp();
  await prisma.user.update({
    where: { id: user.id },
    data: { verifyOtp: otp, verifyExpires: getOtpExpiry() },
  });

  return { otp, name: user.name };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  const tokens = generateTokenPair(user);

  // Check if user has an org (for frontend to know if setup is needed)
  const membership = await prisma.orgMember.findFirst({ where: { userId: user.id } });

  return {
    user: {
      id: user.id, email: user.email, name: user.name, avatar: user.avatar,
      title: user.title, color: user.color, emailVerified: user.emailVerified,
      hasOrg: !!membership, createdAt: user.createdAt,
    },
    tokens,
  };
}

/**
 * Account setup — two modes:
 * Mode A (creator):  { name, orgName }     → creates org, user becomes BID_MANAGER
 * Mode B (invited):  { name, inviteCode }  → joins existing org with invite's role
 */
async function setupAccount(userId, { name, orgName, orgSlug, inviteCode }) {
  // Check if user already has an org
  const existingMembership = await prisma.orgMember.findFirst({ where: { userId } });
  if (existingMembership) throw new BadRequestError('Account is already set up');

  // ─── Mode B: Join via invite code ───────────────────
  if (inviteCode) {
    const invite = await prisma.orgInvite.findUnique({
      where: { code: inviteCode },
      include: { org: true },
    });

    if (!invite) throw new NotFoundError('Invalid invite code');
    if (invite.status !== 'PENDING') throw new BadRequestError(`This invite has been ${invite.status.toLowerCase()}`);
    if (new Date() > invite.expiresAt) {
      await prisma.orgInvite.update({ where: { id: invite.id }, data: { status: 'EXPIRED' } });
      throw new BadRequestError('This invite has expired');
    }

    // Check not already a member (shouldn't happen since we checked above, but just in case)
    const alreadyMember = await prisma.orgMember.findUnique({
      where: { userId_orgId: { userId, orgId: invite.orgId } },
    });
    if (alreadyMember) throw new BadRequestError('You are already a member of this organization');

    const result = await prisma.$transaction(async (tx) => {
      // Update user name
      const user = await tx.user.update({
        where: { id: userId },
        data: { name },
        select: { id: true, email: true, name: true, avatar: true, color: true, emailVerified: true, createdAt: true },
      });

      // Add user to org with the invite's role
      await tx.orgMember.create({
        data: { userId, orgId: invite.orgId, role: invite.role },
      });

      // Mark invite as accepted
      await tx.orgInvite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' },
      });

      const org = await tx.organization.findUnique({
        where: { id: invite.orgId },
        include: { _count: { select: { members: true } } },
      });

      return { user, org };
    });

    return result;
  }

  // ─── Mode A: Create new org ─────────────────────────
  if (!orgName) throw new BadRequestError('Organization name is required');

  const slug = orgSlug || await generateUniqueSlug(orgName);

  // Check slug uniqueness
  const existingOrg = await prisma.organization.findUnique({ where: { slug } });
  if (existingOrg) throw new BadRequestError('Organization slug already taken');

  // Create org and membership in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, email: true, name: true, avatar: true, color: true, emailVerified: true, createdAt: true },
    });

    const org = await tx.organization.create({
      data: {
        name: orgName,
        slug,
        members: {
          create: {
            userId,
            role: ORG_ROLES.BID_MANAGER,
          },
        },
      },
      include: { _count: { select: { members: true } } },
    });

    return { user, org };
  });

  return result;
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, avatar: true, title: true, color: true,
      emailVerified: true, createdAt: true,
      memberships: {
        include: {
          org: {
            select: { id: true, name: true, slug: true, logo: true, _count: { select: { members: true } } },
          },
        },
      },
    },
  });

  if (!user) throw new NotFoundError('User not found');

  return {
    ...user,
    hasOrg: user.memberships.length > 0,
    org: user.memberships[0]?.org || null,
    role: user.memberships[0]?.role || null,
  };
}

async function refreshTokens(refreshToken) {
  const decoded = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw new UnauthorizedError('User not found');
  return generateTokenPair(user);
}

async function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, avatar: true, emailVerified: true },
  });
}

module.exports = { register, login, verifyEmail, resendOtp, getMe, refreshTokens, setupAccount, getUserByEmail };
