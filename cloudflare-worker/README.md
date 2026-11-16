# Cinevault AI Cloudflare Worker

This Cloudflare Worker securely proxies Cinevault's natural language vibe requests to Google Gemini 3.5 Flash Lite so the API key is never exposed on the frontend or leaked on GitHub.

## Quick Setup (2 Minutes)

1. Navigate to this directory in your terminal:
   ```bash
   cd cloudflare-worker
   ```

2. Store your Gemini API key securely in Cloudflare:
   ```bash
   npx wrangler secret put GEMINI_API_KEY
   ```
   *(Paste your Gemini API key when prompted)*

3. Deploy the Worker:
   ```bash
   npx wrangler deploy
   ```

4. Cloudflare will output your worker URL (e.g. `https://cinevault-ai.<your-subdomain>.workers.dev`).
   Add it to Cinevault's `.env.local`:
   ```env
   VITE_WORKER_URL=https://cinevault-ai.<your-subdomain>.workers.dev
   ```

## Endpoint

- `POST /` or `POST /api/ai-vibe`
  - Body: `{ "prompt": "something short and funny for date night" }`
  - Response: `{ "success": true, "filters": { ... }, "explanation": "...", "suggestedTitles": [...] }`
