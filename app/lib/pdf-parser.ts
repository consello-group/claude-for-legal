/**
 * PDF Parser - Extracts text from PDF files and creates blocks with UUIDs
 */

import { v4 as uuidv4 } from 'uuid';
import type { DocumentBlock, ParsedDocument } from './types';

// Dynamic import for pdf-parse (CommonJS module)
let pdfParse: any = null;

async function getPdfParse() {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default;
  }
  return pdfParse;
}

/**
 * Parse a PDF buffer into a structured document with block IDs
 */
export async function parsePdf(
  buffer: ArrayBuffer,
  filename: string = 'document.pdf'
): Promise<ParsedDocument> {
  const pdf = await getPdfParse();

  // Convert ArrayBuffer to Buffer for pdf-parse
  const nodeBuffer = Buffer.from(buffer);

  // Parse the PDF
  const data = await pdf(nodeBuffer);

  // Split text into paragraphs (double newlines or page breaks)
  const rawText = data.text || '';
  const paragraphs = rawText
    .split(/\n\s*\n|\f/) // Split on double newlines or form feeds (page breaks)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);

  // Create blocks with UUIDs
  const blocks: DocumentBlock[] = [];
  let charPosition = 0;

  for (const paragraph of paragraphs) {
    const blockType = detectBlockType(paragraph);
    const block: DocumentBlock = {
      id: uuidv4(),
      type: blockType.type,
      content: paragraph,
      charStart: charPosition,
      charEnd: charPosition + paragraph.length,
    };

    if (blockType.level) {
      block.level = blockType.level;
    }

    blocks.push(block);
    charPosition += paragraph.length + 2; // +2 for the paragraph break
  }

  // Generate annotated text for LLM consumption
  const annotatedText = blocks
    .map((block) => {
      const typeMarker = block.type === 'heading' ? `[H${block.level || 1}]` : '';
      return `[BLOCK:${block.id}]${typeMarker} ${block.content} [/BLOCK]`;
    })
    .join('\n\n');

  return {
    filename,
    blocks,
    fullText: rawText,
    annotatedText,
    metadata: {
      wordCount: rawText.split(/\s+/).filter((w: string) => w.length > 0).length,
      blockCount: blocks.length,
      hasTablesOrLists: rawText.includes('•') || rawText.includes('●') || /^\s*\d+\.\s/m.test(rawText),
      pageCount: data.numpages || 1,
    },
  };
}

/**
 * Detect if a paragraph is a heading based on common patterns
 */
function detectBlockType(text: string): { type: 'paragraph' | 'heading' | 'list-item'; level?: number } {
  const trimmed = text.trim();

  // Numbered section headings (1., 1.1, ARTICLE I, Section 1, etc.)
  if (/^(ARTICLE|SECTION|EXHIBIT)\s+[IVXLC\d]+/i.test(trimmed)) {
    return { type: 'heading', level: 1 };
  }

  if (/^\d+\.\s+[A-Z]/.test(trimmed) && trimmed.length < 100) {
    return { type: 'heading', level: 1 };
  }

  if (/^\d+\.\d+\.?\s+[A-Z]/.test(trimmed) && trimmed.length < 100) {
    return { type: 'heading', level: 2 };
  }

  // ALL CAPS headings (but not too long)
  if (trimmed === trimmed.toUpperCase() && trimmed.length < 80 && trimmed.length > 3) {
    return { type: 'heading', level: 1 };
  }

  // List items
  if (/^[\•\●\○\-\*]\s/.test(trimmed) || /^\([a-z]\)\s/i.test(trimmed)) {
    return { type: 'list-item' };
  }

  return { type: 'paragraph' };
}

/**
 * Create a lookup map for quick block access by ID
 */
export function createBlockLookup(blocks: DocumentBlock[]): Map<string, DocumentBlock> {
  return new Map(blocks.map((block) => [block.id, block]));
}
