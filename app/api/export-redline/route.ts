import { NextResponse } from 'next/server';
import { buildRedlineDocx, buildClauseReviewDocx } from '../../lib/redline-builder';
import type { ParsedDocument, AnalysisResult, EditOperation, ExportOptions } from '../../lib/types';

export async function POST(request: Request) {
  try {
    // Auth check
    const authHeader = request.headers.get('x-app-password');
    if (authHeader !== process.env.APP_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      parsedDocument,
      analysisResult,
      selectedEdits = [],
      options = {},
    } = body as {
      parsedDocument: ParsedDocument | null;
      analysisResult: AnalysisResult;
      selectedEdits: EditOperation[];
      options: Partial<ExportOptions>;
    };

    if (!analysisResult) {
      return NextResponse.json({ error: 'analysisResult is required' }, { status: 400 });
    }

    const exportOptions: ExportOptions = {
      author: options.author || 'Consello Legal AI',
      includeComments: options.includeComments !== false,
      filename: options.filename || 'document-redline.docx',
    };

    let buffer: Buffer;

    if (selectedEdits.length > 0 && parsedDocument) {
      // Full redline with tracked changes
      buffer = await buildRedlineDocx(
        parsedDocument,
        analysisResult,
        selectedEdits,
        exportOptions,
      );
    } else {
      // Fallback: branded clause review document
      buffer = await buildClauseReviewDocx(analysisResult, exportOptions);
    }

    const filename = exportOptions.filename || 'redline.docx';

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export redline error:', error);
    return NextResponse.json(
      { error: error.message || 'Export failed' },
      { status: 500 },
    );
  }
}
