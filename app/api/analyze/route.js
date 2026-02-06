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

// ============================================
// UNIFIED CONTRACT ANALYSIS PROMPT
// ============================================

const UNIFIED_ANALYSIS_PROMPT = `You are a legal analyst for Consello LLC. Your job is to analyze legal documents against the organizational playbook.

FIRST: Determine if this document is a legal contract or agreement.

Legal contracts/agreements include:
- Non-Disclosure Agreements (NDAs), Confidentiality Agreements
- Service Agreements, Master Service Agreements (MSAs)
- Software License Agreements, SaaS Agreements
- Employment Agreements, Consulting Agreements
- Purchase Agreements, Vendor Agreements
- Letters of Intent (LOIs) with binding provisions
- Amendments to existing agreements

NOT legal contracts (return isContract: false):
- Marketing materials, brochures, pitch decks
- Internal memos, meeting notes
- Articles, blog posts, news
- Resumes, CVs
- General correspondence without legal obligations
- Technical documentation, user manuals
- Financial statements, reports

${LEGAL_PLAYBOOK}

${BLOCK_REFERENCE_INSTRUCTIONS}

Analyze the document and return a JSON object with this EXACT structure:

{
  "isContract": true | false,
  "documentType": "NDA | Service Agreement | License Agreement | Employment Agreement | Other Contract | Not a Contract",
  "notContractReason": "Only if isContract is false - explain what the document actually is",

  // The following fields are ONLY included if isContract is true:
  "classification": "green" | "yellow" | "red",
  "level": "GREEN" | "YELLOW" | "RED",
  "summary": "Brief 1-sentence summary of the analysis",
  "document": "filename",
  "parties": "Party A ↔ Party B (or describe the parties)",
  "type": "Specific contract type (Mutual NDA, Service Agreement, etc.)",
  "term": "Contract duration and any survival periods",
  "governingLaw": "Jurisdiction",
  "screening": [
    {
      "criterion": "Criterion name",
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
          "description": "Why this change - stronger Consello position",
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
          "description": "Acceptable compromise position",
          "operations": [...]
        }
      ]
    }
  ],
  "recommendation": "Overall recommendation paragraph",
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}

SCREENING CRITERIA - evaluate all that apply based on document type:

For NDAs:
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

For Service/License Agreements:
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
    const { document, filename } = body;

    if (!document) {
      return NextResponse.json(
        { error: 'Document content is required' },
        { status: 400 }
      );
    }

    const userMessage = `Please analyze this document:

Filename: ${filename || 'document.txt'}

---
${document}
---

Return ONLY valid JSON as specified in the system prompt. First determine if this is a legal contract, then analyze accordingly.`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ],
      system: UNIFIED_ANALYSIS_PROMPT,
    });

    const analysisText = message.content[0].text;

    try {
      // Extract JSON from response (in case there's any wrapper text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      const analysisJson = JSON.parse(jsonMatch[0]);

      // Check if it's a contract
      if (analysisJson.isContract === false) {
        return NextResponse.json({
          success: true,
          isContract: false,
          documentType: analysisJson.documentType || 'Unknown',
          notContractReason: analysisJson.notContractReason || 'This document does not appear to be a legal contract.',
          usage: {
            input_tokens: message.usage.input_tokens,
            output_tokens: message.usage.output_tokens,
          }
        });
      }

      // Validate required fields for contracts
      if (!analysisJson.classification) {
        throw new Error('Missing classification in analysis JSON');
      }

      return NextResponse.json({
        success: true,
        isContract: true,
        analysis: analysisJson,
        rawAnalysis: analysisText,
        usage: {
          input_tokens: message.usage.input_tokens,
          output_tokens: message.usage.output_tokens,
        }
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse analysis response',
        rawAnalysis: analysisText,
        parseError: parseError.message,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
