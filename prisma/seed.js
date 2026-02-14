const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  await prisma.submission.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.rfpGlobalApprover.deleteMany();
  await prisma.sectionAssignment.deleteMany();
  await prisma.sectionAccess.deleteMany();
  await prisma.question.deleteMany();
  await prisma.section.deleteMany();
  await prisma.rfpMember.deleteMany();
  await prisma.rfp.deleteMany();
  await prisma.orgInvite.deleteMany();
  await prisma.orgMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.create({ data: { email: 'alice@example.com', name: 'Alice Johnson', passwordHash: hash, color: '#3B82F6', emailVerified: true, title: 'Bid Manager' } });
  const bob = await prisma.user.create({ data: { email: 'bob@example.com', name: 'Bob Smith', passwordHash: hash, color: '#EF4444', emailVerified: true, title: 'Technical Lead' } });
  const carol = await prisma.user.create({ data: { email: 'carol@example.com', name: 'Carol Davis', passwordHash: hash, color: '#10B981', emailVerified: true, title: 'Security Expert' } });
  const dave = await prisma.user.create({ data: { email: 'dave@example.com', name: 'Dave Wilson', passwordHash: hash, color: '#F59E0B', emailVerified: true, title: 'Content Writer' } });

  console.log('✅ Users created');

  const org = await prisma.organization.create({ data: { name: 'TechCorp Solutions', slug: 'techcorp' } });

  await prisma.orgMember.create({ data: { userId: alice.id, orgId: org.id, role: 'BID_MANAGER' } });
  await prisma.orgMember.create({ data: { userId: bob.id, orgId: org.id, role: 'BID_EXECUTIVE' } });
  await prisma.orgMember.create({ data: { userId: carol.id, orgId: org.id, role: 'TEAM_MEMBER' } });
  await prisma.orgMember.create({ data: { userId: dave.id, orgId: org.id, role: 'TEAM_MEMBER' } });

  console.log('✅ Organization "TechCorp Solutions" created');

  const rfp = await prisma.rfp.create({
    data: {
      title: 'Enterprise Cloud Solutions RFP', company: 'MegaCorp Inc.',
      dueDate: new Date('2026-03-15'), estimatedValue: 450000,
      status: 'IN_PROGRESS', orgId: org.id, createdById: alice.id,
    },
  });

  // Add RFP members (alice sees all as BID_MANAGER, bob/carol/dave are explicit members)
  await prisma.rfpMember.createMany({
    data: [
      { userId: alice.id, rfpId: rfp.id },
      { userId: bob.id, rfpId: rfp.id },
      { userId: carol.id, rfpId: rfp.id },
      { userId: dave.id, rfpId: rfp.id },
    ],
  });

  const s1 = await prisma.section.create({ data: { rfpId: rfp.id, title: 'Company Information', order: 1, questions: { create: [
    { title: 'Company Overview', fullQuestion: 'Provide an overview of your company.', order: 1 },
    { title: 'Leadership Team', fullQuestion: 'Describe your leadership team.', order: 2 },
  ] } } });

  const s2 = await prisma.section.create({ data: { rfpId: rfp.id, title: 'Technical Requirements', order: 2, questions: { create: [
    { title: 'System Architecture', fullQuestion: 'Describe your proposed system architecture.', order: 1 },
    { title: 'Scalability', fullQuestion: 'How does your solution handle scaling?', order: 2 },
    { title: 'API Integration', fullQuestion: 'Describe your API capabilities.', order: 3 },
  ] } } });

  const s3 = await prisma.section.create({ data: { rfpId: rfp.id, title: 'Security & Compliance', order: 3, questions: { create: [
    { title: 'Security Framework', fullQuestion: 'Describe your security framework.', order: 1 },
    { title: 'Data Encryption', fullQuestion: 'Explain your data encryption approach.', order: 2 },
  ] } } });

  // Section access for team members (carol gets s2, dave gets s1+s3)
  await prisma.sectionAccess.createMany({ data: [
    { sectionId: s2.id, userId: carol.id, permission: 'EDIT' },
    { sectionId: s1.id, userId: dave.id, permission: 'EDIT' },
    { sectionId: s3.id, userId: dave.id, permission: 'VIEW' },
  ] });

  // Assignments
  await prisma.sectionAssignment.createMany({ data: [
    { sectionId: s1.id, userId: dave.id, role: 'WRITER' },
    { sectionId: s2.id, userId: carol.id, role: 'WRITER' },
    { sectionId: s3.id, userId: bob.id, role: 'WRITER' },
    { sectionId: s1.id, userId: bob.id, role: 'APPROVER', order: 1 },
    { sectionId: s2.id, userId: alice.id, role: 'APPROVER', order: 1 },
  ] });

  await prisma.rfpGlobalApprover.create({ data: { rfpId: rfp.id, userId: alice.id, order: 1 } });

  console.log('✅ Sample RFP created with section-level access');
  console.log('\n🌱 Seed complete!\n');
  console.log('Login credentials (password: password123):');
  console.log('  alice@example.com  — Bid Manager (sees all)');
  console.log('  bob@example.com    — Bid Executive (assigned RFPs, all sections)');
  console.log('  carol@example.com  — Team Member (only Technical Requirements section)');
  console.log('  dave@example.com   — Team Member (Company Info=EDIT, Security=VIEW only)');
}

main().catch((e) => { console.error('❌', e); process.exit(1); }).finally(() => prisma.$disconnect());
