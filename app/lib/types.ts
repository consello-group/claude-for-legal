/**
 * Core types for the enhanced contract analysis system
 * with block-level document tracking and edit operations.
 */

// ============================================
// Document Structure Types
// ============================================

export interface DocumentBlock {
  /** Stable UUID for this block */
  id: string;
  /** Type of block */
  type: 'paragraph' | 'heading' | 'list-item' | 'table-cell';
  /** Plain text content of this block */
  content: string;
  /** Character offset where this block starts in the full document text */
  charStart: number;
  /** Character offset where this block ends in the full document text */
  charEnd: number;
  /** For headings: level 1-6 */
  level?: number;
  /** Style name from the original document (e.g., "Heading1", "Normal") */
  style?: string;
  /** For list items */
  listInfo?: {
    type: 'bullet' | 'numbered';
    level: number;
    index: number;
  };
  /** For table cells */
  tableInfo?: {
    tableId: string;
    rowIndex: number;
    cellIndex: number;
  };
}

export interface ParsedDocument {
  /** Original filename */
  filename: string;
  /** Array of document blocks with stable IDs */
  blocks: DocumentBlock[];
  /** Full concatenated plain text (for backward compatibility) */
  fullText: string;
  /** Annotated text with block markers for LLM consumption */
  annotatedText: string;
  /** Document metadata */
  metadata: {
    wordCount: number;
    blockCount: number;
    hasTablesOrLists: boolean;
    parseDate: string;
  };
}

// ============================================
// Analysis Types
// ============================================

export interface ScreeningItem {
  criterion: string;
  status: 'pass' | 'flag' | 'fail';
  note: string;
}

export interface EditOperation {
  /** Unique ID for this operation */
  id: string;
  /** Type of edit */
  type: 'insert_after' | 'delete_range' | 'replace_range';
  /** Reference to the block being edited */
  blockId: string;
  /** Character offset within the block (for replace/delete) */
  startChar?: number;
  /** End character offset within the block (for replace/delete) */
  endChar?: number;
  /** Text to insert or replace with */
  newText?: string;
  /** Optional Word comment to attach to this change */
  comment?: string;
  /** Links back to the parent issue */
  issueId: string;
}

export interface EditPlan {
  /** Variant type: preferred (stronger position) or fallback (compromise) */
  variant: 'preferred' | 'fallback';
  /** Brief description of why this change */
  description: string;
  /** List of edit operations to apply */
  operations: EditOperation[];
}

export interface AnalysisIssue {
  /** Unique ID for this issue */
  id: string;
  /** Severity level */
  severity: 'green' | 'yellow' | 'red';
  /** Issue title */
  title: string;
  /** Description of what the clause says */
  description: string;
  /** Business/legal risk this creates */
  risk: string;
  /** Recommended action */
  recommendation: string;
  /** Block IDs where this issue was found */
  sourceBlockIds: string[];
  /** Exact quote from the document */
  sourceQuote?: string;
  /** Edit plans with preferred and fallback variants */
  editPlans?: EditPlan[];
}

export interface AnalysisResult {
  /** Overall classification */
  classification: 'green' | 'yellow' | 'red';
  /** Display level (GREEN, YELLOW, RED) */
  level: string;
  /** Brief summary */
  summary: string;
  /** Document name */
  document: string;
  /** Parties involved */
  parties: string;
  /** Contract/NDA type */
  type: string;
  /** Term duration */
  term: string;
  /** Governing law jurisdiction */
  governingLaw: string;
  /** Screening results */
  screening: ScreeningItem[];
  /** Issues found with block references */
  issues: AnalysisIssue[];
  /** Overall recommendation */
  recommendation: string;
  /** Next steps */
  nextSteps: string[];
  /** Original raw response from Claude */
  rawAnalysis?: string;
}

// ============================================
// Redline Builder Types
// ============================================

export interface IssueDecision {
  /** Whether to apply edits for this issue */
  apply: boolean;
  /** Which variant to use */
  variant: 'preferred' | 'fallback';
  /** Whether to include explanatory comment */
  includeComment: boolean;
}

export interface RedlineDecisions {
  [issueId: string]: IssueDecision;
}

export interface ExportOptions {
  /** Author name for Track Changes */
  author: string;
  /** Whether to include Word comments */
  includeComments: boolean;
  /** Document filename */
  filename?: string;
}

// ============================================
// API Types
// ============================================

export interface ParseDocxRequest {
  /** Raw DOCX file as ArrayBuffer */
  buffer: ArrayBuffer;
}

export interface ParseDocxResponse {
  success: boolean;
  document?: ParsedDocument;
  error?: string;
}

export interface AnalyzeRequest {
  /** Document text (annotated with block markers) */
  document: string;
  /** Analysis type */
  analysisType: 'nda-triage' | 'contract-review';
  /** Original filename */
  filename?: string;
  /** Optional: parsed document for block reference validation */
  parsedDocument?: ParsedDocument;
}

export interface AnalyzeResponse {
  success: boolean;
  analysis?: AnalysisResult;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: string;
}

export interface ExportRedlineRequest {
  /** The parsed document */
  document: ParsedDocument;
  /** Selected edit operations to apply */
  edits: EditOperation[];
  /** Export options */
  options: ExportOptions;
}
