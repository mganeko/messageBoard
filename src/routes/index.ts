import { Hono } from 'hono';
import { getMessages, getMessageCount } from '../db/messages.js';
import { layout } from '../views/layout.js';
import { messageList } from '../views/message-list.js';
import type { Env } from '../types/bindings.js';

const app = new Hono<{ Bindings: Env }>();

const MESSAGES_PER_PAGE = 20;

app.get('/', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const offset = (page - 1) * MESSAGES_PER_PAGE;

  const db = c.env.DB;
  const messages = await getMessages(db, MESSAGES_PER_PAGE, offset);
  const totalCount = await getMessageCount(db);
  const totalPages = Math.max(1, Math.ceil(totalCount / MESSAGES_PER_PAGE));

  const content = messageList(messages, page, totalPages);
  return c.html(layout('メッセージボード', content));
});

export default app;
