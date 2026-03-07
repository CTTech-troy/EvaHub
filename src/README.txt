
EvaHub — Demo Course Membership Site (static)

Files:
- index.html : Frontend HTML
- style.css  : Styling (dark theme)
- app.js     : Frontend logic (localStorage demo)
- .env       : Environment variables (secrets)
- .env.example : Environment template
- .gitignore : Git ignore rules
- README.txt : This file

Environment Setup:
1. Copy .env.example to .env
2. Fill in your actual values:
   - TELEGRAM_BOT_TOKEN: Get from @BotFather on Telegram
   - TELEGRAM_CHAT_ID: Your Telegram chat/group ID
   - BTC_ADDRESS: Your Bitcoin wallet address
   - USDT_ADDRESS: Your USDT (TRC20) wallet address

Security Notes:
- Never commit .env file to version control
- In production, use build-time environment variable injection
- The current setup uses fallback values for development

Features:
- User authentication with localStorage
- Referral system with point-based tiers
- Preview library with auto-playing videos (3s limit)
- Payment processing (crypto + gift cards)
- Telegram notifications for admin
- Image analysis for payment verification

Notes:
- This is a static demo. No backend included.
- Payments are simulated. After payment, user should paste transaction id and click 'I Paid'.
- Admin review & sending of real Mega links would require a server/backend to automate.
- To run: open index.html in a browser.

Contact:
Telegram: https://t.me/Sqyas6
Email: am22yearsqueen@gmail.com
