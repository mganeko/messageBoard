import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import {
  getMessages,
  createMessage,
  getMessageCount,
} from '../../src/db/messages.js';

// D1Database の互換レイヤーを作成
class D1DatabaseWrapper {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  prepare(query: string) {
    const stmt = this.db.prepare(query);
    return new D1PreparedStatementWrapper(stmt);
  }
}

class D1PreparedStatementWrapper {
  private stmt: Database.Statement;
  private boundValues: unknown[] = [];

  constructor(stmt: Database.Statement) {
    this.stmt = stmt;
  }

  bind(...values: unknown[]) {
    this.boundValues = values;
    return this;
  }

  all<T>() {
    const results = this.stmt.all(...this.boundValues) as T[];
    return Promise.resolve({ results });
  }

  first<T>() {
    const result = this.stmt.get(...this.boundValues) as T | undefined;
    return Promise.resolve(result ?? null);
  }

  run() {
    const info = this.stmt.run(...this.boundValues);
    return Promise.resolve({
      meta: {
        last_row_id: info.lastInsertRowid as number,
      },
    });
  }
}

let testDb: Database.Database;
let db: D1Database;

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

  db = new D1DatabaseWrapper(testDb) as unknown as D1Database;
});

beforeEach(() => {
  testDb.exec('DELETE FROM messages');
});

after(() => {
  testDb.close();
});

test('createMessage should insert a new message and return it', async () => {
  const newMessage = { name: 'テストユーザー', message: 'テストメッセージ' };
  const result = await createMessage(db, newMessage);

  assert.strictEqual(typeof result.id, 'number');
  assert.strictEqual(result.name, newMessage.name);
  assert.strictEqual(result.message, newMessage.message);
  assert.strictEqual(typeof result.created_at, 'string');
});

test('getMessages should return messages in descending order', async () => {
  await createMessage(db, { name: 'ユーザー1', message: 'メッセージ1' });
  await createMessage(db, { name: 'ユーザー2', message: 'メッセージ2' });
  await createMessage(db, { name: 'ユーザー3', message: 'メッセージ3' });

  const messages = await getMessages(db, 3, 0);

  assert.strictEqual(messages.length, 3);
  assert.strictEqual(messages[0].message, 'メッセージ3');
  assert.strictEqual(messages[1].message, 'メッセージ2');
  assert.strictEqual(messages[2].message, 'メッセージ1');
});

test('getMessages should support pagination', async () => {
  await createMessage(db, { name: 'ユーザー1', message: 'メッセージ1' });
  await createMessage(db, { name: 'ユーザー2', message: 'メッセージ2' });
  await createMessage(db, { name: 'ユーザー3', message: 'メッセージ3' });
  await createMessage(db, { name: 'ユーザー4', message: 'メッセージ4' });

  const messages = await getMessages(db, 2, 0);
  assert.strictEqual(messages.length, 2);

  const nextMessages = await getMessages(db, 2, 2);
  assert.strictEqual(nextMessages.length, 2);
  assert.notStrictEqual(messages[0].id, nextMessages[0].id);
});

test('getMessageCount should return correct count', async () => {
  await createMessage(db, { name: 'ユーザー1', message: 'メッセージ1' });
  await createMessage(db, { name: 'ユーザー2', message: 'メッセージ2' });
  await createMessage(db, { name: 'ユーザー3', message: 'メッセージ3' });

  const count = await getMessageCount(db);
  assert.strictEqual(count, 3);
});
