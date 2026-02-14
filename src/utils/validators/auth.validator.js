const { z } = require('zod');
const { PASSWORD_MIN_LENGTH } = require('../../config/constants');

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
  name: z.string().min(1, 'Name is required').max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const setupAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  orgName: z.string().min(1).max(100).optional(),
  orgSlug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only').optional(),
  inviteCode: z.string().min(1).optional(),
}).refine(
  (data) => data.orgName || data.inviteCode,
  { message: 'Either orgName (to create an org) or inviteCode (to join an org) is required' }
);

module.exports = { registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema, setupAccountSchema };
