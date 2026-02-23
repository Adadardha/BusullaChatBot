 <div align="center">
 <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
 </div>
 
 # Run and deploy your AI Studio app
 
 This contains everything you need to run your app locally.
 
 View your app in AI Studio: https://ai.studio/apps/drive/1zmPTcZ4qJ5DLasYHn3KclzbpTITE5Sol
 
 ## Run Locally
 
 **Prerequisites:**  Node.js
 
 
 1. Install dependencies:
    `npm install`
-2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
+2. Set `VITE_HF_API_KEY` in `.env.local` to your Hugging Face token (free tier works). Optional: set `VITE_HF_MODEL` to choose another open model
 3. Run the app:
    `npm run dev`
+
+## Preview locally
+
+1. Create `.env.local` with your token:
+   ```bash
+   VITE_HF_API_KEY=your_huggingface_token
+   # optional
+   VITE_HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3
+   ```
+2. Start dev server:
+   ```bash
+   npm run dev
+   ```
+3. Open the URL shown in terminal (usually `http://localhost:5173`).
+
+If you want a production preview:
+```bash
+npm run build
+npm run preview
+```
+
