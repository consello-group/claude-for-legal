import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { toPromptString } from '../../lib/playbook';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const LEGAL_PLAYBOOK = toPromptString();

const BLOCK_REFERENCE_INSTRUCTIONS = `
If the document has block IDs in the format [BLOCK:uuid]content[/BLOCK], reference them in sourceBlockIds.
Include a short sourceQuote (max 150 chars) from the problematic text.
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
  "isContract": true,
  "documentType": "NDA",
  "classification": "green",
  "level": "GREEN",
  "summary": "Brief summary",
  "document": "filename",
  "parties": "Party A ↔ Party B",
  "type": "Mutual NDA",
  "term": "2 years",
  "governingLaw": "New York",
  "screening": [
    {"criterion": "Criterion name", "status": "pass", "note": "Brief note"}
  ],
  "issues": [
    {
      "id": "issue-1",
      "severity": "yellow",
      "title": "Issue title",
      "description": "What the provision says",
      "risk": "Business risk",
      "recommendation": "Action to take",
      "sourceBlockIds": [],
      "sourceQuote": "Quote (max 150 chars)"
    }
  ],
  "recommendation": "Overall recommendation",
  "nextSteps": ["Step 1", "Step 2"]
}

If NOT a contract, return:
{
  "isContract": false,
  "documentType": "Not a Contract",
  "notContractReason": "This appears to be a resume/article/memo/etc."
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
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
      // Extract JSON from response - find the outermost balanced braces
      let jsonStr = analysisText.trim();

      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      // Find the first { and match to its closing }
      const startIdx = jsonStr.indexOf('{');
      if (startIdx === -1) {
        throw new Error('No JSON object found in response');
      }

      // Find matching closing brace
      let braceCount = 0;
      let endIdx = -1;
      for (let i = startIdx; i < jsonStr.length; i++) {
        if (jsonStr[i] === '{') braceCount++;
        if (jsonStr[i] === '}') braceCount--;
        if (braceCount === 0) {
          endIdx = i;
          break;
        }
      }

      if (endIdx === -1) {
        throw new Error('Unbalanced JSON braces in response');
      }

      jsonStr = jsonStr.slice(startIdx, endIdx + 1);
      const analysisJson = JSON.parse(jsonStr);

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
