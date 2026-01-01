import type { Message, NewMessage } from '../types/message.js';

export async function getMessages(
  db: D1Database,
  limit: number,
  offset: number
): Promise<Message[]> {
  const stmt = db.prepare(`
    SELECT id, name, message, created_at
    FROM messages
    ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
  `);
  const result = await stmt.bind(limit, offset).all<Message>();
  return result.results;
}

export async function createMessage(
  db: D1Database,
  newMessage: NewMessage
): Promise<Message> {
  const stmt = db.prepare(`
    INSERT INTO messages (name, message)
    VALUES (?, ?)
  `);
  const result = await stmt.bind(newMessage.name, newMessage.message).run();

  const selectStmt = db.prepare(
    'SELECT id, name, message, created_at FROM messages WHERE id = ?'
  );
  const createdMessage = await selectStmt
    .bind(result.meta.last_row_id)
    .first<Message>();
  if (!createdMessage) {
    throw new Error('Failed to retrieve created message');
  }
  return createdMessage;
}

export async function getMessageCount(db: D1Database): Promise<number> {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM messages');
  const result = await stmt.first();
  return (result as { count: number }).count;
}
