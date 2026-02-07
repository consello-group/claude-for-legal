import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { toPromptString } from '../../lib/playbook';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const LEGAL_PLAYBOOK = toPromptString();

const BLOCK_REFERENCE_INSTRUCTIONS = `
If the document has block IDs in the format [BLOCK:uuid]content[/BLOCK]:
1. Reference the specific block IDs in "sourceBlockIds"
2. Include a short sourceQuote (max 150 chars) from the problematic text
3. For each YELLOW or RED issue, include "editPlans" with specific text changes referencing blockIds and character offsets within the block content.

editPlans example:
"editPlans": [
  {
    "variant": "preferred",
    "description": "Why this change is recommended",
    "operations": [
      {
        "id": "edit-1",
        "type": "replace_range",
        "blockId": "the-block-uuid",
        "startChar": 25,
        "endChar": 52,
        "newText": "replacement text from playbook standard",
        "comment": "Brief explanation for Word comment",
        "issueId": "issue-1"
      }
    ]
  }
]

Operation types: "replace_range" (replace text at startChar-endChar with newText), "delete_range" (remove text at startChar-endChar), "insert_after" (add newText after the block).
Use the playbook standard positions for replacement text. Character offsets are 0-based within the block content string.
If no block IDs are present in the document, omit editPlans.
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
      "sourceQuote": "Quote (max 150 chars)",
      "editPlans": []
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

    // Use streaming to provide real-time progress
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6144,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ],
      system: UNIFIED_ANALYSIS_PROMPT,
    });

    // Create SSE response stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const send = (data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        let fullText = '';
        let tokenCount = 0;
        const estimatedTokens = 3500; // Rough estimate for progress bar (includes editPlans)

        try {
          stream.on('text', (text) => {
            fullText += text;
            tokenCount += text.split(/\s+/).length; // Rough word-based approximation
            const progress = Math.min(Math.round((tokenCount / estimatedTokens) * 90), 90);
            send({ type: 'progress', progress, tokens: tokenCount });
          });

          const finalMessage = await stream.finalMessage();

          // Parse the complete response
          let jsonStr = fullText.trim();

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

          const usage = {
            input_tokens: finalMessage.usage.input_tokens,
            output_tokens: finalMessage.usage.output_tokens,
          };

          // Check if it's a contract
          if (analysisJson.isContract === false) {
            send({
              type: 'complete',
              result: {
                success: true,
                isContract: false,
                documentType: analysisJson.documentType || 'Unknown',
                notContractReason: analysisJson.notContractReason || 'This document does not appear to be a legal contract.',
                usage,
              }
            });
          } else {
            if (!analysisJson.classification) {
              throw new Error('Missing classification in analysis JSON');
            }

            send({
              type: 'complete',
              result: {
                success: true,
                isContract: true,
                analysis: analysisJson,
                rawAnalysis: fullText,
                usage,
              }
            });
          }
        } catch (err) {
          console.error('Stream/parse error:', err);
          send({ type: 'error', message: err.message || 'Analysis failed' });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
