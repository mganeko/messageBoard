import { html } from 'hono/html';
import type { Message } from '../types/message.js';

export function messageList(
  messages: Message[],
  currentPage: number,
  totalPages: number
) {
  return html`
    <div class="message-list-container">
      <div class="header-actions">
        <a href="/post" class="btn btn-primary">新しいメッセージを投稿</a>
      </div>

      ${messages.length === 0
        ? html`<p class="no-messages">
            まだメッセージがありません。最初の投稿をしてみましょう！
          </p>`
        : html`
            <div class="messages">
              ${messages.map(
                (msg) => html`
                  <div class="message-card">
                    <div class="message-header">
                      <span class="message-name">${msg.name}</span>
                      <span class="message-date"
                        >${formatDate(msg.created_at)}</span
                      >
                    </div>
                    <div class="message-body">${msg.message}</div>
                  </div>
                `
              )}
            </div>

            ${totalPages > 1
              ? html`
                  <div class="pagination">
                    ${currentPage > 1
                      ? html`<a href="/?page=${currentPage - 1}" class="btn"
                          >前へ</a
                        >`
                      : html`<span class="btn btn-disabled">前へ</span>`}
                    <span class="page-info"
                      >ページ ${currentPage} / ${totalPages}</span
                    >
                    ${currentPage < totalPages
                      ? html`<a href="/?page=${currentPage + 1}" class="btn"
                          >次へ</a
                        >`
                      : html`<span class="btn btn-disabled">次へ</span>`}
                  </div>
                `
              : ''}
          `}
    </div>
  `;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}
