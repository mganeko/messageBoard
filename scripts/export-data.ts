import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../message-board.db');

try {
  const db = new Database(dbPath);
  const messages = db.prepare('SELECT * FROM messages ORDER BY id ASC').all();

  const outputPath = join(__dirname, '../migration-data.json');
  writeFileSync(outputPath, JSON.stringify(messages, null, 2));

  db.close();
  console.log(`✓ Exported ${messages.length} messages to migration-data.json`);
} catch (error) {
  if (
    error instanceof Error &&
    'code' in error &&
    error.code === 'SQLITE_CANTOPEN'
  ) {
    console.log('No database file found - creating empty migration file');
    const outputPath = join(__dirname, '../migration-data.json');
    writeFileSync(outputPath, JSON.stringify([], null, 2));
    console.log('✓ Created empty migration-data.json');
  } else {
    console.error('Error exporting data:', error);
    process.exit(1);
  }
}
