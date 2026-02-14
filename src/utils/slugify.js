const slugifyLib = require('slugify');
const prisma = require('../config/database');

async function generateUniqueSlug(name) {
  let slug = slugifyLib(name, { lower: true, strict: true, trim: true });

  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) {
    const suffix = Math.random().toString(36).substring(2, 6);
    slug = `${slug}-${suffix}`;
  }

  return slug;
}

function makeSlug(name) {
  return slugifyLib(name, { lower: true, strict: true, trim: true });
}

module.exports = { generateUniqueSlug, makeSlug };
