export const CONTENT_LEVELS = {
  1: { label: "Level 1 — Manager", description: "Trends & strategic overview" },
  2: { label: "Level 2 — Analyst", description: "Forensic deep-dive" },
  3: { label: "Level 3 — Engineer", description: "Code-heavy implementation" },
} as const;

export const BLOG_TEMPLATES = {
  blank: {
    label: "Blank",
    description: "Start from scratch with no preset content",
    categories: [],
    tags: [],
  },
  "fraud-intel": {
    label: "Fraud Intelligence",
    description: "Pre-configured for fraud analysis content",
    categories: [
      { name: "Fraud Patterns", slug: "fraud-patterns" },
      { name: "Case Studies", slug: "case-studies" },
      { name: "Threat Intel", slug: "threat-intel" },
    ],
    tags: [
      { name: "AML", slug: "aml" },
      { name: "KYC", slug: "kyc" },
      { name: "Synthetic ID", slug: "synthetic-id" },
      { name: "Account Takeover", slug: "account-takeover" },
    ],
  },
  engineering: {
    label: "Engineering",
    description: "Pre-configured for technical engineering content",
    categories: [
      { name: "Architecture", slug: "architecture" },
      { name: "APIs", slug: "apis" },
      { name: "Infrastructure", slug: "infrastructure" },
    ],
    tags: [
      { name: "Backend", slug: "backend" },
      { name: "Frontend", slug: "frontend" },
      { name: "DevOps", slug: "devops" },
      { name: "Performance", slug: "performance" },
    ],
  },
  compliance: {
    label: "Compliance",
    description: "Pre-configured for regulatory and compliance content",
    categories: [
      { name: "Regulations", slug: "regulations" },
      { name: "Audit", slug: "audit" },
      { name: "Risk", slug: "risk" },
    ],
    tags: [
      { name: "SOX", slug: "sox" },
      { name: "PCI", slug: "pci" },
      { name: "GDPR", slug: "gdpr" },
      { name: "BSA", slug: "bsa" },
    ],
  },
} as const;

export type TemplateKey = keyof typeof BLOG_TEMPLATES;

export const POST_STATUSES = ["Draft", "Published", "Unpublished"] as const;

export const SEO_LIMITS = {
  title: { amber: 50, red: 60 },
  metaDescription: { amber: 150, red: 160 },
} as const;
