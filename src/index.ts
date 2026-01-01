import { Hono } from 'hono';
import indexRoute from './routes/index.js';
import postRoute from './routes/post.js';
import type { Env } from './types/bindings.js';

const app = new Hono<{ Bindings: Env }>();

// Serve static CSS file
app.get('/style.css', (c) => {
  // Read CSS file content - this will be bundled by Wrangler
  const cssContent = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial,
    sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header h1 {
  text-align: center;
  font-size: 1.8rem;
}

main {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

footer {
  text-align: center;
  padding: 2rem 0;
  color: #666;
  font-size: 0.9rem;
}

.btn {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
  background-color: #ecf0f1;
  color: #2c3e50;
}

.btn:hover {
  background-color: #bdc3c7;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-disabled {
  background-color: #ecf0f1;
  color: #95a5a6;
  cursor: not-allowed;
}

.header-actions {
  margin-bottom: 1.5rem;
}

.message-list-container {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.6rem;
  background-color: #fafafa;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}

.message-name {
  font-weight: bold;
  color: #2c3e50;
}

.message-date {
  color: #7f8c8d;
}

.message-body {
  color: #2c3e50;
  white-space: pre-wrap;
  word-break: break-word;
}

.no-messages {
  text-align: center;
  padding: 3rem 0;
  color: #7f8c8d;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-info {
  color: #7f8c8d;
}

.post-form-container {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-form-container h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #2c3e50;
}

.required {
  color: #e74c3c;
}

.form-group input,
.form-group textarea {
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-group input.error,
.form-group textarea.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.form-actions button {
  flex: 1;
}

@media (max-width: 600px) {
  header h1 {
    font-size: 1.5rem;
  }

  main {
    margin: 1rem auto;
  }

  .message-list-container,
  .post-form-container {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
}`;

  return c.text(cssContent, 200, {
    'Content-Type': 'text/css',
    'Cache-Control': 'public, max-age=31536000',
  });
});

app.route('/', indexRoute);
app.route('/', postRoute);

export default app;
