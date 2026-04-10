# Social Media Studio

> Turn a rough idea into a ready-to-post Instagram creative in seconds.

A full-stack AI-powered studio that generates polished social media content for educational brands targeting Indian parents.

**Live Demo:** [your-app.onrender.com](https://your-app.onrender.com)  
**Video Walkthrough:** [loom link here]

---

## What It Does

You type a rough idea. The app returns:

- Structured slide content (headline, body, visual direction)
- Live editable preview in the browser
- Instagram caption with hashtags
- Downloadable PNG per slide

Supports three formats: **Post (1:1)**, **Story (9:16)**, and **Carousel (multi-slide)**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| AI | Groq API — LLaMA 3 (8B) |
| Frontend | Vanilla HTML + CSS + JS |
| Export | Client-side PNG via html-to-image |
| Deployment | Render |

---

## Project Structure

```
project/
├── backend/
│   ├── server.js           — Express app entry point
│   ├── routes/
│   │   └── generate.js     — POST /generate route
│   ├── services/
│   │   ├── aiService.js    — Groq API call + JSON parsing + fallback
│   │   ├── renderService.js — Converts slide JSON to styled HTML
│   │   └── exportService.js — PNG export logic
│   └── utils/
│       └── brandContext.js  — Brand config injected into every AI prompt
├── frontend/
│   ├── index.html
│   ├── app.css
│   └── app.js
├── package.json
└── README.md
```

---

## How It Works

```
User types idea + picks format
        ↓
Frontend sends POST /generate
        ↓
Backend injects brand context into prompt
        ↓
Groq API (LLaMA 3) returns structured JSON
        ↓
Backend cleans + validates response
        ↓
Slides rendered in browser
        ↓
User edits content → downloads PNG
```

---

## Brand System

Every AI prompt is automatically injected with Cuemath's brand rules:

- **Primary:** `#FF6B00` — Orange
- **Secondary:** `#1A1A2E` — Dark Navy
- **Accent:** `#FFD700` — Gold
- **Font:** Inter
- **Tone:** Warm, simple, parent-friendly
- **Audience:** Indian parents of school-going children

---

## Setup

**1. Clone and install**

```bash
git clone https://github.com/your-username/social-studio
cd social-studio
npm install
```

**2. Set your API key**

Create a `.env` file in the root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get a free key at [console.groq.com](https://console.groq.com) — no credit card needed.

**3. Run locally**

```bash
node server.js
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Reference

### `POST /generate`

**Request**
```json
{
  "idea": "Why Indian kids forget what they study",
  "format": "carousel"
}
```

**Response**
```json
{
  "slides": [
    {
      "slide_number": 1,
      "headline": "Your child isn't forgetting. They're just not reviewing.",
      "body": "Research shows we forget 70% of new information within 24 hours without review.",
      "visual_description": "Warm illustration of a child at a desk, textbook open",
      "bg_color": "#FFF4E6",
      "text_color": "#1A1A2E",
      "accent_color": "#FF6B00"
    }
  ],
  "caption": "Did you know most students forget new concepts within a day? ..."
}
```

---

## Key Engineering Decisions

**Why Groq over OpenAI/Gemini?**  
Groq's free tier is fast and stable for structured JSON generation. Gemini throttled too aggressively at low request volumes. Groq's LLaMA 3 model returns consistent output for this use case.

**Why a strict JSON-only prompt?**  
LLMs often wrap JSON in markdown or add explanations. The backend strips fences, extracts the JSON object by brace matching, and validates structure before sending to frontend. If validation fails, a fallback slide builder uses the raw text gracefully instead of crashing.

**Why Render over Vercel?**  
This project runs a persistent Express server with stateful routes. Vercel converts backends to serverless functions which causes timeout and routing issues with Express. Render runs `node server.js` exactly as local.

---

## Deployment

Deployed on **Render** (free tier).

Environment variable to set in Render dashboard:
```
GROQ_API_KEY = your_key_here
```

Start command:
```bash
node server.js
```

Ensure `server.js` uses dynamic port:
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT);
```

---

<<<<<<< Updated upstream
=======
## What I Would Add With More Time

- AI image generation per slide (Stable Diffusion / Together AI)
- Export full carousel as ZIP
- Brand preset switching (not just Cuemath)
- Save and revisit past generations
- Multi-language support (Hindi captions)
>>>>>>> Stashed changes

---

## Author

**Pragy Upadhyay**  
Final Year B.Tech ECE — JIIT Noida  
<<<<<<< Updated upstream
[LinkedIn](https://linkedin.com/in/pragy-upadhyay-893895246) · [GitHub](https://github.com/pragy34)
=======
[LinkedIn](https://linkedin.com/in/pragy-upadhyay-893895246) ·
 [GitHub](https://github.com/pragy34)
>>>>>>> Stashed changes
