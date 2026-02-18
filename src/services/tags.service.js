const prisma = require('../config/database');
const { NotFoundError } = require('../utils/errors');
const { randomUUID } = require('crypto');

async function createTag(orgId, userId, { header, subheader }) {
  return prisma.tag.create({
    data: {
      id: randomUUID(),
      orgId,
      header,
      subheader,
      createdBy: userId,
    },
  });
}

async function bulkCreateTags(orgId, userId, tags) {
  // tags = [{ header: 'Company', subheaders: ['Overview', 'Leadership'] }, ...]
  const rows = tags.flatMap((group) =>
    group.subheaders.map((subheader) => ({
      id: randomUUID(),
      orgId,
      header: group.header,
      subheader,
      createdBy: userId,
    }))
  );
  return prisma.tag.createMany({ data: rows });
}

async function getAllTags(orgId) {
  return prisma.tag.findMany({
    where: { orgId, deletedAt: null },
    orderBy: [{ header: 'asc' }, { subheader: 'asc' }],
  });
}

async function getTagById(id, orgId) {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag || tag.orgId !== orgId || tag.deletedAt) throw new NotFoundError('Tag not found');
  return tag;
}

async function updateTag(id, orgId, data) {
  await getTagById(id, orgId);
  return prisma.tag.update({ where: { id }, data });
}

async function deleteTag(id, orgId) {
  await getTagById(id, orgId);
  return prisma.tag.update({ where: { id }, data: { deletedAt: new Date() } });
}

async function getUniqueHeaders(orgId) {
  const tags = await prisma.tag.findMany({
    where: { orgId, deletedAt: null },
    select: { header: true },
    distinct: ['header'],
    orderBy: { header: 'asc' },
  });
  return tags.map((t) => t.header);
}

async function getTagsByHeader(orgId, header) {
  return prisma.tag.findMany({
    where: { orgId, header, deletedAt: null },
    orderBy: { subheader: 'asc' },
  });
}

async function getTagStats(orgId) {
  const tags = await prisma.tag.findMany({
    where: { orgId, deletedAt: null },
    orderBy: [{ header: 'asc' }, { subheader: 'asc' }],
  });

  return Promise.all(
    tags.map(async (tag) => {
      const entries = await prisma.document_tags.count({ where: { tagId: tag.id } });
      return { ...tag, entries };
    })
  );
}

module.exports = {
  createTag,
  bulkCreateTags,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  getUniqueHeaders,
  getTagsByHeader,
  getTagStats,
};
