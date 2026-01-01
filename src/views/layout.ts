import { html } from 'hono/html';

export function layout(
  title: string,
  content: ReturnType<typeof html> | string
) {
  return html`<!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <header>
          <h1>メッセージボード</h1>
        </header>
        <main>${content}</main>
        <footer>
          <p>&copy; 2025 Message Board</p>
        </footer>
      </body>
    </html>`;
}
