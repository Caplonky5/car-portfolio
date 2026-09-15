import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler for streaming images from Immich
 * Route: /api/image/[assetId]?size=thumbnail|original
 *
 * Streams image data from Immich API with appropriate caching headers.
 * Never exposes the Immich API key to the client.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await context.params;
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size');

  // Validate assetId
  if (!assetId) {
    return new NextResponse('Asset ID is required', { status: 400 });
  }

  // Validate size parameter
  if (sizeParam !== 'thumbnail' && sizeParam !== 'original') {
    return new NextResponse('Size must be either "thumbnail" or "original"', { status: 400 });
  }

  // Get configuration from environment (same as used in lib/immich.ts)
  const baseUrl = process.env.IMMICH_BASE_URL;
  const apiKey = process.env.IMMICH_API_KEY;

  if (!baseUrl || !apiKey) {
    return new NextResponse('Server configuration error', { status: 500 });
  }

  // Construct Immich API URL
  let url = `${baseUrl}/api/assets/${assetId}`;

  if (sizeParam === 'thumbnail') {
    // Use medium size thumbnail as a reasonable default
    url += `/thumbnail?size=medium`;
  } else if (sizeParam === 'original') {
    url += `/original`;
  }

  try {
    // Fetch image from Immich (server-to-server, API key not exposed to client)
    const immichResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    });

    // Handle Immich API errors
    if (!immichResponse.ok) {
      const errorText = await immichResponse.text();
      console.error(`Immich API error for asset ${assetId}:`, {
        status: immichResponse.status,
        statusText: immichResponse.statusText,
        body: errorText.substring(0, 200) // Limit log size
      });

      return new NextResponse(
        `Immich error: ${immichResponse.status} ${immichResponse.statusText}`,
        { status: immichResponse.status }
      );
    }

    // Get content type from Immich response (fallback to octet-stream)
    const contentType =
      immichResponse.headers.get('content-type') ||
      'application/octet-stream';

    // Create response with streaming body and caching headers
    const response = new NextResponse(immichResponse.body, {
      status: 200,
      headers: {
        'content-type': contentType,
        // Cache for 1 year, immutable since asset bytes don't change
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

    return response;
  } catch (error) {
    console.error(`Failed to fetch image ${assetId} from Immich:`, error);
    return new NextResponse('Failed to fetch image from Immich', { status: 502 });
  }
}