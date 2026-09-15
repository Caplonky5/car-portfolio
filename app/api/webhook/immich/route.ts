import { NextRequest, NextResponse } from 'next/server';
import { getAssetById } from '@/lib/immich';
import { findOrCreateSessionForPhoto, updateSessionEndTime, updateSessionCoverIfNeeded } from '@/lib/grouping';
import { createPhoto, getPhotoByImmichAssetId } from '@/lib/db';

/**
 * Immich workflow webhook payload structure
 * Based on Immich's workflow webhook documentation
 */
interface ImmichWebhookPayload {
  event: string;
  assetId: string;
  assetIds?: string[];
  workflowId?: string;
  workflowName?: string;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * Verify the shared secret header
 */
function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = process.env.IMMICH_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Immich Webhook] IMMICH_WEBHOOK_SECRET not configured');
    return false;
  }

  const providedSecret = request.headers.get('x-webhook-secret') ||
                         request.headers.get('x-immich-webhook-secret') ||
                         request.headers.get('authorization')?.replace('Bearer ', '');

  if (!providedSecret) {
    console.warn('[Immich Webhook] Missing webhook secret header');
    return false;
  }

  return providedSecret === secret;
}

/**
 * POST handler for Immich workflow webhook
 * Expects a payload with assetId from Immich's workflow trigger
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID().slice(0, 8);

  try {
    // 1. Verify webhook secret
    if (!verifyWebhookSecret(request)) {
      console.error(`[Immich Webhook] [${requestId}] Unauthorized - invalid or missing secret`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse payload
    let payload: ImmichWebhookPayload;
    try {
      payload = await request.json();
    } catch (parseError) {
      console.error(`[Immich Webhook] [${requestId}] Failed to parse JSON payload:`, parseError);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    console.log(`[Immich Webhook] [${requestId}] Received event: ${payload.event}, assetId: ${payload.assetId}`);

    // 3. Extract asset ID - handle both single assetId and assetIds array
    const assetId = payload.assetId || (payload.assetIds?.[0]);

    if (!assetId) {
      console.error(`[Immich Webhook] [${requestId}] No assetId found in payload`);
      return NextResponse.json({ error: 'No assetId in payload' }, { status: 400 });
    }

    // 4. Check if photo already exists (idempotency)
    const existingPhoto = await getPhotoByImmichAssetId(assetId);
    if (existingPhoto) {
      console.log(`[Immich Webhook] [${requestId}] Photo ${assetId} already exists, skipping`);
      return NextResponse.json({
        success: true,
        message: 'Photo already processed',
        photoId: existingPhoto.id
      }, { status: 200 });
    }

    // 5. Fetch full asset details from Immich (includes EXIF, taken_at, etc.)
    let asset;
    try {
      asset = await getAssetById(assetId);
    } catch (immichError) {
      console.error(`[Immich Webhook] [${requestId}] Failed to fetch asset ${assetId} from Immich:`, immichError);
      return NextResponse.json({ error: 'Failed to fetch asset from Immich' }, { status: 502 });
    }

    // 6. Determine taken_at from asset (prefer EXIF dateTimeOriginal, fallback to createdAt)
    const takenAt = asset.exifInfo?.dateTimeOriginal
      ? new Date(asset.exifInfo.dateTimeOriginal).toISOString()
      : asset.createdAt;

    const photoTakenAt = new Date(takenAt);
    if (isNaN(photoTakenAt.getTime())) {
      console.error(`[Immich Webhook] [${requestId}] Invalid taken_at date for asset ${assetId}: ${takenAt}`);
      return NextResponse.json({ error: 'Invalid photo timestamp' }, { status: 400 });
    }

    console.log(`[Immich Webhook] [${requestId}] Asset ${assetId} taken at: ${photoTakenAt.toISOString()}`);

    // 6. Run grouping logic to find or create session
    const groupingResult = await findOrCreateSessionForPhoto(photoTakenAt);

    console.log(`[Immich Webhook] [${requestId}] ${groupingResult.isNewSession ? 'Created new' : 'Using existing'} session: ${groupingResult.sessionSlug} (${groupingResult.sessionId})`);

    // 7. Create photo record in database
    const photo = await createPhoto({
      immich_asset_id: assetId,
      session_id: groupingResult.sessionId,
      taken_at: photoTakenAt.toISOString(),
      width: asset.width ?? null,
      height: asset.height ?? null
    });

    console.log(`[Immich Webhook] [${requestId}] Created photo record: ${photo.id}`);

    // 8. Update session metadata
    // Update ended_at to this photo's time (session extends to include this photo)
    await updateSessionEndTime(groupingResult.sessionId, photoTakenAt);

    // Set cover asset if not already set
    await updateSessionCoverIfNeeded(groupingResult.sessionId, assetId);

    const duration = Date.now() - startTime;
    console.log(`[Immich Webhook] [${requestId}] Successfully processed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      photoId: photo.id,
      sessionId: groupingResult.sessionId,
      sessionSlug: groupingResult.sessionSlug,
      isNewSession: groupingResult.isNewSession,
      takenAt: photoTakenAt.toISOString()
    }, { status: 200 });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Immich Webhook] [${requestId}] Error after ${duration}ms:`, error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for health check / verification
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    service: 'immich-webhook',
    timestamp: new Date().toISOString()
  });
}