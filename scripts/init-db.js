import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const env = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

async function main() {
  const envFile = loadEnvFile(path.join(process.cwd(), '.env.local'));
  process.env.TURSO_DATABASE_URL ??= envFile.TURSO_DATABASE_URL ?? 'file:./local.db';
  process.env.TURSO_AUTH_TOKEN ??= envFile.TURSO_AUTH_TOKEN ?? undefined;

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const statements = schemaSql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await client.execute(statement);
  }

  console.log('Database schema initialized successfully.');
}

main().catch((error) => {
  console.error('Failed to initialize database schema:', error);
  process.exit(1);
});
