/**
 * Structured playbook data for Consello's legal review framework.
 * Source of truth used by both the /playbook visualization page
 * and the /api/analyze route (via toPromptString()).
 */

// ============================================
// Types
// ============================================

export interface PlaybookClause {
  id: string;
  category: string;
  standardPosition: string;
  acceptableRange?: string;
  escalationTrigger: string;
  appliesTo: ('nda' | 'service' | 'license')[];
  /** For clauses with numeric thresholds */
  threshold?: {
    unit: string;
    standard: number;
    min: number;
    max: number;
  };
}

export interface ScreeningDefault {
  category: string;
  items: { label: string; detail: string }[];
}

export interface ClassificationLevel {
  level: 'GREEN' | 'YELLOW' | 'RED';
  label: string;
  description: string;
  action: string;
  timeline: string;
}

// ============================================
// Clause Positions (full playbook)
// ============================================

export const PLAYBOOK_CLAUSES: PlaybookClause[] = [
  {
    id: 'liability-cap',
    category: 'Limitation of Liability',
    standardPosition: 'Mutual cap at 12 months of fees paid or payable',
    acceptableRange: '6-24 months of fees',
    escalationTrigger: 'Uncapped liability, inclusion of consequential damages, or unilateral caps',
    appliesTo: ['service', 'license'],
    threshold: { unit: 'months', standard: 12, min: 6, max: 24 },
  },
  {
    id: 'indemnification',
    category: 'Indemnification',
    standardPosition: 'Mutual indemnification for IP infringement and data breach caused by the indemnifying party',
    acceptableRange: 'Indemnification limited to third-party claims only',
    escalationTrigger: 'Unilateral indemnification obligations, unlimited indemnity, or indemnification for gross negligence/willful misconduct of the other party',
    appliesTo: ['service', 'license'],
  },
  {
    id: 'ip-ownership',
    category: 'IP Ownership',
    standardPosition: 'Each party retains all pre-existing IP; customer owns customer data; no assignment of background IP',
    acceptableRange: 'License grants for purpose of performing services',
    escalationTrigger: 'Broad IP assignment clauses, work-for-hire provisions for pre-existing IP, or restrictions on using general knowledge/skills',
    appliesTo: ['service', 'license'],
  },
  {
    id: 'data-protection',
    category: 'Data Protection',
    standardPosition: 'Require DPA for any personal data processing; sub-processor notification rights; data deletion on termination',
    acceptableRange: 'GDPR/CCPA compliance, breach notification within 72 hours, data localization where required',
    escalationTrigger: 'No DPA offered, unsafe cross-border transfers, or unlimited sub-processor rights',
    appliesTo: ['service', 'license'],
  },
  {
    id: 'confidentiality',
    category: 'Confidentiality',
    standardPosition: 'Mutual confidentiality obligations with standard carveouts (2-3 year term, up to 5 years for trade secrets)',
    acceptableRange: 'Required carveouts: independently developed, publicly available, rightfully received from third party, required by law',
    escalationTrigger: 'Perpetual obligations, missing critical carveouts, or overbroad definitions',
    appliesTo: ['nda', 'service', 'license'],
    threshold: { unit: 'years', standard: 3, min: 2, max: 5 },
  },
  {
    id: 'term-termination',
    category: 'Term & Termination',
    standardPosition: 'Annual term with 30-day termination for convenience after initial term',
    acceptableRange: 'Multi-year terms with termination for convenience after initial term',
    escalationTrigger: 'Auto-renewal without adequate notice (less than 60 days), no termination for convenience, or excessive early termination penalties',
    appliesTo: ['service', 'license'],
    threshold: { unit: 'months', standard: 12, min: 12, max: 36 },
  },
  {
    id: 'governing-law',
    category: 'Governing Law',
    standardPosition: 'New York or Delaware',
    acceptableRange: 'California, England & Wales, other major commercial jurisdictions',
    escalationTrigger: 'Non-standard jurisdictions, mandatory arbitration with unfavorable rules, or venue outside major commercial centers',
    appliesTo: ['nda', 'service', 'license'],
  },
  {
    id: 'payment-terms',
    category: 'Payment Terms',
    standardPosition: 'Net 30 from invoice date',
    acceptableRange: 'Net 45-60 for enterprise clients',
    escalationTrigger: 'Payment in advance for full term, automatic price escalation without caps, or late payment interest above 1.5% per month',
    appliesTo: ['service', 'license'],
  },
  {
    id: 'insurance',
    category: 'Insurance',
    standardPosition: 'Commercial general liability ($1M), professional liability/E&O ($1M), cyber liability ($1M)',
    acceptableRange: 'Reasonable variations based on deal size',
    escalationTrigger: 'Requirements exceeding $5M without justification or unusual coverage types',
    appliesTo: ['service'],
  },
];

// ============================================
// NDA Screening Defaults
// ============================================

export const NDA_SCREENING: ScreeningDefault[] = [
  {
    category: 'Structure & Term',
    items: [
      { label: 'Mutual Obligations', detail: 'Required for exploratory discussions; unilateral only when one party is disclosing' },
      { label: 'Agreement Term', detail: '2-3 years standard' },
      { label: 'Confidentiality Survival', detail: '2-5 years from disclosure' },
    ],
  },
  {
    category: 'Required Carveouts',
    items: [
      { label: 'Publicly Available Information', detail: 'Must be present' },
      { label: 'Independently Developed', detail: 'Must be present' },
      { label: 'Third-Party Receipt', detail: 'Rightfully received from third parties' },
      { label: 'Legal Compulsion', detail: 'Disclosure required by law, with notice where permitted' },
      { label: 'Prior Possession', detail: 'Must be present' },
    ],
  },
  {
    category: 'Prohibited Provisions',
    items: [
      { label: 'Non-Compete Clauses', detail: 'Triggers RED classification' },
      { label: 'Non-Solicitation', detail: 'Employee non-solicitation triggers RED' },
      { label: 'Exclusivity Provisions', detail: 'Triggers RED classification' },
      { label: 'Broad Residuals Clauses', detail: 'Acceptable only if limited to unaided memory; must exclude trade secrets' },
      { label: 'IP Assignment or Licensing', detail: 'Triggers RED classification' },
      { label: 'Audit Rights', detail: 'Triggers RED classification' },
    ],
  },
];

// ============================================
// Classification Framework
// ============================================

export const CLASSIFICATION_LEVELS: ClassificationLevel[] = [
  {
    level: 'GREEN',
    label: 'Standard Approval',
    description: 'All standard positions met or exceeded. No escalation triggers present.',
    action: 'Approve per delegation of authority',
    timeline: 'Same day',
  },
  {
    level: 'YELLOW',
    label: 'Counsel Review',
    description: 'Minor deviations from standard positions. Within acceptable ranges. One or two issues to negotiate.',
    action: 'Route to designated reviewer',
    timeline: '1-2 business days',
  },
  {
    level: 'RED',
    label: 'Escalate',
    description: 'Outside acceptable ranges. Escalation triggers present. May need counterproposal with standard terms.',
    action: 'Full legal review, prepare counterproposal',
    timeline: '3-5 business days',
  },
];

// ============================================
// Prompt Serializer
// ============================================

/**
 * Serialize the playbook to the markdown format used in the Claude system prompt.
 * This replaces the inline LEGAL_PLAYBOOK constant in the analyze route.
 */
export function toPromptString(): string {
  let md = '## Contract Review Positions\n\n';

  for (const clause of PLAYBOOK_CLAUSES) {
    md += `### ${clause.category}\n`;
    md += `- **Standard position**: ${clause.standardPosition}\n`;
    if (clause.acceptableRange) {
      md += `- **Acceptable range**: ${clause.acceptableRange}\n`;
    }
    md += `- **Escalation trigger**: ${clause.escalationTrigger}\n\n`;
  }

  md += '## NDA Screening Criteria\n\n';

  for (const section of NDA_SCREENING) {
    md += `### ${section.category}\n`;
    if (section.category === 'Required Carveouts') {
      md += 'All of the following must be present:\n';
      section.items.forEach((item, i) => {
        md += `${i + 1}. ${item.label}\n`;
      });
    } else if (section.category === 'Prohibited Provisions') {
      md += 'The following trigger RED classification:\n';
      section.items.forEach(item => {
        md += `- ${item.label}\n`;
      });
    } else {
      section.items.forEach(item => {
        md += `- **${item.label}**: ${item.detail}\n`;
      });
    }
    md += '\n';
  }

  md += '## Risk Classification\n\n';

  for (const level of CLASSIFICATION_LEVELS) {
    md += `### ${level.level} - ${level.label}\n`;
    md += `- ${level.description}\n`;
    md += `- Route: ${level.action}\n\n`;
  }

  return md;
}
