# 💸 SpendSense — Your Money, Made Understandable

A full-stack personal finance web application built for hackathon, designed to transform ordinary expense records into actionable financial insights.

## 🚀 Features

- **📊 Dashboard** — Real-time spending overview with beautiful charts and KPI cards
- **💳 Transactions** — Add, edit, delete expenses with UPI/card/cash support
- **🎯 Budgets** — Set monthly + category-wise budgets with live alerts
- **📈 Analytics** — Trend charts, category breakdowns, month-over-month comparisons
- **🤖 AI Wealth Advisor** — Smart financial insights powered by Gemini AI
- **🛒 Can I Buy This?** — Affordability checker with SIP opportunity calculator
- **🏆 Tiny Challenges** — Gamified weekly saving challenges
- **💡 Savings Simulator** — See how small daily cuts grow over time
- **👥 Split Bills** — Split expenses with friends, track who's paid, copy UPI reminders

## 🎨 Design

- Dark mode first with glassmorphism effects
- Indian Rupee (₹) and Indian numbering format
- Tailwind CSS with custom midnight + brand-teal palette
- Chart.js for all data visualizations
- Mobile responsive with bottom nav

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3
- **Charts**: Chart.js + react-chartjs-2
- **AI**: Google Gemini API (optional — works offline with smart rule engine)
- **Storage**: localStorage (no backend required)

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## ⚙️ AI Setup (Optional)

To enable live Gemini AI responses:
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open SpendSense → Settings (bottom left) → Paste your API key
3. The AI Wealth Advisor will now use Gemini for real-time responses

Without a key, the app uses a built-in rule-based AI engine that works completely offline.

---

Built with ❤️ for the hackathon. Made for Indian students and everyday users.
