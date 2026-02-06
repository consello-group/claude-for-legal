import { NextResponse } from 'next/server';
import { parseDocx } from '../../lib/docx-parser';

/**
 * POST /api/parse-docx
 *
 * Parses a DOCX file and returns a structured document with block IDs.
 *
 * Request: DOCX file as binary body (application/octet-stream)
 * Query params: ?filename=document.docx (optional)
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
      || 'document.docx';

    // Get the binary data
    const buffer = await request.arrayBuffer();

    if (!buffer || buffer.byteLength === 0) {
      return NextResponse.json(
        { success: false, error: 'No file data provided' },
        { status: 400 }
      );
    }

    // Parse the DOCX
    const document = await parseDocx(buffer, filename);

    return NextResponse.json({
      success: true,
      document,
    });

  } catch (error) {
    console.error('DOCX parsing error:', error);

    // Check for specific mammoth errors
    if (error.message?.includes('Could not find')) {
      return NextResponse.json(
        { success: false, error: 'Invalid DOCX file format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to parse document' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/parse-docx
 *
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/parse-docx',
    method: 'POST',
    description: 'Parse a DOCX file into structured blocks with IDs',
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
        metadata: 'object',
      },
    },
  });
}
