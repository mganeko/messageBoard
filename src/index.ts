import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { serve } from '@hono/node-server';
import { initializeDatabase } from './db/schema.js';
import indexRoute from './routes/index.js';
import postRoute from './routes/post.js';

initializeDatabase();

const app = new Hono();

app.use('/style.css', serveStatic({ path: './public/style.css' }));

app.route('/', indexRoute);
app.route('/', postRoute);

const port = 3000;

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is running on http://localhost:${port}`);
