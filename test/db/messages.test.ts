import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';

interface Message {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

let testDb: Database.Database;

before(() => {
  testDb = new Database(':memory:');

  testDb.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_messages_created_at
    ON messages(created_at DESC);
  `);
});

beforeEach(() => {
  testDb.exec('DELETE FROM messages');
});

after(() => {
  testDb.close();
});

function getMessages(limit: number, offset: number): Message[] {
  const stmt = testDb.prepare(`
    SELECT id, name, message, created_at
    FROM messages
    ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset) as Message[];
}

function createMessage(newMessage: { name: string; message: string }): Message {
  const stmt = testDb.prepare(`
    INSERT INTO messages (name, message)
    VALUES (?, ?)
  `);
  const result = stmt.run(newMessage.name, newMessage.message);

  const selectStmt = testDb.prepare(
    'SELECT id, name, message, created_at FROM messages WHERE id = ?'
  );
  return selectStmt.get(result.lastInsertRowid) as Message;
}

function getMessageCount(): number {
  const stmt = testDb.prepare('SELECT COUNT(*) as count FROM messages');
  const result = stmt.get() as { count: number };
  return result.count;
}

test('createMessage should insert a new message and return it', () => {
  const newMessage = { name: 'テストユーザー', message: 'テストメッセージ' };
  const result = createMessage(newMessage);

  assert.strictEqual(typeof result.id, 'number');
  assert.strictEqual(result.name, newMessage.name);
  assert.strictEqual(result.message, newMessage.message);
  assert.strictEqual(typeof result.created_at, 'string');
});

test('getMessages should return messages in descending order', () => {
  createMessage({ name: 'ユーザー1', message: 'メッセージ1' });
  createMessage({ name: 'ユーザー2', message: 'メッセージ2' });
  createMessage({ name: 'ユーザー3', message: 'メッセージ3' });

  const messages = getMessages(3, 0);

  assert.strictEqual(messages.length, 3);
  assert.strictEqual(messages[0].message, 'メッセージ3');
  assert.strictEqual(messages[1].message, 'メッセージ2');
  assert.strictEqual(messages[2].message, 'メッセージ1');
});

test('getMessages should support pagination', () => {
  createMessage({ name: 'ユーザー1', message: 'メッセージ1' });
  createMessage({ name: 'ユーザー2', message: 'メッセージ2' });
  createMessage({ name: 'ユーザー3', message: 'メッセージ3' });
  createMessage({ name: 'ユーザー4', message: 'メッセージ4' });

  const messages = getMessages(2, 0);
  assert.strictEqual(messages.length, 2);

  const nextMessages = getMessages(2, 2);
  assert.strictEqual(nextMessages.length, 2);
  assert.notStrictEqual(messages[0].id, nextMessages[0].id);
});

test('getMessageCount should return correct count', () => {
  createMessage({ name: 'ユーザー1', message: 'メッセージ1' });
  createMessage({ name: 'ユーザー2', message: 'メッセージ2' });
  createMessage({ name: 'ユーザー3', message: 'メッセージ3' });

  const count = getMessageCount();
  assert.strictEqual(count, 3);
});
