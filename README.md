# Top 1% Dating Profile Optimizer

An AI-powered, client-side web app that analyzes your dating profile photo and bio using Google Gemini Vision and gives you brutally honest, actionable feedback to get more quality matches.

## Features

- **Photo Analysis:** Gemini Vision evaluates lighting, composition, body language, lifestyle signaling, and overall attractiveness of your profile photo.
- **Bio Highlighting:** Paste your bio or Hinge/Bumble/Tinder prompts and get color-coded highlights (green = strong, yellow = polish, red = fix) with before/after suggestions.
- **Match Score:** Get a 0–100 match score based on photo quality, bio personality, authenticity, and conversation-starter potential.
- **Top 3 Improvements:** The three highest-impact changes you can make right now.
- **Hover Tooltips:** Hover any highlighted bio phrase or photo feedback chip to see exactly what's wrong and how to fix it.
- **Bring Your Own Key (BYOK):** Uses your own Google Gemini API key — stored only in your browser's `localStorage`, never on any server.
- **100% Client-Side:** Your photo and bio go directly from your browser to the Gemini API. Nothing is uploaded to a backend.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| AI | Google Gemini 2.5 Pro (Vision API) |

## Getting Started

### Prerequisites

- Node.js v18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

### Usage

1. Upload your profile photo (JPG, PNG, or WebP).
2. Optionally paste your bio and prompt answers into the text area.
3. Click **Analyze My Profile**.
4. On first use, enter your Gemini API key when prompted — it's saved locally in your browser.
5. Review your Match Score, Profile Assessment, Top 3 Improvements, and detailed feedback.
6. Hover over highlighted bio phrases or photo chips to see specific before/after suggestions.

You can clear your saved API key at any time using the **Clear API Key** button in the header.

## Privacy & Security

- Your photo is converted to base64 in the browser and sent directly to the Gemini API — it never touches our servers.
- Your API key is stored only in your browser's `localStorage`.
- No analytics, no tracking, no data retention.

## License

MIT
