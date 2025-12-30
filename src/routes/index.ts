import { Hono } from 'hono';
import { getMessages, getMessageCount } from '../db/messages.js';
import { layout } from '../views/layout.js';
import { messageList } from '../views/message-list.js';

const app = new Hono();

const MESSAGES_PER_PAGE = 20;

app.get('/', (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const offset = (page - 1) * MESSAGES_PER_PAGE;

  const messages = getMessages(MESSAGES_PER_PAGE, offset);
  const totalCount = getMessageCount();
  const totalPages = Math.max(1, Math.ceil(totalCount / MESSAGES_PER_PAGE));

  const content = messageList(messages, page, totalPages);
  return c.html(layout('メッセージボード', content));
});

export default app;
