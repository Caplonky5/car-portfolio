import { getAllSessions, getPhotosBySessionId, createSession } from './db';

/**
 * Default gap threshold for grouping photos into sessions (8 hours in milliseconds)
 */
export const DEFAULT_SESSION_GAP_MS = 8 * 60 * 60 * 1000;

/**
 * Result of the grouping decision
 */
export interface GroupingResult {
  sessionId: string;
  sessionSlug: string;
  isNewSession: boolean;
}

/**
 * Generates a slug from a date in the format "shoot-YYYY-MM-DD"
 * Appends -2, -3, etc. if the slug already exists
 */
export function generateSessionSlug(date: Date, existingSlugs: Set<string>): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const baseSlug = `shoot-${year}-${month}-${day}`;

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let slug = `${baseSlug}-${counter}`;
  while (existingSlugs.has(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  return slug;
}

/**
 * Generates a session title from a date
 */
export function generateSessionTitle(date: Date): string {
  const day = date.getDate();
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `Shoot — ${day} ${month} ${year}`;
}

/**
 * Determines which session a new photo belongs to, or creates a new one
 * @param photoTakenAt - The taken_at timestamp of the new photo (ISO string or Date)
 * @param gapThresholdMs - Optional custom gap threshold in milliseconds (default: 8 hours)
 * @returns GroupingResult with session info and whether it's a new session
 */
export async function findOrCreateSessionForPhoto(
  photoTakenAt: string | Date,
  gapThresholdMs: number = DEFAULT_SESSION_GAP_MS
): Promise<GroupingResult> {
  // Parse the photo timestamp
  const photoDate = typeof photoTakenAt === 'string' ? new Date(photoTakenAt) : photoTakenAt;

  if (isNaN(photoDate.getTime())) {
    throw new Error(`Invalid photo timestamp: ${photoTakenAt}`);
  }

  // Fetch all existing sessions
  const sessions = await getAllSessions();

  if (sessions.length === 0) {
    // No sessions exist, create the first one
    const slug = generateSessionSlug(photoDate, new Set());
    const title = generateSessionTitle(photoDate);
    const newSession = await createSession({
      slug,
      title,
      car_name: null,
      description: null,
      cover_asset_id: null,
      started_at: photoDate.toISOString(),
      ended_at: photoDate.toISOString()
    });
    return {
      sessionId: newSession.id,
      sessionSlug: newSession.slug,
      isNewSession: true
    };
  }

  // Get all existing slugs for collision checking
  const existingSlugs = new Set(sessions.map(s => s.slug));

  // For each session, find its most recent photo
  let bestMatch: { session: typeof sessions[0]; lastPhotoDate: Date; gapMs: number } | null = null;

  for (const session of sessions) {
    const photos = await getPhotosBySessionId(session.id);
    if (photos.length === 0) continue;

    // Find the most recent photo in this session
    const sortedPhotos = photos
      .map(p => new Date(p.taken_at))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => b.getTime() - a.getTime());

    if (sortedPhotos.length === 0) continue;

    const lastPhotoDate = sortedPhotos[0];
    const gapMs = photoDate.getTime() - lastPhotoDate.getTime();

    // Only consider sessions where the photo is after the last photo
    if (gapMs >= 0) {
      if (!bestMatch || gapMs < bestMatch.gapMs) {
        bestMatch = { session, lastPhotoDate, gapMs };
      }
    }
  }

  // Check if we found a session within the gap threshold
  if (bestMatch && bestMatch.gapMs <= gapThresholdMs) {
    // Photo belongs to existing session
    return {
      sessionId: bestMatch.session.id,
      sessionSlug: bestMatch.session.slug,
      isNewSession: false
    };
  }

  // No suitable session found, create a new one
  const slug = generateSessionSlug(photoDate, existingSlugs);
  const title = generateSessionTitle(photoDate);
  const newSession = await createSession({
    slug,
    title,
    car_name: null,
    description: null,
    cover_asset_id: null,
    started_at: photoDate.toISOString(),
    ended_at: photoDate.toISOString()
  });

  return {
    sessionId: newSession.id,
    sessionSlug: newSession.slug,
    isNewSession: true
  };
}

/**
 * Updates a session's ended_at timestamp to the latest photo time
 * Call this after adding a photo to an existing session
 */
export async function updateSessionEndTime(sessionId: string, newEndTime: string | Date): Promise<void> {
  const { updateSession } = await import('./db');
  const endTime = typeof newEndTime === 'string' ? newEndTime : newEndTime.toISOString();
  await updateSession(sessionId, { ended_at: endTime });
}

/**
 * Updates a session's cover_asset_id if it's not set or if this is the first photo
 * Call this after adding a photo to a session
 */
export async function updateSessionCoverIfNeeded(sessionId: string, assetId: string): Promise<void> {
  const { getSessionById, updateSession } = await import('./db');
  const session = await getSessionById(sessionId);
  if (session && !session.cover_asset_id) {
    await updateSession(sessionId, { cover_asset_id: assetId });
  }
}