// ─── Roles ──────────────────────────────────────────────────
const ORG_ROLES = {
  BID_MANAGER: 'BID_MANAGER',
  BID_EXECUTIVE: 'BID_EXECUTIVE',
  TEAM_MEMBER: 'TEAM_MEMBER',
};

// Role hierarchy: BID_MANAGER > BID_EXECUTIVE > TEAM_MEMBER
const ROLE_HIERARCHY = {
  BID_MANAGER: 3,
  BID_EXECUTIVE: 2,
  TEAM_MEMBER: 1,
};

const RFP_STATUSES = {
  DRAFT: 'DRAFT',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  COMPLETED: 'COMPLETED',
  SUBMITTED: 'SUBMITTED',
  ARCHIVED: 'ARCHIVED',
};

const APPROVAL_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
};

const INVITE_STATUSES = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
};

// ─── Upload limits ──────────────────────────────────────────
const AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2MB
const DOCUMENT_MAX_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

// ─── Auth ───────────────────────────────────────────────────
const JWT_ACCESS_EXPIRY = '7d';
const JWT_REFRESH_EXPIRY = '30d';
const INVITE_EXPIRY_DAYS = 7;
const PASSWORD_MIN_LENGTH = 8;
const OTP_EXPIRY_MINUTES = 10;

// ─── User colors for avatars ────────────────────────────────
const USER_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
  '#6366F1', '#14B8A6', '#E11D48', '#84CC16',
];

function getRandomColor() {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

// ─── Dummy RFP structure (for upload endpoint) ──────────────
const DUMMY_RFP_STRUCTURE = {
  title: 'Enterprise Cloud Solutions RFP',
  sections: [
    {
      title: 'Company Information', order: 1,
      questions: [
        { title: 'Company Overview', fullQuestion: 'Provide an overview of your company and its history in the cloud solutions industry.', order: 1 },
        { title: 'Leadership Team', fullQuestion: 'Describe your leadership team and their relevant experience.', order: 2 },
        { title: 'Company Size', fullQuestion: 'What is the current size of your organization (employees, offices, revenue)?', order: 3 },
        { title: 'Certifications', fullQuestion: 'List all relevant industry certifications and compliance standards your company holds.', order: 4 },
      ],
    },
    {
      title: 'Technical Requirements', order: 2,
      questions: [
        { title: 'System Architecture', fullQuestion: 'Describe your proposed system architecture for our enterprise cloud deployment.', order: 1 },
        { title: 'Scalability', fullQuestion: 'How does your solution handle scaling from 1,000 to 100,000+ concurrent users?', order: 2 },
        { title: 'API Integration', fullQuestion: 'Describe your API integration capabilities and supported protocols.', order: 3 },
        { title: 'Data Migration', fullQuestion: 'What is your approach to migrating our existing data (estimated 50TB) to your platform?', order: 4 },
      ],
    },
    {
      title: 'Security & Compliance', order: 3,
      questions: [
        { title: 'Security Framework', fullQuestion: 'Describe your security framework and how it aligns with ISO 27001 standards.', order: 1 },
        { title: 'Data Encryption', fullQuestion: 'Explain your data encryption approach for data at rest and in transit.', order: 2 },
        { title: 'Access Controls', fullQuestion: 'How do you implement role-based access controls and multi-factor authentication?', order: 3 },
        { title: 'Incident Response', fullQuestion: 'Describe your incident response procedures and SLAs for security events.', order: 4 },
      ],
    },
    {
      title: 'Pricing & Commercial', order: 4,
      questions: [
        { title: 'Pricing Model', fullQuestion: 'Provide a detailed breakdown of your pricing model including all tiers and add-ons.', order: 1 },
        { title: 'Contract Terms', fullQuestion: 'What are your standard contract terms and minimum commitment periods?', order: 2 },
        { title: 'SLA Guarantees', fullQuestion: 'Detail your SLA guarantees including uptime, response times, and penalty structures.', order: 3 },
        { title: 'Volume Discounts', fullQuestion: 'Do you offer volume discounts or enterprise pricing for large deployments?', order: 4 },
      ],
    },
    {
      title: 'Implementation & Support', order: 5,
      questions: [
        { title: 'Implementation Timeline', fullQuestion: 'Provide a detailed implementation timeline with key milestones.', order: 1 },
        { title: 'Training Plan', fullQuestion: 'Describe your training program for our IT team and end users.', order: 2 },
        { title: 'Support Channels', fullQuestion: 'What support channels do you offer (24/7 phone, email, chat)?', order: 3 },
        { title: 'Onboarding Process', fullQuestion: 'Walk us through your typical customer onboarding process.', order: 4 },
      ],
    },
    {
      title: 'References & Case Studies', order: 6,
      questions: [
        { title: 'Client References', fullQuestion: 'Provide at least 3 references from similar enterprise clients.', order: 1 },
        { title: 'Case Study', fullQuestion: 'Share a detailed case study of a similar deployment.', order: 2 },
        { title: 'Industry Experience', fullQuestion: 'Describe your experience working with companies in our sector.', order: 3 },
        { title: 'Awards & Recognition', fullQuestion: 'List any industry awards or analyst recognition your solution has received.', order: 4 },
      ],
    },
  ],
};


// ─── Random RFP question pool ──────────────────────────────
const RFP_TITLE_POOL = [
  'Enterprise Cloud Solutions RFP', 'Digital Transformation Platform RFP',
  'Cybersecurity Assessment RFP', 'Data Analytics Platform RFP',
  'CRM Implementation RFP', 'Network Infrastructure Upgrade RFP',
  'AI/ML Solutions RFP', 'Healthcare IT Systems RFP',
  'E-Commerce Platform RFP', 'Supply Chain Management RFP',
];

const SECTION_POOL = [
  { title: 'Company Information', questions: [
    { title: 'Company Overview', fullQuestion: 'Provide a brief overview of your company.' },
    { title: 'Company History', fullQuestion: 'Describe your company history and experience.' },
    { title: 'Certifications', fullQuestion: 'List all relevant certifications and compliance standards.' },
    { title: 'Leadership Team', fullQuestion: 'Describe your leadership team and their experience.' },
  ]},
  { title: 'Technical Requirements', questions: [
    { title: 'System Architecture', fullQuestion: 'Describe your proposed system architecture.' },
    { title: 'Scalability', fullQuestion: 'Explain how your solution handles scalability.' },
    { title: 'API Integration', fullQuestion: 'Describe your API capabilities.' },
    { title: 'Data Migration', fullQuestion: 'What is your approach to data migration?' },
  ]},
  { title: 'Security & Compliance', questions: [
    { title: 'Security Architecture', fullQuestion: 'Describe your security measures.' },
    { title: 'Data Protection', fullQuestion: 'How do you protect customer data?' },
    { title: 'Access Controls', fullQuestion: 'Describe your role-based access controls.' },
    { title: 'Incident Response', fullQuestion: 'Detail your incident response procedures.' },
  ]},
  { title: 'Pricing & Commercial', questions: [
    { title: 'Pricing Model', fullQuestion: 'Provide detailed pricing information.' },
    { title: 'Contract Terms', fullQuestion: 'What are your standard contract terms?' },
    { title: 'SLA Guarantees', fullQuestion: 'Detail your SLA guarantees.' },
    { title: 'Volume Discounts', fullQuestion: 'Do you offer volume discounts?' },
  ]},
  { title: 'Implementation & Support', questions: [
    { title: 'Implementation Timeline', fullQuestion: 'Provide a detailed implementation timeline.' },
    { title: 'Training Plan', fullQuestion: 'Describe your training program.' },
    { title: 'Support Channels', fullQuestion: 'What support channels do you offer?' },
    { title: 'Onboarding Process', fullQuestion: 'Walk us through your onboarding process.' },
  ]},
  { title: 'References & Case Studies', questions: [
    { title: 'Client References', fullQuestion: 'Provide at least 3 references from similar clients.' },
    { title: 'Case Study', fullQuestion: 'Share a detailed case study of a similar deployment.' },
    { title: 'Industry Experience', fullQuestion: 'Describe your experience in our sector.' },
  ]},
];

function generateRandomStructure() {
  const title = RFP_TITLE_POOL[Math.floor(Math.random() * RFP_TITLE_POOL.length)];
  const shuffled = [...SECTION_POOL].sort(() => Math.random() - 0.5);
  const numSections = 3 + Math.floor(Math.random() * 3);
  const sections = shuffled.slice(0, numSections).map((s, i) => {
    const shuffledQ = [...s.questions].sort(() => Math.random() - 0.5);
    const numQ = 2 + Math.floor(Math.random() * 3);
    return { title: s.title, order: i + 1, questions: shuffledQ.slice(0, numQ).map((q, j) => ({ ...q, order: j + 1 })) };
  });
  return { title, sections };
}

module.exports = {
  ORG_ROLES,
  ROLE_HIERARCHY,
  RFP_STATUSES,
  APPROVAL_STATUSES,
  INVITE_STATUSES,
  AVATAR_MAX_SIZE,
  DOCUMENT_MAX_SIZE,
  ALLOWED_AVATAR_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
  INVITE_EXPIRY_DAYS,
  PASSWORD_MIN_LENGTH,
  OTP_EXPIRY_MINUTES,
  USER_COLORS,
  getRandomColor,
  DUMMY_RFP_STRUCTURE,
  generateRandomStructure,
};
