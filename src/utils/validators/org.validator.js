const { z } = require('zod');

const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
});

const inviteMemberSchema = z.object({
  emails: z.array(z.string().email()).min(1, 'At least one email is required'),
  role: z.enum(['BID_EXECUTIVE', 'TEAM_MEMBER']).default('TEAM_MEMBER'),
});

const updateMemberRoleSchema = z.object({
  role: z.enum(['BID_EXECUTIVE', 'TEAM_MEMBER']),
});

module.exports = { updateOrgSchema, inviteMemberSchema, updateMemberRoleSchema };
