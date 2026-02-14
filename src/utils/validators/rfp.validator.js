const { z } = require('zod');

const createRfpFromStructureSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  company: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedValue: z.number().optional(),
  members: z.array(z.string()).optional(), // userIds to give RFP access
  sections: z.array(z.object({
    title: z.string().min(1),
    order: z.number().int().min(0),
    questions: z.array(z.object({
      title: z.string().min(1),
      fullQuestion: z.string().min(1),
      description: z.string().optional(),
      order: z.number().int().min(0),
      maxChars: z.number().int().optional(),
    })),
  })).min(1, 'At least one section is required'),
});

const updateRfpSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  company: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  estimatedValue: z.number().optional().nullable(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'SUBMITTED', 'ARCHIVED']).optional(),
});

const updateStructureSchema = z.object({
  sections: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    order: z.number().int().min(0),
    questions: z.array(z.object({
      id: z.string().optional(),
      title: z.string().min(1),
      fullQuestion: z.string().min(1),
      description: z.string().optional(),
      order: z.number().int().min(0),
      maxChars: z.number().int().optional(),
    })),
  })),
});

const saveAnswerSchema = z.object({
  answer: z.string().optional().nullable(),
  answerJson: z.string().optional().nullable(),
});

const bulkAssignmentSchema = z.object({
  assignments: z.array(z.object({
    sectionId: z.string(),
    writers: z.array(z.string()).default([]),
    approvers: z.array(z.object({
      userId: z.string(),
      order: z.number().int().min(0),
    })).default([]),
  })),
  globalApprovers: z.array(z.object({
    userId: z.string(),
    order: z.number().int().min(0),
  })).default([]),
});

const addRfpMembersSchema = z.object({
  userIds: z.array(z.string()).min(1),
});

module.exports = {
  createRfpFromStructureSchema,
  updateRfpSchema,
  updateStructureSchema,
  saveAnswerSchema,
  bulkAssignmentSchema,
  addRfpMembersSchema,
};
