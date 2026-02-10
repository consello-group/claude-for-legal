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

For each issue with editPlans, also include "diffSegments" with word-level diff tokens keyed by variant ("preferred" and/or "fallback"). Each segment has "type" ("unchanged"/"delete"/"insert") and "text". Cover the full clause around the edit for context so the user can see what changes in situ.

diffSegments example:
"diffSegments": {
  "preferred": [
    { "type": "unchanged", "text": "The Receiving Party shall maintain confidentiality for a period of " },
    { "type": "delete", "text": "five (5)" },
    { "type": "insert", "text": "three (3)" },
    { "type": "unchanged", "text": " years from the date of disclosure." }
  ]
}
`;

// ============================================
// STAGE 1 — Pre-screen prompt (Haiku 4.5, fast & cheap)
// ============================================

const PRESCREEN_PROMPT = `You classify documents. Determine if this is a legal contract or agreement.

Legal contracts/agreements include:
- NDAs, Confidentiality Agreements
- Service Agreements, MSAs, SaaS Agreements
- Employment, Consulting, or Vendor Agreements
- Purchase Agreements, License Agreements
- Letters of Intent with binding provisions
- Amendments to existing agreements

NOT legal contracts:
- Marketing materials, brochures, pitch decks
- Internal memos, meeting notes, articles, blog posts
- Resumes, CVs, general correspondence
- Technical documentation, user manuals
- Financial statements, reports

Return ONLY valid JSON:
{"isContract": true, "documentType": "NDA"} or {"isContract": false, "documentType": "Resume", "notContractReason": "This appears to be a resume."}`;

// ============================================
// STAGE 2 — Full analysis prompt (Sonnet 4.5, deep review)
// ============================================

const ANALYSIS_PROMPT = `You are a legal analyst for Consello LLC. Analyze this legal document against the organizational playbook.

${LEGAL_PLAYBOOK}

${BLOCK_REFERENCE_INSTRUCTIONS}

Return a JSON object with this EXACT structure:

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
      "editPlans": [],
      "diffSegments": {
        "preferred": [
          { "type": "unchanged", "text": "existing clause text " },
          { "type": "delete", "text": "problematic language" },
          { "type": "insert", "text": "recommended replacement" },
          { "type": "unchanged", "text": " remaining text." }
        ]
      }
    }
  ],
  "recommendation": "Overall recommendation",
  "nextSteps": ["Step 1", "Step 2"]
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
// Helpers
// ============================================

/** Extract first complete JSON object from a string */
function extractJson(raw) {
  let str = raw.trim();
  if (str.startsWith('```json')) str = str.slice(7);
  else if (str.startsWith('```')) str = str.slice(3);
  if (str.endsWith('```')) str = str.slice(0, -3);
  str = str.trim();

  const startIdx = str.indexOf('{');
  if (startIdx === -1) throw new Error('No JSON object found in response');

  let braceCount = 0;
  let endIdx = -1;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '{') braceCount++;
    if (str[i] === '}') braceCount--;
    if (braceCount === 0) { endIdx = i; break; }
  }
  if (endIdx === -1) throw new Error('Unbalanced JSON braces in response');

  return JSON.parse(str.slice(startIdx, endIdx + 1));
}

// ============================================
// API Handler — two-stage pipeline
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

    // Truncate document for pre-screen (first ~3000 chars is plenty to classify)
    const prescreenDoc = document.length > 3000
      ? document.slice(0, 3000) + '\n\n[...document truncated for classification...]'
      : document;

    // Create SSE response stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const send = (data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // ── Stage 1: Haiku pre-screen ──
          send({ type: 'progress', progress: 2, stage: 'prescreen' });

          const prescreenResult = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 256,
            system: PRESCREEN_PROMPT,
            messages: [{
              role: 'user',
              content: `Classify this document:\n\nFilename: ${filename || 'document.txt'}\n\n---\n${prescreenDoc}\n---\n\nReturn ONLY valid JSON.`,
            }],
          });

          const prescreenText = prescreenResult.content[0]?.text || '';
          const prescreenJson = extractJson(prescreenText);

          const prescreenUsage = {
            input_tokens: prescreenResult.usage.input_tokens,
            output_tokens: prescreenResult.usage.output_tokens,
          };

          send({
            type: 'prescreen',
            isContract: prescreenJson.isContract,
            documentType: prescreenJson.documentType,
          });

          // If not a contract, short-circuit — no need for the expensive call
          if (prescreenJson.isContract === false) {
            send({
              type: 'complete',
              result: {
                success: true,
                isContract: false,
                documentType: prescreenJson.documentType || 'Unknown',
                notContractReason: prescreenJson.notContractReason || 'This document does not appear to be a legal contract.',
                usage: prescreenUsage,
              },
            });
            controller.close();
            return;
          }

          // ── Stage 2: Sonnet 4.5 full analysis ──
          send({ type: 'progress', progress: 10, stage: 'analysis' });

          const userMessage = `Analyze this ${prescreenJson.documentType || 'legal document'}:

Filename: ${filename || 'document.txt'}

---
${document}
---

Return ONLY valid JSON as specified in the system prompt.`;

          const stream = anthropic.messages.stream({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 8192,
            messages: [{ role: 'user', content: userMessage }],
            system: ANALYSIS_PROMPT,
          });

          let fullText = '';
          let tokenCount = 0;
          const estimatedTokens = 3500;

          stream.on('text', (text) => {
            fullText += text;
            tokenCount += text.split(/\s+/).length;
            // Progress 10-90 for the analysis stage
            const progress = 10 + Math.min(Math.round((tokenCount / estimatedTokens) * 80), 80);
            send({ type: 'progress', progress, tokens: tokenCount, stage: 'analysis' });
          });

          const finalMessage = await stream.finalMessage();
          const analysisJson = extractJson(fullText);

          const usage = {
            input_tokens: prescreenUsage.input_tokens + finalMessage.usage.input_tokens,
            output_tokens: prescreenUsage.output_tokens + finalMessage.usage.output_tokens,
          };

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
            },
          });
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
