import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const LEGAL_PLAYBOOK = `
## Contract Review Positions

### Limitation of Liability
- **Standard position**: Mutual cap at 12 months of fees paid or payable
- **Acceptable range**: 6-24 months of fees
- **Escalation trigger**: Uncapped liability, inclusion of consequential damages, or unilateral caps

### Indemnification
- **Standard position**: Mutual indemnification for IP infringement and data breach
- **Acceptable**: Indemnification limited to third-party claims only
- **Escalation trigger**: Unilateral indemnification obligations, unlimited indemnity

### IP Ownership
- **Standard position**: Each party retains pre-existing IP; customer owns customer data
- **Escalation trigger**: Broad IP assignment clauses, work-for-hire provisions

### Confidentiality
- **Standard position**: Mutual confidentiality with standard carveouts
- **Term**: 2-3 years standard, up to 5 years for trade secrets
- **Required carveouts**: Independently developed, publicly available, rightfully received, required by law, prior possession
- **Escalation trigger**: Perpetual obligations, missing critical carveouts

### Term and Termination
- **Standard position**: Annual term with 30-day termination for convenience
- **Escalation trigger**: No termination for convenience, excessive early termination penalties

### Governing Law
- **Preferred**: New York, Delaware
- **Acceptable**: California, England & Wales
- **Escalation trigger**: Non-standard jurisdictions, mandatory arbitration

## NDA Screening Criteria

### Structure
- **Required**: Mutual obligations for exploratory discussions
- **Acceptable**: Unilateral only when one party is disclosing

### Term
- **Standard**: 2-3 years for agreement term
- **Survival**: 2-5 years from disclosure
- **Escalation trigger**: Terms exceeding 5 years or perpetual

### Required Carveouts (ALL must be present)
1. Information already publicly available
2. Information independently developed
3. Information rightfully received from third parties
4. Disclosure required by law (with notice where permitted)
5. Prior possession

### Prohibited Provisions (trigger RED)
- Non-compete clauses
- Non-solicitation of employees
- Exclusivity provisions
- Broad residuals clauses
- IP assignment or licensing
- Audit rights

## Risk Classification

### GREEN - Standard Approval
- All standard positions met
- No escalation triggers
- Approve via delegation

### YELLOW - Counsel Review
- Minor deviations within acceptable ranges
- 1-2 negotiable issues
- Route to designated reviewer

### RED - Escalate
- Outside acceptable ranges
- Escalation triggers present
- Requires senior counsel
`;

const NDA_TRIAGE_PROMPT = `You are a legal analyst for Consello LLC reviewing NDAs against the organizational playbook.

${LEGAL_PLAYBOOK}

Analyze the provided NDA document and produce a structured triage report.

OUTPUT FORMAT (use this exact structure):

## NDA Triage Report

**Classification**: [🟢 GREEN / 🟡 YELLOW / 🔴 RED] — [Brief summary]
**Document**: [filename or "Provided NDA"]
**Parties**: [Party A] ↔ [Party B] (or indicate direction for unilateral)
**Type**: [Mutual / Unilateral (disclosing) / Unilateral (receiving)]
**Term**: [X years] with [Y-year] survival
**Governing Law**: [Jurisdiction]

---

## Screening Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| Mutual Obligations | ✅ PASS / ⚠️ FLAG / ❌ FAIL | [Brief note] |
| Term Length | ✅/⚠️/❌ | [Note] |
| Survival Period | ✅/⚠️/❌ | [Note] |
| Public Info Carveout | ✅/⚠️/❌ | [Note] |
| Prior Possession | ✅/⚠️/❌ | [Note] |
| Independent Development | ✅/⚠️/❌ | [Note] |
| Legal Compulsion | ✅/⚠️/❌ | [Note] |
| Third-Party Receipt | ✅/⚠️/❌ | [Note] |
| Non-Compete Clause | ✅/⚠️/❌ | [Note] |
| Non-Solicitation | ✅/⚠️/❌ | [Note] |
| Governing Law | ✅/⚠️/❌ | [Note] |
| Remedies | ✅/⚠️/❌ | [Note] |

---

## Issues Found

[For each issue, use this format:]

### Issue N — [YELLOW/RED]: [Issue Title]
**What**: [Description of the problematic provision]
**Risk**: [Business/legal risk this creates]
**Recommendation**: [Specific action to take]

---

## Recommendation

[Clear recommendation: approve, negotiate specific terms, or reject with counterproposal]

## Next Steps

1. [Specific action]
2. [Specific action]
3. [Specific action]

---

*This analysis assists with legal workflows but does not constitute legal advice.*`;

const CONTRACT_REVIEW_PROMPT = `You are a legal analyst for Consello LLC reviewing contracts against the organizational playbook.

${LEGAL_PLAYBOOK}

Analyze the provided contract and produce a structured review report.

OUTPUT FORMAT:

## Contract Review Summary

**Document**: [name]
**Parties**: [names and roles]
**Contract Type**: [Service Agreement / License / etc.]
**Your Side**: [vendor/customer/etc.]
**Overall Assessment**: [🟢 GREEN / 🟡 YELLOW / 🔴 RED]

---

## Key Findings

[Top 3-5 issues with severity indicators]

---

## Clause-by-Clause Analysis

### [Clause Category] — [🟢/🟡/🔴]
**Contract says**: [summary of actual language]
**Playbook position**: [what our standard is]
**Deviation**: [describe the gap, if any]
**Business impact**: [what this means practically]
**Redline suggestion**: [specific alternative language if needed]

[Repeat for each major clause category: Liability, Indemnification, IP, Data Protection, Confidentiality, Term, Governing Law, Payment]

---

## Negotiation Strategy

**Must-haves**: [Non-negotiable changes]
**Nice-to-haves**: [Preferred but flexible]
**Concession candidates**: [What we could give up]

## Next Steps

1. [Action]
2. [Action]

---

*This analysis assists with legal workflows but does not constitute legal advice.*`;

export async function POST(request) {
  try {
    // Check password
    const authHeader = request.headers.get('x-app-password');
    if (authHeader !== process.env.APP_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { document, analysisType, filename } = body;

    if (!document) {
      return NextResponse.json(
        { error: 'Document content is required' },
        { status: 400 }
      );
    }

    const systemPrompt = analysisType === 'contract-review'
      ? CONTRACT_REVIEW_PROMPT
      : NDA_TRIAGE_PROMPT;

    const userMessage = `Please analyze this document:

Filename: ${filename || 'document.txt'}

---
${document}
---

Provide your analysis following the specified output format.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ],
      system: systemPrompt,
    });

    const analysisText = message.content[0].text;

    return NextResponse.json({
      success: true,
      analysis: analysisText,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
