# 🔧 BusullaChatBot - API Setup Guide

## The Problem

Your chatbot is showing errors because:
1. **HuggingFace API Key is not configured** (401 error) - Missing or invalid in `.env.local`
2. **Gemini Free Tier Quota Exhausted** (429 error) - You've hit the monthly free tier limit

## How to Fix

### Step 1: Get a HuggingFace API Key

1. Go to https://huggingface.co/settings/tokens
2. Create a new token (or use an existing one)
3. Copy the token

### Step 2: Configure in `.env.local`

The `.env.local` file already exists in your project root. Update it:

```bash
# Your HuggingFace token from https://huggingface.co/settings/tokens
VITE_HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Change the model (default works fine for most use cases)
VITE_HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3

# Your Gemini API key (used as fallback when HF is down)
VITE_GEMINI_API_KEY=AIzaSyDEFdPe-YtYNE9mmSTbJxhKDivqltcAEU4
```

### Step 3: Restart Your Dev Server

```bash
npm run dev
```

The app will now use HuggingFace primarily, and fall back to Gemini if needed.

## Important Notes

⚠️ **HuggingFace**
- Free tier works perfectly for this chatbot
- No monthly limits like Gemini
- API endpoint: `https://router.huggingface.co/v1/chat/completions`
- Recommended model: `mistralai/Mistral-7B-Instruct-v0.3`

⚠️ **Gemini**
- Your free tier quota is **exhausted**
- Free tier has strict monthly limits (see dashboard at https://aistudio.google.com)
- To increase limits, upgrade to a paid plan
- Currently serves as a fallback only

## Architecture

```
User Message
    ↓
Try HuggingFace (Primary)
    ↓ (on success)
Return Response
    ↓ (on failure)
Fall back to Gemini
    ↓ (on success)
Return Response
    ↓ (on failure)
Show Error Message
```

## Troubleshooting

### Still getting 401 errors?
- Check that your HF token is correct and copied completely
- Make sure `VITE_HF_API_KEY` doesn't have trailing spaces
- Tokens are usually very long (format: `hf_xxxx...`)

### Still getting 429 errors?
- This means HF keys aren't configured, and Gemini is the fallback
- Implement Step 2 above

### Need a different AI model?
- Change `VITE_HF_MODEL` to any HuggingFace model that supports chat inference
- Popular alternatives:
  - `meta-llama/Llama-2-7b-chat-hf`
  - `NousResearch/Nous-Hermes-2-Mistral-7B-DPO`
  - `openchat/openchat-3.5-0106`

## WebSocket Error

The `ws://localhost:3000/` error you see is safe to ignore—it's a dev-only connection attempt that doesn't affect your app's functionality.

---

**Need Help?**
1. Check the console for specific error messages
2. Verify your API keys are valid
3. Check your API usage dashboards for quota info
