<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI-Powered Learning Assistant

An interactive, privacy-friendly learning assistant. Paste or upload a document (.txt, .md, .pdf), then ask questions and get grounded answers with highlighted sources taken directly from your content. Built with React, Vite, Tailwind CSS v4, and Google Gemini.

---

## Features

- **Document ingestion**: Upload PDF, TXT, or Markdown, or paste text directly.
- **Grounded answers**: Responses cite exact supporting sentences from your document.
- **Chat UX**: Clean two-pane layout with message bubbles and copy-to-clipboard.
- **Responsive UI**: Stacks on mobile, splits panes on tablets/desktops.
- **Theme toggle**: Light/Dark mode with preference saved to `localStorage`.
- **Robust parsing**: PDF parsing via `pdf.js` loaded from CDN.
- **Error handling**: Friendly errors with details surfaced in chat.

---

## Tech Stack

- **Frontend**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 (PostCSS via `@tailwindcss/postcss`), custom CSS
- **AI**: `@google/genai` (Gemini)
- **Language**: TypeScript

---

## Project Structure

```
ai-powered-learning-assistant/
├─ components/
│  ├─ ChatInterface.tsx       # Input box + message list
│  ├─ DocumentInput.tsx       # Upload & textarea input
│  ├─ Message.tsx             # Chat bubble + sources + copy button
│  └─ icons/Icons.tsx         # Reusable SVG icon set
├─ services/
│  └─ geminiService.ts        # AI call + schema + error handling
├─ index.html                 # App entry HTML
├─ index.tsx                  # React/Vite bootstrap (imports index.css)
├─ App.tsx                    # Page layout + theme toggle
├─ index.css                  # Tailwind v4 import + global styles
├─ vite.config.ts             # Env mapping (Gemini key) + aliases
├─ postcss.config.js          # Tailwind v4 PostCSS plugin config
├─ tailwind.config.ts         # Tailwind config (dark mode, content)
├─ package.json
└─ README.md
```

---

## Getting Started

- **Prerequisites**
  - Node.js 18+ (Node 20+ recommended)
  - npm 9+

- **Install dependencies**
  - `npm install`

- **Environment variables**
  - Create a `.env.local` file at the repo root with:
    ```bash
    GEMINI_API_KEY=your_api_key_here
    ```
  - `vite.config.ts` maps this to `process.env.API_KEY` at build time so the Gemini client can read it:
    ```ts
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    }
    ```

- **Run the app**
  - `npm run dev`
  - Visit the URL printed in your terminal (typically http://localhost:5173)

---

## How It Works

- **AI calls**: `services/geminiService.ts` builds a grounded prompt using your document as context and calls Gemini (`@google/genai`).
- **Structured output**: The model is asked to return JSON `{ answer, sources }` using a response schema. If JSON parsing fails, the plain text response is used.
- **Error handling**: Errors are caught and displayed in the UI (e.g., transient 503 overloads) so you can retry later.
- **UI flow**:
  - Load or paste document in `DocumentInput`.
  - Ask a question in `ChatInterface`.
  - See the answer and the supporting sentences in `Message`.

---

## Styling & Theme

- **Tailwind CSS v4**
  - Configured via PostCSS using the new plugin: `@tailwindcss/postcss`.
  - Global CSS (`index.css`) uses the v4 import:
    ```css
    @import "tailwindcss";
    ```
- **Dark/Light Mode**
  - Toggle button in `App.tsx` switches the `dark` class on `html/body`.
  - Preference stored in `localStorage` and respects system preference on first load.
- **Responsive Design**
  - Mobile: panes stack vertically; chat input adjusts sizes and spacing.
  - Desktop: document pane on the left, chat on the right; sticky chat header.

---

## Troubleshooting

- **Tailwind PostCSS error**: “Looks like you're trying to use `tailwindcss` directly...”
  - Install the correct plugin and update PostCSS config:
    - `npm i -D @tailwindcss/postcss`
    - `postcss.config.js` should contain:
      ```js
      export default {
        plugins: {
          '@tailwindcss/postcss': {},
          autoprefixer: {},
        },
      };
      ```
- **503 Model Overloaded**
  - This is a transient provider-side error. Retry after a short delay.
  - Ensure your API key is valid and rate limits are not exceeded.
- **Node engine warnings (EBADENGINE)**
  - Upgrade Node to 18+ (preferably 20+). Verify with `node -v`.
- **No styles / Tailwind classes not applied**
  - Ensure `index.css` is imported in `index.tsx` and the dev server is restarted.
- **PDF not parsed**
  - We load `pdf.js` via CDN in `index.html`; ensure network access is available.

---

## Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build locally

---

## Security Notes

- Do not commit `.env.local`. Keep your API keys private.
- This app sends your document text to the AI provider for responses; ensure this is acceptable for your use case.

---

## Roadmap Ideas

- Streaming responses
- Citing page numbers for PDFs
- Multi-file contexts
- Export chat as Markdown or PDF

---

## License

This project is provided as-is for learning purposes. Add your preferred license here.
