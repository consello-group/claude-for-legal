import { NextResponse } from 'next/server';
import { parsePdf } from '../../lib/pdf-parser';

/**
 * POST /api/parse-pdf
 *
 * Parses a PDF file and returns a structured document with block IDs.
 *
 * Request: PDF file as binary body (application/octet-stream)
 * Query params: ?filename=document.pdf (optional)
 *
 * Response: {
 *   success: boolean,
 *   document: ParsedDocument,
 *   error?: string
 * }
 */
export async function POST(request) {
  try {
    // Check password auth
    const authHeader = request.headers.get('x-app-password');
    if (authHeader !== process.env.APP_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get filename from query params or header
    const url = new URL(request.url);
    const filename = url.searchParams.get('filename')
      || request.headers.get('x-filename')
      || 'document.pdf';

    // Get the binary data
    const buffer = await request.arrayBuffer();

    if (!buffer || buffer.byteLength === 0) {
      return NextResponse.json(
        { success: false, error: 'No file data provided' },
        { status: 400 }
      );
    }

    // Parse the PDF
    const document = await parsePdf(buffer, filename);

    return NextResponse.json({
      success: true,
      document,
    });

  } catch (error) {
    console.error('PDF parsing error:', error);

    // Check for specific pdf-parse errors
    if (error.message?.includes('Invalid PDF')) {
      return NextResponse.json(
        { success: false, error: 'Invalid PDF file format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/parse-pdf
 *
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/parse-pdf',
    method: 'POST',
    description: 'Parse a PDF file into structured blocks with IDs',
    headers: {
      'Content-Type': 'application/octet-stream',
      'x-app-password': 'Required authentication',
      'x-filename': 'Optional filename override',
    },
    queryParams: {
      filename: 'Optional filename',
    },
    response: {
      success: 'boolean',
      document: {
        filename: 'string',
        blocks: 'DocumentBlock[]',
        fullText: 'string',
        annotatedText: 'string',
        metadata: 'object (includes pageCount)',
      },
    },
  });
}
