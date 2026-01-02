import { Hono } from 'hono';
import { createMessage } from '../db/messages.js';
import { layout } from '../views/layout.js';
import { postForm } from '../views/post-form.js';
import type { Env } from '../types/bindings.js';

const app = new Hono<{ Bindings: Env }>();

app.get('/post', (c) => {
  const content = postForm();
  return c.html(layout('新規投稿', content));
});

app.post('/post', async (c) => {
  const body = await c.req.parseBody();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  const errors: { name?: string; message?: string } = {};

  if (!name) {
    errors.name = '名前を入力してください';
  } else if (name.length > 50) {
    errors.name = '名前は50文字以内で入力してください';
  }

  if (!message) {
    errors.message = 'メッセージを入力してください';
  } else if (message.length > 1000) {
    errors.message = 'メッセージは1000文字以内で入力してください';
  }

  if (Object.keys(errors).length > 0) {
    const content = postForm({ name, message }, errors);
    return c.html(layout('新規投稿', content));
  }

  const db = c.env.DB;
  await createMessage(db, { name, message });
  return c.redirect('/');
});

export default app;
