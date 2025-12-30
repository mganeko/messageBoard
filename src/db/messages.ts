import { db } from './connection.js';
import type { Message, NewMessage } from '../types/message.js';

export function getMessages(limit: number, offset: number): Message[] {
  const stmt = db.prepare(`
    SELECT id, name, message, created_at
    FROM messages
    ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset) as Message[];
}

export function createMessage(newMessage: NewMessage): Message {
  const stmt = db.prepare(`
    INSERT INTO messages (name, message)
    VALUES (?, ?)
  `);
  const result = stmt.run(newMessage.name, newMessage.message);

  const selectStmt = db.prepare('SELECT id, name, message, created_at FROM messages WHERE id = ?');
  return selectStmt.get(result.lastInsertRowid) as Message;
}

export function getMessageCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM messages');
  const result = stmt.get() as { count: number };
  return result.count;
}
