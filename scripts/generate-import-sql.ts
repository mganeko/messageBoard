import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Message {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

try {
  const dataPath = join(__dirname, '../migration-data.json');
  const data = JSON.parse(readFileSync(dataPath, 'utf-8')) as Message[];

  if (data.length === 0) {
    console.log('No data to import');
    const outputPath = join(__dirname, '../migration-data.sql');
    writeFileSync(outputPath, '-- No data to import\n');
    console.log('✓ Created empty migration-data.sql');
    process.exit(0);
  }

  const sqlStatements = data.map((msg) => {
    const name = msg.name.replace(/'/g, "''");
    const message = msg.message.replace(/'/g, "''");
    return `INSERT INTO messages (id, name, message, created_at) VALUES (${msg.id}, '${name}', '${message}', '${msg.created_at}');`;
  });

  const sql = sqlStatements.join('\n');
  const outputPath = join(__dirname, '../migration-data.sql');
  writeFileSync(outputPath, sql);

  console.log(`✓ Generated migration-data.sql with ${data.length} messages`);
} catch (error) {
  console.error('Error generating SQL:', error);
  process.exit(1);
}
