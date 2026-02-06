/**
 * Document Annotator - Utilities for annotating documents with block markers
 * and generating context for LLM analysis.
 */

import type { DocumentBlock, ParsedDocument, AnalysisIssue } from './types';

/**
 * Generate annotated text with block markers for LLM consumption
 * Format: [BLOCK:uuid]content[/BLOCK]
 *
 * The LLM can reference these block IDs when identifying issues.
 */
export function generateAnnotatedText(blocks: DocumentBlock[]): string {
  return blocks.map(block => {
    const typeMarker = block.type === 'heading' ? `[H${block.level || 1}]` : '';
    return `[BLOCK:${block.id}]${typeMarker} ${block.content} [/BLOCK]`;
  }).join('\n\n');
}

/**
 * Generate a more readable version with section numbers for context
 */
export function generateReadableAnnotatedText(blocks: DocumentBlock[]): string {
  let sectionCount = 0;
  let subsectionCount = 0;

  return blocks.map(block => {
    let prefix = '';

    if (block.type === 'heading') {
      if (block.level === 1) {
        sectionCount++;
        subsectionCount = 0;
        prefix = `\n--- SECTION ${sectionCount} ---\n`;
      } else {
        subsectionCount++;
        prefix = `\n-- ${sectionCount}.${subsectionCount} --\n`;
      }
    }

    return `${prefix}[BLOCK:${block.id}] ${block.content} [/BLOCK]`;
  }).join('\n\n');
}

/**
 * Create a document summary for LLM context
 */
export function generateDocumentSummary(doc: ParsedDocument): string {
  const headings = doc.blocks.filter(b => b.type === 'heading');

  return `Document: ${doc.filename}
Word Count: ${doc.metadata.wordCount}
Block Count: ${doc.metadata.blockCount}
Has Tables/Lists: ${doc.metadata.hasTablesOrLists}

Document Structure:
${headings.map(h => `${'  '.repeat((h.level || 1) - 1)}- ${h.content}`).join('\n')}
`;
}

/**
 * Extract quote from blocks given block IDs
 */
export function extractQuoteFromBlocks(
  blocks: DocumentBlock[],
  blockIds: string[],
  maxLength: number = 200
): string {
  const relevantBlocks = blocks.filter(b => blockIds.includes(b.id));
  const fullText = relevantBlocks.map(b => b.content).join(' ');

  if (fullText.length <= maxLength) {
    return fullText;
  }

  return fullText.substring(0, maxLength - 3) + '...';
}

/**
 * Validate that block IDs in issues exist in the document
 */
export function validateIssueBlockReferences(
  issues: AnalysisIssue[],
  blocks: DocumentBlock[]
): { valid: boolean; invalidRefs: string[] } {
  const blockIds = new Set(blocks.map(b => b.id));
  const invalidRefs: string[] = [];

  for (const issue of issues) {
    for (const blockId of issue.sourceBlockIds) {
      if (!blockIds.has(blockId)) {
        invalidRefs.push(`Issue "${issue.title}" references invalid block: ${blockId}`);
      }
    }
  }

  return {
    valid: invalidRefs.length === 0,
    invalidRefs,
  };
}

/**
 * Build a block ID to issue mapping for highlighting
 */
export function buildBlockToIssueMap(
  issues: AnalysisIssue[]
): Map<string, AnalysisIssue[]> {
  const map = new Map<string, AnalysisIssue[]>();

  for (const issue of issues) {
    for (const blockId of issue.sourceBlockIds) {
      const existing = map.get(blockId) || [];
      existing.push(issue);
      map.set(blockId, existing);
    }
  }

  return map;
}

/**
 * Find the nearest heading for a given block
 */
export function findParentHeading(
  blocks: DocumentBlock[],
  blockId: string
): DocumentBlock | null {
  const blockIndex = blocks.findIndex(b => b.id === blockId);
  if (blockIndex === -1) return null;

  // Walk backwards to find the nearest heading
  for (let i = blockIndex - 1; i >= 0; i--) {
    if (blocks[i].type === 'heading') {
      return blocks[i];
    }
  }

  return null;
}

/**
 * Get all blocks within a section (between two headings of the same or higher level)
 */
export function getBlocksInSection(
  blocks: DocumentBlock[],
  headingId: string
): DocumentBlock[] {
  const headingIndex = blocks.findIndex(b => b.id === headingId);
  if (headingIndex === -1) return [];

  const heading = blocks[headingIndex];
  if (heading.type !== 'heading') return [];

  const sectionBlocks: DocumentBlock[] = [heading];
  const headingLevel = heading.level || 1;

  // Collect all blocks until we hit another heading of the same or higher level
  for (let i = headingIndex + 1; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === 'heading' && (block.level || 1) <= headingLevel) {
      break;
    }
    sectionBlocks.push(block);
  }

  return sectionBlocks;
}

/**
 * Generate the LLM analysis prompt header with block reference instructions
 */
export function generateBlockReferenceInstructions(): string {
  return `
IMPORTANT: The document has been annotated with block IDs in the format: [BLOCK:uuid]content[/BLOCK]

When you identify issues, you MUST:
1. Reference the specific block ID(s) where the issue appears in the "sourceBlockIds" array
2. Include an exact quote from the document in "sourceQuote"
3. Provide edit operations that reference these block IDs

Example issue format:
{
  "id": "issue-1",
  "severity": "yellow",
  "title": "Extended Liability Cap",
  "description": "The liability cap extends to 36 months...",
  "risk": "Exceeds our standard 12-month position",
  "recommendation": "Negotiate down to 12-24 months",
  "sourceBlockIds": ["abc-123-def"],
  "sourceQuote": "liability shall be capped at thirty-six (36) months",
  "editPlans": [
    {
      "variant": "preferred",
      "description": "Reduce to standard 12-month cap",
      "operations": [
        {
          "id": "edit-1",
          "type": "replace_range",
          "blockId": "abc-123-def",
          "startChar": 25,
          "endChar": 52,
          "newText": "twelve (12) months",
          "comment": "Reduced liability cap to Consello standard",
          "issueId": "issue-1"
        }
      ]
    }
  ]
}
`;
}
