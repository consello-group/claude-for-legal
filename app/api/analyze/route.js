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

// ============================================
// LEGACY MARKDOWN PROMPTS (for backward compatibility)
// ============================================

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

// ============================================
// ENHANCED JSON PROMPTS (with block references)
// ============================================

const BLOCK_REFERENCE_INSTRUCTIONS = `
IMPORTANT: The document has been annotated with block IDs in the format: [BLOCK:uuid]content[/BLOCK]

When you identify issues, you MUST:
1. Reference the specific block ID(s) where the issue appears in the "sourceBlockIds" array
2. Include an exact quote from the document in "sourceQuote"
3. Provide edit operations that reference these block IDs with character offsets

EDIT OPERATION RULES:
- Use "replace_range" with EXACT substrings that appear in the block
- Keep formatting-neutral (no markdown in replacement text)
- Keep changes clause-local - don't change surrounding context
- Do NOT change business economics unless the playbook requires it; if you do, flag it in the comment

Each issue should have:
- A "preferred" variant (stronger Consello position)
- A "fallback" variant (acceptable compromise) when applicable
`;

const NDA_TRIAGE_JSON_PROMPT = `You are a legal analyst for Consello LLC reviewing NDAs against the organizational playbook.

${LEGAL_PLAYBOOK}

${BLOCK_REFERENCE_INSTRUCTIONS}

Analyze the provided NDA document and return a JSON object with this EXACT structure:

{
  "classification": "green" | "yellow" | "red",
  "level": "GREEN" | "YELLOW" | "RED",
  "summary": "Brief 1-sentence summary",
  "document": "filename",
  "parties": "Party A ↔ Party B",
  "type": "Mutual | Unilateral (disclosing) | Unilateral (receiving)",
  "term": "X years with Y-year survival",
  "governingLaw": "Jurisdiction",
  "screening": [
    {
      "criterion": "Mutual Obligations",
      "status": "pass" | "flag" | "fail",
      "note": "Brief explanation"
    }
  ],
  "issues": [
    {
      "id": "issue-1",
      "severity": "yellow" | "red",
      "title": "Issue title",
      "description": "What the problematic provision says",
      "risk": "Business/legal risk this creates",
      "recommendation": "Specific action to take",
      "sourceBlockIds": ["block-uuid-1", "block-uuid-2"],
      "sourceQuote": "Exact quote from document (max 200 chars)",
      "editPlans": [
        {
          "variant": "preferred",
          "description": "Why this change",
          "operations": [
            {
              "id": "edit-1",
              "type": "replace_range",
              "blockId": "block-uuid",
              "startChar": 0,
              "endChar": 50,
              "newText": "Replacement text",
              "comment": "Explanation for Word comment",
              "issueId": "issue-1"
            }
          ]
        },
        {
          "variant": "fallback",
          "description": "Compromise position",
          "operations": [...]
        }
      ]
    }
  ],
  "recommendation": "Overall recommendation paragraph",
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}

SCREENING CRITERIA to evaluate:
- Mutual Obligations
- Term Length
- Survival Period
- Public Info Carveout
- Prior Possession
- Independent Development
- Legal Compulsion
- Third-Party Receipt
- Non-Compete Clause
- Non-Solicitation
- Governing Law
- Remedies

Return ONLY valid JSON. No markdown, no explanation text outside the JSON.`;

const CONTRACT_REVIEW_JSON_PROMPT = `You are a legal analyst for Consello LLC reviewing contracts against the organizational playbook.

${LEGAL_PLAYBOOK}

${BLOCK_REFERENCE_INSTRUCTIONS}

Analyze the provided contract and return a JSON object with this EXACT structure:

{
  "classification": "green" | "yellow" | "red",
  "level": "GREEN" | "YELLOW" | "RED",
  "summary": "Brief 1-sentence summary",
  "document": "filename",
  "parties": "Party names and roles",
  "type": "Service Agreement | License | etc.",
  "term": "Contract duration",
  "governingLaw": "Jurisdiction",
  "screening": [
    {
      "criterion": "Limitation of Liability",
      "status": "pass" | "flag" | "fail",
      "note": "Brief explanation of what the contract says vs playbook"
    }
  ],
  "issues": [
    {
      "id": "issue-1",
      "severity": "yellow" | "red",
      "title": "Issue title",
      "description": "What the contract clause says",
      "risk": "Business/legal risk this creates",
      "recommendation": "Specific action to take",
      "sourceBlockIds": ["block-uuid-1"],
      "sourceQuote": "Exact quote from document",
      "editPlans": [
        {
          "variant": "preferred",
          "description": "Consello standard position",
          "operations": [
            {
              "id": "edit-1",
              "type": "replace_range",
              "blockId": "block-uuid",
              "startChar": 0,
              "endChar": 50,
              "newText": "Replacement language",
              "comment": "Explanation for Word comment",
              "issueId": "issue-1"
            }
          ]
        },
        {
          "variant": "fallback",
          "description": "Acceptable compromise",
          "operations": [...]
        }
      ]
    }
  ],
  "recommendation": "Overall recommendation paragraph",
  "nextSteps": ["Step 1", "Step 2"]
}

SCREENING CRITERIA to evaluate:
- Limitation of Liability
- Indemnification
- IP Ownership
- Confidentiality
- Data Protection
- Term and Termination
- Governing Law
- Payment Terms

Return ONLY valid JSON. No markdown, no explanation text outside the JSON.`;

// ============================================
// API Handler
// ============================================

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
    const { document, analysisType, filename, outputFormat = 'markdown' } = body;

    if (!document) {
      return NextResponse.json(
        { error: 'Document content is required' },
        { status: 400 }
      );
    }

    // Select prompt based on analysis type and output format
    let systemPrompt;
    if (outputFormat === 'json') {
      systemPrompt = analysisType === 'contract-review'
        ? CONTRACT_REVIEW_JSON_PROMPT
        : NDA_TRIAGE_JSON_PROMPT;
    } else {
      systemPrompt = analysisType === 'contract-review'
        ? CONTRACT_REVIEW_PROMPT
        : NDA_TRIAGE_PROMPT;
    }

    const userMessage = `Please analyze this document:

Filename: ${filename || 'document.txt'}

---
${document}
---

${outputFormat === 'json' ? 'Return ONLY valid JSON as specified in the system prompt.' : 'Provide your analysis following the specified output format.'}`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 8192, // Increased for JSON output with edit plans
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ],
      system: systemPrompt,
    });

    const analysisText = message.content[0].text;

    // If JSON format requested, try to parse and validate
    if (outputFormat === 'json') {
      try {
        // Extract JSON from response (in case there's any wrapper text)
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }

        const analysisJson = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (!analysisJson.classification || !analysisJson.issues) {
          throw new Error('Missing required fields in analysis JSON');
        }

        return NextResponse.json({
          success: true,
          analysis: analysisJson,
          rawAnalysis: analysisText,
          outputFormat: 'json',
          usage: {
            input_tokens: message.usage.input_tokens,
            output_tokens: message.usage.output_tokens,
          }
        });
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Fall back to returning raw text
        return NextResponse.json({
          success: true,
          analysis: analysisText,
          outputFormat: 'markdown',
          parseError: parseError.message,
          usage: {
            input_tokens: message.usage.input_tokens,
            output_tokens: message.usage.output_tokens,
          }
        });
      }
    }

    // Markdown format (legacy)
    return NextResponse.json({
      success: true,
      analysis: analysisText,
      outputFormat: 'markdown',
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
