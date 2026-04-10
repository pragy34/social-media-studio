# Social Media Studio

Social Media Studio is a clean full-stack web app for the Cuemath AI Builder challenge. It takes a rough content idea, generates polished social media slides with Gemini, previews them instantly, lets you edit the copy, and exports each slide as a PNG.

## Project Overview

- Input: content idea + format selection (`post`, `story`, or `carousel`)
- Output: structured slide content, rendered visual previews, editable copy, downloadable images, and a caption with hashtags
- Brand system: Cuemath palette, Inter font, warm tone, and parent-friendly writing for Indian parents

## Folder Structure

```text
project/
|- backend/
|  |- routes/
|  |  |- generate.js
|  |- services/
|  |  |- aiService.js
|  |  |- exportService.js
|  |  |- renderService.js
|  |- utils/
|  |  |- brandContext.js
|  |- server.js
|- frontend/
|  |- index.html
|- package.json
|- server.js
|- README.md
```

## Setup

```bash
npm install
```

## Set `GEMINI_API_KEY`

PowerShell:

```powershell
$env:GEMINI_API_KEY="your_api_key_here"
```

Or create a local `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

## Run

```bash
node server.js
```

The app will be available at `http://localhost:3000`.

## How It Works

- `backend/server.js` configures Express, serves the single-file frontend, and exposes `/generate`
- `backend/routes/generate.js` validates input, calls Gemini, normalizes the response, and sends the structured JSON back to the client
- `backend/services/aiService.js` builds the Gemini system prompt, injects the brand context, requests schema-constrained JSON, and parses the JSON response safely with `JSON.parse()` inside `try/catch`
- `backend/services/renderService.js` keeps slide layout and color handling consistent for the generated content
- `backend/services/exportService.js` creates clean export file names for PNG downloads
- `frontend/index.html` contains the complete UI, live editing, preview cards, caption tools, and client-side PNG export with `html-to-image`

## Notes

- The API key is used only on the backend and is never exposed to the browser
- `post` and `story` generate a single slide
- `carousel` generates 3 to 5 slides with a hook, explanation, and CTA flow
