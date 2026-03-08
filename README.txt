# EvaHub Demo

This workspace contains a frontend (index.html + src/app.js) and a simple Node.js backend (`server.js`) that handles payment submissions.

## Setup

1. Install server dependencies:
```bash
cd c:\Users\Abdulsalam Korede\Desktop\astro
npm install
```

2. Run the backend:
```bash
node server.js
```
By default it listens on port 3000. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` environment variables before starting or edit `server.js` directly.

3. Serve the frontend. You can open `index.html` in the browser or use a local server such as Live Server (port 5500 is assumed).

4. Ensure `config.BACKEND_URL` in `src/app.js` points to your backend (e.g. `https://evahub.netlify.app`).

## Payment flow

- Crypto payments require exactly one screenshot image.
- Gift card payments require at least one image (front) and may include a back image.
- The frontend validates the files and POSTs them (along with type, user name, amount) to `/submit-payment`.
- The backend immediately sends the photos to Telegram using the Bot API. If that fails, it falls back to sending public URLs for the uploaded images.
- No database is used; all data lives in the request payload or in-memory (uploads folder for fallback links). Files are served statically under `/uploads`.

## Admin

After a payment is submitted, the user receives a pending message. An admin can open the approval link (shown in the Telegram message) to view the proof image and grant access. The local frontend holds the proof data URL so an additional window opens with the image.

---

This setup meets the requirements described in the latest user request: transaction-type rules, immediate Telegram forwarding, no database storage, and appropriate UI adjustments.
