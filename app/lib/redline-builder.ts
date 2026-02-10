/**
 * Redline DOCX Builder — Generates Word documents with tracked changes.
 *
 * Two modes:
 * 1. buildRedlineDocx() — Full tracked changes when editPlans are available
 * 2. buildClauseReviewDocx() — Branded clause review fallback
 */

import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  InsertedTextRun,
  DeletedTextRun,
  Header,
  Footer,
  AlignmentType,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  CommentRangeStart,
  CommentRangeEnd,
  CommentReference,
  PageNumber,
} from 'docx';
import type {
  ParsedDocument,
  DocumentBlock,
  EditOperation,
  AnalysisResult,
  ExportOptions,
} from './types';
import { findParentHeading } from './document-annotator';

// ── Constants ──

const FONT = 'Arial';
const CONSELLO_TERRACOTTA = 'A64A30';
const CLASSIFICATION_COLORS: Record<string, string> = {
  red: 'C62828',
  yellow: 'F9A825',
  green: '2E7D32',
};

// ── Helpers ──

function classificationLabel(c: string): string {
  if (c === 'red') return 'RED — ESCALATION REQUIRED';
  if (c === 'yellow') return 'YELLOW — COUNSEL REVIEW';
  return 'GREEN — STANDARD APPROVAL';
}

function nowISO(): string {
  return new Date().toISOString();
}

function dateLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/** Build a styled two-column summary table with cell shading */
function buildSummaryTable(result: AnalysisResult): Table {
  const rows = [
    ['Document', result.document || '—'],
    ['Parties', result.parties || '—'],
    ['Type', result.type || '—'],
    ['Term', result.term || '—'],
    ['Governing Law', result.governingLaw || '—'],
    ['Issues Found', String(result.issues?.length || 0)],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
    },
    rows: rows.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'F5F5F5', type: ShadingType.CLEAR, color: 'auto' },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({ text: label, bold: true, font: FONT, size: 20, color: '444444' })],
            })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({ text: value, font: FONT, size: 20 })],
            })],
          }),
        ],
      })
    ),
  });
}

function buildHeader(docName: string): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'CONSELLO', bold: true, font: FONT, size: 18, color: '000000' }),
          new TextRun({ text: '  ', font: FONT, size: 18 }),
          new TextRun({ text: '|', font: FONT, size: 18, color: CONSELLO_TERRACOTTA }),
          new TextRun({ text: '  ', font: FONT, size: 18 }),
          new TextRun({ text: `${docName} — Redline Review`, font: FONT, size: 18, color: '666666' }),
        ],
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 1, color: CONSELLO_TERRACOTTA },
        },
        spacing: { after: 200 },
      }),
    ],
  });
}

function buildFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
        },
        spacing: { before: 200 },
        children: [
          new TextRun({
            text: 'Confidential — Consello LLC',
            font: FONT, size: 14, color: '999999', bold: true,
          }),
          new TextRun({
            text: `  |  Generated ${dateLabel()}  |  `,
            font: FONT, size: 14, color: '999999',
          }),
          new TextRun({
            text: 'This analysis does not constitute legal advice.',
            font: FONT, size: 14, color: '999999', italics: true,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80 },
        children: [
          new TextRun({ text: 'Page ', font: FONT, size: 14, color: '999999' }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 14, color: '999999' }),
          new TextRun({ text: ' of ', font: FONT, size: 14, color: '999999' }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 14, color: '999999' }),
        ],
      }),
    ],
  });
}

// ── Core: Apply edits to a block ──

interface ChangeAttrs {
  author: string;
  date: string;
}

/**
 * Applies edit operations to a block's content, producing a mix of
 * TextRun, DeletedTextRun, and InsertedTextRun children.
 */
function applyEditsToBlock(
  block: DocumentBlock,
  edits: EditOperation[],
  attrs: ChangeAttrs,
  revisionIdCounter: { value: number },
  commentIdMap: Map<string, number>,
): any[] {
  const content = block.content;
  const children: any[] = [];

  // Separate insert_after operations from range operations
  const rangeEdits = edits
    .filter(e => e.type === 'replace_range' || e.type === 'delete_range')
    .filter(e => typeof e.startChar === 'number' && typeof e.endChar === 'number');
  const insertAfterEdits = edits.filter(e => e.type === 'insert_after');

  // Validate and clamp range edits
  const validEdits = rangeEdits
    .map(e => ({
      ...e,
      startChar: Math.max(0, Math.min(e.startChar!, content.length)),
      endChar: Math.max(0, Math.min(e.endChar!, content.length)),
    }))
    .filter(e => {
      if (e.startChar! < e.endChar!) return true;
      console.warn(`Edit ${e.id} has invalid range [${e.startChar}, ${e.endChar}] in block ${e.blockId} (content length ${content.length}). Skipped.`);
      return false;
    })
    .sort((a, b) => a.startChar! - b.startChar!);

  // Remove overlapping ranges (keep first occurrence, warn on drops)
  const nonOverlapping: typeof validEdits = [];
  let lastEnd = 0;
  for (const edit of validEdits) {
    if (edit.startChar! >= lastEnd) {
      nonOverlapping.push(edit);
      lastEnd = edit.endChar!;
    } else {
      console.warn(`Edit ${edit.id} overlaps [${edit.startChar}, ${edit.endChar}] with previous edit ending at ${lastEnd}. Skipped.`);
    }
  }

  // Walk through content and apply edits
  let cursor = 0;
  for (const edit of nonOverlapping) {
    const commentId = commentIdMap.get(edit.id);

    // Text before this edit
    if (cursor < edit.startChar!) {
      children.push(new TextRun({ text: content.slice(cursor, edit.startChar!), font: FONT, size: 22 }));
    }

    // Comment range start
    if (commentId !== undefined) {
      children.push(new CommentRangeStart(commentId));
    }

    // Deleted text
    const deletedText = content.slice(edit.startChar!, edit.endChar!);
    const revId = revisionIdCounter.value++;
    children.push(new DeletedTextRun({
      id: revId,
      author: attrs.author,
      date: attrs.date,
      text: deletedText,
      font: FONT,
      size: 22,
    }));

    // Inserted text (for replace_range)
    if (edit.type === 'replace_range' && edit.newText) {
      const insRevId = revisionIdCounter.value++;
      children.push(new InsertedTextRun({
        id: insRevId,
        author: attrs.author,
        date: attrs.date,
        text: edit.newText,
        font: FONT,
        size: 22,
      }));
    }

    // Comment range end + reference
    if (commentId !== undefined) {
      children.push(new CommentRangeEnd(commentId));
      children.push(new CommentReference(commentId));
    }

    cursor = edit.endChar!;
  }

  // Remaining text after last edit
  if (cursor < content.length) {
    children.push(new TextRun({ text: content.slice(cursor), font: FONT, size: 22 }));
  }

  // insert_after operations: append new text after the block content
  for (const edit of insertAfterEdits) {
    if (!edit.newText) continue;
    const commentId = commentIdMap.get(edit.id);
    if (commentId !== undefined) children.push(new CommentRangeStart(commentId));

    const insRevId = revisionIdCounter.value++;
    children.push(new InsertedTextRun({
      id: insRevId,
      author: attrs.author,
      date: attrs.date,
      text: ' ' + edit.newText,
      font: FONT,
      size: 22,
    }));

    if (commentId !== undefined) {
      children.push(new CommentRangeEnd(commentId));
      children.push(new CommentReference(commentId));
    }
  }

  // If no children were added, add the original text
  if (children.length === 0) {
    children.push(new TextRun({ text: content, font: FONT, size: 22 }));
  }

  return children;
}

// ── Public API ──

/**
 * Build a DOCX with tracked changes from structured edit operations.
 */
export async function buildRedlineDocx(
  parsedDocument: ParsedDocument,
  analysisResult: AnalysisResult,
  selectedEdits: EditOperation[],
  options: ExportOptions,
): Promise<Buffer> {
  const author = options.author || 'Consello Legal AI';
  const date = nowISO();
  const attrs: ChangeAttrs = { author, date };
  const revisionIdCounter = { value: 1 };

  // Validate edits against document blocks
  const blockIds = new Set(parsedDocument.blocks.map(b => b.id));
  const validSelectedEdits = selectedEdits.filter(edit => {
    if (blockIds.has(edit.blockId)) return true;
    console.warn(`Edit ${edit.id} references non-existent block ${edit.blockId}. Skipped.`);
    return false;
  });

  // Group edits by blockId
  const editsByBlock = new Map<string, EditOperation[]>();
  for (const edit of validSelectedEdits) {
    const existing = editsByBlock.get(edit.blockId) || [];
    existing.push(edit);
    editsByBlock.set(edit.blockId, existing);
  }

  // Build comment definitions and ID map
  let commentIdCounter = 1;
  const commentIdMap = new Map<string, number>(); // editId -> commentId
  const comments: Array<{ id: number; initials: string; author: string; date: Date; children: any[] }> = [];

  for (const edit of validSelectedEdits) {
    if (edit.comment) {
      const cId = commentIdCounter++;
      commentIdMap.set(edit.id, cId);
      comments.push({
        id: cId,
        initials: 'CLA',
        author,
        date: new Date(),
        children: [new Paragraph({
          children: [new TextRun({ text: edit.comment, font: FONT, size: 18 })],
        })],
      });
    }
  }

  // Build document sections
  const docChildren: any[] = [];

  // Title
  docChildren.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({
      text: 'Redline Review',
      bold: true, font: FONT, size: 32, color: '000000',
    })],
    spacing: { after: 120 },
  }));

  // Classification badge
  const classColor = CLASSIFICATION_COLORS[analysisResult.classification] || '000000';
  docChildren.push(new Paragraph({
    children: [new TextRun({
      text: classificationLabel(analysisResult.classification),
      bold: true, font: FONT, size: 24, color: classColor,
    })],
    spacing: { after: 200 },
  }));

  // Date
  docChildren.push(new Paragraph({
    children: [new TextRun({
      text: `Generated: ${dateLabel()}`,
      font: FONT, size: 18, color: '999999',
    })],
    spacing: { after: 300 },
  }));

  // Summary table
  docChildren.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: 'Contract Summary', bold: true, font: FONT, size: 26 })],
    spacing: { before: 200, after: 120 },
  }));
  docChildren.push(buildSummaryTable(analysisResult));

  // Tracked changes section
  docChildren.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: 'Proposed Changes', bold: true, font: FONT, size: 26 })],
    spacing: { before: 400, after: 120 },
  }));

  docChildren.push(new Paragraph({
    children: [new TextRun({
      text: 'The following clauses contain proposed edits shown as tracked changes. Review and accept/reject each change in Microsoft Word.',
      font: FONT, size: 20, color: '666666', italics: true,
    })],
    spacing: { after: 200 },
  }));

  // Process blocks with edits
  const emittedSections = new Set<string>();

  for (const block of parsedDocument.blocks) {
    const blockEdits = editsByBlock.get(block.id);
    if (!blockEdits || blockEdits.length === 0) continue;

    // Emit section heading
    const heading = findParentHeading(parsedDocument.blocks, block.id);
    const sectionLabel = heading ? heading.content : 'General Provisions';
    if (!emittedSections.has(sectionLabel)) {
      emittedSections.add(sectionLabel);
      docChildren.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: sectionLabel, bold: true, font: FONT, size: 24 })],
        spacing: { before: 300, after: 100 },
      }));
    }

    // Apply edits to this block
    const children = applyEditsToBlock(block, blockEdits, attrs, revisionIdCounter, commentIdMap);
    docChildren.push(new Paragraph({
      children,
      spacing: { before: 80, after: 80 },
    }));
  }

  // Next steps
  if (analysisResult.nextSteps?.length) {
    docChildren.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: 'Next Steps', bold: true, font: FONT, size: 26 })],
      spacing: { before: 400, after: 120 },
    }));

    for (let i = 0; i < analysisResult.nextSteps.length; i++) {
      docChildren.push(new Paragraph({
        children: [new TextRun({
          text: `${i + 1}. ${analysisResult.nextSteps[i]}`,
          font: FONT, size: 20,
        })],
        spacing: { before: 40, after: 40 },
      }));
    }
  }

  // Build document
  const doc = new DocxDocument({
    features: { trackRevisions: true },
    creator: author,
    title: `${parsedDocument.filename} — Redline Review`,
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 22 },
        },
      },
    },
    comments: { children: comments },
    sections: [{
      headers: { default: buildHeader(parsedDocument.filename) },
      footers: { default: buildFooter() },
      children: docChildren,
    }],
  });

  return await Packer.toBuffer(doc) as Buffer;
}

/**
 * Apply edit operations to a block's content, returning the clean result text
 * (no tracked changes markup — just the final text after edits).
 */
function applyEditsCleanly(
  block: DocumentBlock,
  edits: EditOperation[],
): string {
  const content = block.content;

  const rangeEdits = edits
    .filter(e => e.type === 'replace_range' || e.type === 'delete_range')
    .filter(e => typeof e.startChar === 'number' && typeof e.endChar === 'number');
  const insertAfterEdits = edits.filter(e => e.type === 'insert_after');

  // Validate, clamp, sort, deduplicate — same as applyEditsToBlock
  const validEdits = rangeEdits
    .map(e => ({
      ...e,
      startChar: Math.max(0, Math.min(e.startChar!, content.length)),
      endChar: Math.max(0, Math.min(e.endChar!, content.length)),
    }))
    .filter(e => e.startChar! < e.endChar!)
    .sort((a, b) => a.startChar! - b.startChar!);

  const nonOverlapping: typeof validEdits = [];
  let lastEnd = 0;
  for (const edit of validEdits) {
    if (edit.startChar! >= lastEnd) {
      nonOverlapping.push(edit);
      lastEnd = edit.endChar!;
    }
  }

  // Walk content and build result string
  let result = '';
  let cursor = 0;
  for (const edit of nonOverlapping) {
    result += content.slice(cursor, edit.startChar!);
    if (edit.type === 'replace_range' && edit.newText) {
      result += edit.newText;
    }
    // delete_range: skip the deleted text
    cursor = edit.endChar!;
  }
  result += content.slice(cursor);

  // insert_after: append
  for (const edit of insertAfterEdits) {
    if (edit.newText) result += ' ' + edit.newText;
  }

  return result;
}

/**
 * Build a clean revised DOCX with edits applied as plain text (no tracked changes).
 * Outputs the full document with all blocks — edited blocks show final text.
 */
export async function buildCleanDocx(
  parsedDocument: ParsedDocument,
  analysisResult: AnalysisResult,
  selectedEdits: EditOperation[],
  options: ExportOptions,
): Promise<Buffer> {
  // Group edits by blockId
  const blockIds = new Set(parsedDocument.blocks.map(b => b.id));
  const validEdits = selectedEdits.filter(e => blockIds.has(e.blockId));
  const editsByBlock = new Map<string, EditOperation[]>();
  for (const edit of validEdits) {
    const existing = editsByBlock.get(edit.blockId) || [];
    existing.push(edit);
    editsByBlock.set(edit.blockId, existing);
  }

  const docChildren: any[] = [];
  const docName = parsedDocument.filename || options.filename || 'Document';

  // Title
  docChildren.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({
      text: 'Revised Document',
      bold: true, font: FONT, size: 32, color: '000000',
    })],
    spacing: { after: 120 },
  }));

  // Classification badge
  const classColor = CLASSIFICATION_COLORS[analysisResult.classification] || '000000';
  docChildren.push(new Paragraph({
    children: [new TextRun({
      text: classificationLabel(analysisResult.classification),
      bold: true, font: FONT, size: 24, color: classColor,
    })],
    spacing: { after: 200 },
  }));

  // Date + edit count
  const editCount = validEdits.length;
  docChildren.push(new Paragraph({
    children: [new TextRun({
      text: `Generated: ${dateLabel()} — ${editCount} edit${editCount !== 1 ? 's' : ''} applied`,
      font: FONT, size: 18, color: '999999',
    })],
    spacing: { after: 300 },
  }));

  // Summary table
  docChildren.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: 'Contract Summary', bold: true, font: FONT, size: 26 })],
    spacing: { before: 200, after: 120 },
  }));
  docChildren.push(buildSummaryTable(analysisResult));

  // Divider before document body
  docChildren.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: 'Revised Text', bold: true, font: FONT, size: 26 })],
    spacing: { before: 400, after: 120 },
  }));

  // Process ALL blocks
  for (const block of parsedDocument.blocks) {
    const blockEdits = editsByBlock.get(block.id);
    const text = blockEdits && blockEdits.length > 0
      ? applyEditsCleanly(block, blockEdits)
      : block.content;

    if (!text.trim()) continue;

    // Determine paragraph style from block type
    if (block.type === 'heading') {
      const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
      };
      docChildren.push(new Paragraph({
        heading: headingMap[block.level || 2] || HeadingLevel.HEADING_2,
        children: [new TextRun({ text, bold: true, font: FONT, size: 24 })],
        spacing: { before: 240, after: 100 },
      }));
    } else {
      docChildren.push(new Paragraph({
        children: [new TextRun({ text, font: FONT, size: 22 })],
        spacing: { before: 80, after: 80 },
      }));
    }
  }

  const doc = new DocxDocument({
    // No trackRevisions — this is a clean document
    creator: options.author || 'Consello Legal AI',
    title: `${docName} — Revised`,
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 22 },
        },
      },
    },
    sections: [{
      headers: { default: buildHeader(docName) },
      footers: { default: buildFooter() },
      children: docChildren,
    }],
  });

  return await Packer.toBuffer(doc) as Buffer;
}

/**
 * Build a branded clause review DOCX (fallback when editPlans unavailable).
 */
export async function buildClauseReviewDocx(
  analysisResult: AnalysisResult,
  options: ExportOptions,
): Promise<Buffer> {
  const docChildren: any[] = [];
  const docName = analysisResult.document || options.filename || 'Document';

  // Title
  docChildren.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({
      text: 'Contract Review',
      bold: true, font: FONT, size: 32, color: '000000',
    })],
    spacing: { after: 120 },
  }));

  // Classification
  const classColor = CLASSIFICATION_COLORS[analysisResult.classification] || '000000';
  docChildren.push(new Paragraph({
    children: [new TextRun({
      text: classificationLabel(analysisResult.classification),
      bold: true, font: FONT, size: 24, color: classColor,
    })],
    spacing: { after: 200 },
  }));

  // Date
  docChildren.push(new Paragraph({
    children: [new TextRun({
      text: `Generated: ${dateLabel()}`,
      font: FONT, size: 18, color: '999999',
    })],
    spacing: { after: 300 },
  }));

  // Summary table
  docChildren.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: 'Contract Summary', bold: true, font: FONT, size: 26 })],
    spacing: { before: 200, after: 120 },
  }));
  docChildren.push(buildSummaryTable(analysisResult));

  // Issues
  const issues = analysisResult.issues || [];
  if (issues.length > 0) {
    docChildren.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: `Issues Found (${issues.length})`, bold: true, font: FONT, size: 26 })],
      spacing: { before: 400, after: 120 },
    }));

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      const sevColor = issue.severity === 'red' ? 'C62828' : issue.severity === 'yellow' ? 'F9A825' : '2E7D32';
      const sevLabel = issue.severity === 'red' ? 'CRITICAL' : issue.severity === 'yellow' ? 'WARNING' : 'PASS';

      // Issue heading
      docChildren.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [
          new TextRun({ text: `[${sevLabel}] `, bold: true, font: FONT, size: 22, color: sevColor }),
          new TextRun({ text: `Issue ${i + 1}: ${issue.title}`, bold: true, font: FONT, size: 22 }),
        ],
        spacing: { before: 240, after: 80 },
      }));

      // Description
      docChildren.push(new Paragraph({
        children: [new TextRun({ text: issue.description, font: FONT, size: 20 })],
        spacing: { after: 60 },
      }));

      // Source quote with shading
      if (issue.sourceQuote) {
        docChildren.push(new Paragraph({
          shading: { fill: 'F8F8F8', type: ShadingType.CLEAR, color: 'auto' },
          indent: { left: 240 },
          children: [
            new TextRun({ text: 'Contract says: ', bold: true, font: FONT, size: 20, color: '666666' }),
            new TextRun({ text: `"${issue.sourceQuote}"`, italics: true, font: FONT, size: 20, color: '666666' }),
          ],
          spacing: { before: 40, after: 60 },
        }));
      }

      // Risk
      if (issue.risk) {
        docChildren.push(new Paragraph({
          children: [
            new TextRun({ text: 'Risk: ', bold: true, font: FONT, size: 20 }),
            new TextRun({ text: issue.risk, font: FONT, size: 20 }),
          ],
          spacing: { after: 60 },
        }));
      }

      // Recommendation
      docChildren.push(new Paragraph({
        children: [
          new TextRun({ text: 'Recommended Action: ', bold: true, font: FONT, size: 20, color: CONSELLO_TERRACOTTA }),
          new TextRun({ text: issue.recommendation, bold: true, font: FONT, size: 20 }),
        ],
        spacing: { after: 120 },
      }));

      // Separator between issues
      if (i < issues.length - 1) {
        docChildren.push(new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' } },
          spacing: { before: 40, after: 120 },
          children: [],
        }));
      }
    }
  }

  // Overall recommendation
  if (analysisResult.recommendation) {
    docChildren.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: 'Overall Recommendation', bold: true, font: FONT, size: 26 })],
      spacing: { before: 400, after: 120 },
    }));
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: analysisResult.recommendation, font: FONT, size: 20 })],
      spacing: { after: 200 },
    }));
  }

  // Next steps
  if (analysisResult.nextSteps?.length) {
    docChildren.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: 'Next Steps', bold: true, font: FONT, size: 26 })],
      spacing: { before: 200, after: 120 },
    }));

    for (let i = 0; i < analysisResult.nextSteps.length; i++) {
      docChildren.push(new Paragraph({
        children: [new TextRun({
          text: `${i + 1}. ${analysisResult.nextSteps[i]}`,
          font: FONT, size: 20,
        })],
        spacing: { before: 40, after: 40 },
      }));
    }
  }

  const doc = new DocxDocument({
    creator: options.author || 'Consello Legal AI',
    title: `${docName} — Contract Review`,
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 22 },
        },
      },
    },
    sections: [{
      headers: { default: buildHeader(docName) },
      footers: { default: buildFooter() },
      children: docChildren,
    }],
  });

  return await Packer.toBuffer(doc) as Buffer;
}
