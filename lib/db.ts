import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Turso/SQLite database client for the car portfolio application
 */

// Helper to convert @libsql/client Value types to our expected types
function val<T>(value: unknown): T {
  return value as T;
}

// Create the database client
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function ensureDatabaseInitialized(): Promise<void> {
  try {
    await turso.execute('SELECT 1 FROM sessions LIMIT 1');
    return;
  } catch {
    try {
      const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
      const schemaSql = readFileSync(schemaPath, 'utf8');
      const statements = schemaSql
        .split(';')
        .map(statement => statement.trim())
        .filter(Boolean);

      for (const statement of statements) {
        await turso.execute(statement);
      }
    } catch {
      // The database may be unavailable during build-time prerendering or before
      // the user has created the schema. The app should fail gracefully rather than
      // crashing the entire build.
    }
  }
}

/**
 * Session type definition
 */
export interface Session {
  id: string;
  slug: string;
  title: string;
  car_name?: string | null;
  description?: string | null;
  cover_asset_id?: string | null;
  started_at: string;
  ended_at?: string | null;
  created_at: string;
}

/**
 * Photo type definition
 */
export interface Photo {
  id: number;
  immich_asset_id: string;
  session_id: string;
  taken_at: string;
  width?: number | null;
  height?: number | null;
  created_at: string;
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await ensureDatabaseInitialized();
    await turso.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Session CRUD operations
 */

/**
 * Create a new session
 */
export async function createSession(session: Omit<Session, 'id' | 'created_at'>): Promise<Session> {
  await ensureDatabaseInitialized();

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const query = `
    INSERT INTO sessions (
      id, slug, title, car_name, description, cover_asset_id,
      started_at, ended_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await turso.execute(query, [
    id,
    session.slug,
    session.title,
    session.car_name ?? null,
    session.description ?? null,
    session.cover_asset_id ?? null,
    session.started_at,
    session.ended_at ?? null,
    createdAt
  ]);

  return { id, ...session, created_at: createdAt };
}

/**
 * Get a session by ID
 */
export async function getSessionById(id: string): Promise<Session | null> {
  try {
    await ensureDatabaseInitialized();

    const query = 'SELECT * FROM sessions WHERE id = ?';
    const rows = await turso.execute(query, [id]);

    if (rows.rows.length === 0) {
      return null;
    }

    const row = rows.rows[0];
    return {
      id: val(row.id),
      slug: val(row.slug),
      title: val(row.title),
      car_name: val(row.car_name),
      description: val(row.description),
      cover_asset_id: val(row.cover_asset_id),
      started_at: val(row.started_at),
      ended_at: val(row.ended_at),
      created_at: val(row.created_at)
    };
  } catch {
    return null;
  }
}

/**
 * Get a session by slug
 */
export async function getSessionBySlug(slug: string): Promise<Session | null> {
  try {
    await ensureDatabaseInitialized();

    const query = 'SELECT * FROM sessions WHERE slug = ?';
    const rows = await turso.execute(query, [slug]);

    if (rows.rows.length === 0) {
      return null;
    }

    const row = rows.rows[0];
    return {
      id: val(row.id),
      slug: val(row.slug),
      title: val(row.title),
      car_name: val(row.car_name),
      description: val(row.description),
      cover_asset_id: val(row.cover_asset_id),
      started_at: val(row.started_at),
      ended_at: val(row.ended_at),
      created_at: val(row.created_at)
    };
  } catch {
    return null;
  }
}

/**
 * Get all sessions
 */
export async function getAllSessions(): Promise<Session[]> {
  try {
    await ensureDatabaseInitialized();

    const query = 'SELECT * FROM sessions ORDER BY created_at DESC';
    const rows = await turso.execute(query);

    return rows.rows.map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      slug: String(row.slug ?? ''),
      title: String(row.title ?? ''),
      car_name: row.car_name == null ? null : String(row.car_name),
      description: row.description == null ? null : String(row.description),
      cover_asset_id: row.cover_asset_id == null ? null : String(row.cover_asset_id),
      started_at: String(row.started_at ?? ''),
      ended_at: row.ended_at == null ? null : String(row.ended_at),
      created_at: String(row.created_at ?? '')
    }));
  } catch {
    return [];
  }
}

/**
 * Update a session
 */
export async function updateSession(id: string, updates: Partial<Omit<Session, 'id' | 'created_at'>>): Promise<Session> {
  await ensureDatabaseInitialized();

  // First get the current session
  const currentSession = await getSessionById(id);
  if (!currentSession) {
    throw new Error(`Session with id ${id} not found`);
  }

  // Build dynamic update query
  const fields = [];
  const values = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }

  if (updates.car_name !== undefined) {
    fields.push('car_name = ?');
    values.push(updates.car_name ?? null);
  }

  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description ?? null);
  }

  if (updates.cover_asset_id !== undefined) {
    fields.push('cover_asset_id = ?');
    values.push(updates.cover_asset_id ?? null);
  }

  if (updates.started_at !== undefined) {
    fields.push('started_at = ?');
    values.push(updates.started_at);
  }

  if (updates.ended_at !== undefined) {
    fields.push('ended_at = ?');
    values.push(updates.ended_at ?? null);
  }

  if (fields.length === 0) {
    return currentSession;
  }

  values.push(id); // for WHERE clause

  const query = `
    UPDATE sessions
    SET ${fields.join(', ')}
    WHERE id = ?
  `;

  await turso.execute(query, values);

  // Return updated session
  const updatedSession = await getSessionById(id);
  if (!updatedSession) {
    throw new Error(`Failed to retrieve updated session with id ${id}`);
  }

  return updatedSession;
}

/**
 * Delete a session
 */
export async function deleteSession(id: string): Promise<void> {
  await ensureDatabaseInitialized();

  const query = 'DELETE FROM sessions WHERE id = ?';
  await turso.execute(query, [id]);
}

/**
 * Photo CRUD operations
 */

/**
 * Create a new photo
 */
export async function createPhoto(photo: Omit<Photo, 'id' | 'created_at'>): Promise<Photo> {
  await ensureDatabaseInitialized();

  const createdAt = new Date().toISOString();

  const query = `
    INSERT INTO photos (
      immich_asset_id, session_id, taken_at, width, height, created_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  await turso.execute(query, [
    photo.immich_asset_id,
    photo.session_id,
    photo.taken_at,
    photo.width ?? null,
    photo.height ?? null,
    createdAt
  ]);

  // Get the inserted row ID
  const result = await turso.execute('SELECT last_insert_rowid() as id');
  const id = Number(result.rows[0].id);

  return { id, ...photo, created_at: createdAt };
}

/**
 * Get a photo by ID
 */
export async function getPhotoById(id: number): Promise<Photo | null> {
  try {
    await ensureDatabaseInitialized();

    const query = 'SELECT * FROM photos WHERE id = ?';
    const rows = await turso.execute(query, [id]);

    if (rows.rows.length === 0) {
      return null;
    }

    const row = rows.rows[0];
    return {
      id: Number(row.id ?? 0),
      immich_asset_id: String(row.immich_asset_id ?? ''),
      session_id: String(row.session_id ?? ''),
      taken_at: String(row.taken_at ?? ''),
      width: row.width == null ? null : Number(row.width),
      height: row.height == null ? null : Number(row.height),
      created_at: String(row.created_at ?? '')
    };
  } catch {
    return null;
  }
}

/**
 * Get a photo by Immich asset ID
 */
export async function getPhotoByImmichAssetId(immichAssetId: string): Promise<Photo | null> {
  try {
    await ensureDatabaseInitialized();

    const query = 'SELECT * FROM photos WHERE immich_asset_id = ?';
    const rows = await turso.execute(query, [immichAssetId]);

    if (rows.rows.length === 0) {
      return null;
    }

    const row = rows.rows[0];
    return {
      id: Number(row.id ?? 0),
      immich_asset_id: String(row.immich_asset_id ?? ''),
      session_id: String(row.session_id ?? ''),
      taken_at: String(row.taken_at ?? ''),
      width: row.width == null ? null : Number(row.width),
      height: row.height == null ? null : Number(row.height),
      created_at: String(row.created_at ?? '')
    };
  } catch {
    return null;
  }
}

/**
 * Get all photos for a session
 */
export async function getPhotosBySessionId(sessionId: string): Promise<Photo[]> {
  try {
    await ensureDatabaseInitialized();

    const query = 'SELECT * FROM photos WHERE session_id = ? ORDER BY taken_at DESC';
    const rows = await turso.execute(query, [sessionId]);

    return rows.rows.map((row: Record<string, unknown>) => ({
      id: Number(row.id ?? 0),
      immich_asset_id: String(row.immich_asset_id ?? ''),
      session_id: String(row.session_id ?? ''),
      taken_at: String(row.taken_at ?? ''),
      width: row.width == null ? null : Number(row.width),
      height: row.height == null ? null : Number(row.height),
      created_at: String(row.created_at ?? '')
    }));
  } catch {
    return [];
  }
}

/**
 * Update a photo
 */
export async function updatePhoto(id: number, updates: Partial<Omit<Photo, 'id' | 'created_at'>>): Promise<Photo> {
  await ensureDatabaseInitialized();

  // First get the current photo
  const currentPhoto = await getPhotoById(id);
  if (!currentPhoto) {
    throw new Error(`Photo with id ${id} not found`);
  }

  // Build dynamic update query
  const fields = [];
  const values = [];

  if (updates.immich_asset_id !== undefined) {
    fields.push('immich_asset_id = ?');
    values.push(updates.immich_asset_id);
  }

  if (updates.session_id !== undefined) {
    fields.push('session_id = ?');
    values.push(updates.session_id);
  }

  if (updates.taken_at !== undefined) {
    fields.push('taken_at = ?');
    values.push(updates.taken_at);
  }

  if (updates.width !== undefined) {
    fields.push('width = ?');
    values.push(updates.width ?? null);
  }

  if (updates.height !== undefined) {
    fields.push('height = ?');
    values.push(updates.height ?? null);
  }

  if (fields.length === 0) {
    return currentPhoto;
  }

  values.push(id); // for WHERE clause

  const query = `
    UPDATE photos
    SET ${fields.join(', ')}
    WHERE id = ?
  `;

  await turso.execute(query, values);

  // Return updated photo
  const updatedPhoto = await getPhotoById(id);
  if (!updatedPhoto) {
    throw new Error(`Failed to retrieve updated photo with id ${id}`);
  }

  return updatedPhoto;
}

/**
 * Delete a photo
 */
export async function deletePhoto(id: number): Promise<void> {
  await ensureDatabaseInitialized();

  const query = 'DELETE FROM photos WHERE id = ?';
  await turso.execute(query, [id]);
}

/**
 * Delete all photos for a session (used when deleting a session)
 */
export async function deletePhotosBySessionId(sessionId: string): Promise<void> {
  await ensureDatabaseInitialized();

  const query = 'DELETE FROM photos WHERE session_id = ?';
  await turso.execute(query, [sessionId]);
}

export default turso;