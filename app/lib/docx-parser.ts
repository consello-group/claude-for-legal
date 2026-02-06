/**
 * DOCX Parser - Converts Word documents into structured blocks with stable IDs
 *
 * Uses mammoth.js to extract text and structure, then assigns UUIDs to each
 * paragraph/heading block for tracking through the analysis pipeline.
 */

import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import type { DocumentBlock, ParsedDocument } from './types';

/**
 * Parse a DOCX file buffer into a structured document with block IDs
 */
export async function parseDocx(buffer: ArrayBuffer, filename: string = 'document.docx'): Promise<ParsedDocument> {
  // Extract raw text with paragraph markers
  const textResult = await mammoth.extractRawText({ arrayBuffer: buffer });

  // Also get HTML for better structure detection
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer: buffer });

  const blocks: DocumentBlock[] = [];
  let charOffset = 0;

  // Split text into paragraphs (mammoth uses double newlines between paragraphs)
  const paragraphs = textResult.value.split(/\n\n+/);

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    // Detect block type
    const blockType = detectBlockType(trimmedPara);
    const headingLevel = blockType === 'heading' ? detectHeadingLevel(trimmedPara) : undefined;

    const block: DocumentBlock = {
      id: uuidv4(),
      type: blockType,
      content: trimmedPara,
      charStart: charOffset,
      charEnd: charOffset + trimmedPara.length,
      level: headingLevel,
    };

    // Detect list items
    const listMatch = trimmedPara.match(/^(\s*)([•\-\*]|\d+[\.\)])\s+(.+)$/);
    if (listMatch) {
      block.type = 'list-item';
      block.listInfo = {
        type: /^\d+/.test(listMatch[2]) ? 'numbered' : 'bullet',
        level: Math.floor(listMatch[1].length / 2),
        index: blocks.filter(b => b.type === 'list-item').length,
      };
    }

    blocks.push(block);
    charOffset += trimmedPara.length + 2; // +2 for paragraph separator
  }

  // Build the full text and annotated text
  const fullText = blocks.map(b => b.content).join('\n\n');
  const annotatedText = generateAnnotatedText(blocks);

  // Check for tables/lists in HTML
  const hasTablesOrLists =
    htmlResult.value.includes('<table') ||
    htmlResult.value.includes('<ul') ||
    htmlResult.value.includes('<ol');

  return {
    filename,
    blocks,
    fullText,
    annotatedText,
    metadata: {
      wordCount: fullText.split(/\s+/).filter(w => w.length > 0).length,
      blockCount: blocks.length,
      hasTablesOrLists,
      parseDate: new Date().toISOString(),
    },
  };
}

/**
 * Detect whether a paragraph is a heading or regular paragraph
 */
function detectBlockType(text: string): DocumentBlock['type'] {
  // Numbered section headers: "1. DEFINITIONS", "2.1 Exclusions", "ARTICLE III"
  if (/^(\d+(\.\d+)*\.?\s+)?[A-Z][A-Z\s]{2,}$/.test(text)) {
    return 'heading';
  }

  // Section with number prefix and title case or caps
  if (/^\d+(\.\d+)*\.?\s+[A-Z]/.test(text) && text.length < 100) {
    return 'heading';
  }

  // ARTICLE or SECTION markers
  if (/^(ARTICLE|SECTION|EXHIBIT|SCHEDULE|ANNEX)\s+[IVX\d]+/i.test(text)) {
    return 'heading';
  }

  // All caps short text (likely a header)
  if (text === text.toUpperCase() && text.length < 80 && text.length > 3) {
    return 'heading';
  }

  return 'paragraph';
}

/**
 * Detect heading level from numbering pattern
 */
function detectHeadingLevel(text: string): number {
  // "1." = level 1, "1.1" = level 2, "1.1.1" = level 3
  const numberMatch = text.match(/^(\d+(\.\d+)*)/);
  if (numberMatch) {
    const parts = numberMatch[1].split('.');
    return Math.min(parts.length, 6);
  }

  // ARTICLE = level 1
  if (/^ARTICLE\s+/i.test(text)) return 1;

  // SECTION = level 2
  if (/^SECTION\s+/i.test(text)) return 2;

  // All caps without number = level 1
  if (text === text.toUpperCase()) return 1;

  return 2;
}

/**
 * Generate annotated text with block markers for LLM consumption
 * Format: [BLOCK:uuid]content[/BLOCK]
 */
function generateAnnotatedText(blocks: DocumentBlock[]): string {
  return blocks.map(block => {
    const prefix = block.type === 'heading'
      ? `\n### [BLOCK:${block.id}] `
      : `[BLOCK:${block.id}] `;
    return `${prefix}${block.content} [/BLOCK]`;
  }).join('\n\n');
}

/**
 * Create a lookup map from block ID to block index
 */
export function createBlockLookup(blocks: DocumentBlock[]): Map<string, number> {
  const lookup = new Map<string, number>();
  blocks.forEach((block, index) => {
    lookup.set(block.id, index);
  });
  return lookup;
}

/**
 * Find a block by its ID
 */
export function findBlockById(blocks: DocumentBlock[], id: string): DocumentBlock | undefined {
  return blocks.find(b => b.id === id);
}

/**
 * Get blocks that contain a specific text substring
 */
export function findBlocksByText(blocks: DocumentBlock[], searchText: string): DocumentBlock[] {
  const lowerSearch = searchText.toLowerCase();
  return blocks.filter(b => b.content.toLowerCase().includes(lowerSearch));
}

/**
 * Extract section headings for building a clause map
 */
export function extractClauseMap(blocks: DocumentBlock[]): Array<{
  id: string;
  title: string;
  level: number;
}> {
  return blocks
    .filter(b => b.type === 'heading')
    .map(b => ({
      id: b.id,
      title: b.content,
      level: b.level || 1,
    }));
}
