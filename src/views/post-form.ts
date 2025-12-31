import { html } from 'hono/html';

interface FormData {
  name?: string;
  message?: string;
}

interface FormErrors {
  name?: string;
  message?: string;
}

export function postForm(formData: FormData = {}, errors: FormErrors = {}) {
  return html`
    <div class="post-form-container">
      <h2>新しいメッセージを投稿</h2>

      <form method="POST" action="/post" class="post-form">
        <div class="form-group">
          <label for="name">名前 <span class="required">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            value="${formData.name || ''}"
            maxlength="50"
            required
            class="${errors.name ? 'error' : ''}"
          />
          ${errors.name
            ? html`<span class="error-message">${errors.name}</span>`
            : ''}
        </div>

        <div class="form-group">
          <label for="message"
            >メッセージ <span class="required">*</span></label
          >
          <textarea
            id="message"
            name="message"
            rows="5"
            maxlength="1000"
            required
            class="${errors.message ? 'error' : ''}"
          >
${formData.message || ''}</textarea
          >
          ${errors.message
            ? html`<span class="error-message">${errors.message}</span>`
            : ''}
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">投稿する</button>
          <a href="/" class="btn">キャンセル</a>
        </div>
      </form>
    </div>
  `;
}
