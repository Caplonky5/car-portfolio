-- Database schema for car portfolio sessions and photos

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  car_name TEXT,
  description TEXT,
  cover_asset_id TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  immich_asset_id TEXT UNIQUE NOT NULL,
  session_id TEXT NOT NULL,
  taken_at TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_slug ON sessions(slug);
CREATE INDEX IF NOT EXISTS idx_sessions_cover_asset_id ON sessions(cover_asset_id);
CREATE INDEX IF NOT EXISTS idx_photos_session_id ON photos(session_id);
CREATE INDEX IF NOT EXISTS idx_photos_immich_asset_id ON photos(immich_asset_id);
CREATE INDEX IF NOT EXISTS idx_photos_taken_at ON photos(taken_at);
