const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/hash');
const { BadRequestError, ConflictError } = require('../utils/errors');
const fs = require('fs');
const path = require('path');

async function updateProfile(userId, data) {
  if (data.email) {
    const existing = await prisma.user.findFirst({ where: { email: data.email, NOT: { id: userId } } });
    if (existing) throw new ConflictError('Email already in use');
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email, emailVerified: false }),
      ...(data.title !== undefined && { title: data.title }),
    },
    select: { id: true, email: true, name: true, avatar: true, title: true, color: true, emailVerified: true },
  });
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw new BadRequestError('Current password is incorrect');

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { message: 'Password updated successfully' };
}

async function uploadAvatar(userId, filePath) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.avatar) {
    const oldPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const avatarUrl = `/uploads/avatars/${path.basename(filePath)}`;
  return prisma.user.update({ where: { id: userId }, data: { avatar: avatarUrl }, select: { id: true, avatar: true } });
}

async function removeAvatar(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.avatar) {
    const filePath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  return prisma.user.update({ where: { id: userId }, data: { avatar: null }, select: { id: true, avatar: true } });
}

module.exports = { updateProfile, changePassword, uploadAvatar, removeAvatar };
