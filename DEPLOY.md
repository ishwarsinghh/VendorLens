## VendorLens AI — Render Deployment Guide

### Steps for Member A

---

#### Step 1: Create a `.gitignore`
Create this file in `backend/` before pushing:
```
.env
__pycache__/
*.pyc
.DS_Store
```

#### Step 2: Push to GitHub
```bash
cd backend
git init
git add .
git commit -m "VendorLens backend - initial"
# Create repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/vendorlens-backend.git
git push -u origin main
```

#### Step 3: Deploy on Render
1. Go to https://render.com → Sign in with GitHub
2. Click **New → Web Service**
3. Select your `vendorlens-backend` repo
4. Fill in:
   - **Name**: `vendorlens-backend`
   - **Region**: Singapore (closest to India)
   - **Branch**: main
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Add Environment Variable** and add:
   ```
   GROQ_API_KEY        = your_groq_key
   GEMINI_API_KEY      = your_gemini_key
   SUPABASE_URL        = your_supabase_url
   SUPABASE_KEY        = your_supabase_anon_key
   ```
6. Click **Create Web Service**
7. Wait ~3 minutes for first deploy
8. Your URL will be: `https://vendorlens-backend.onrender.com`

---

#### Step 4: Share URL with Member B
Send Member B this URL on WhatsApp/Discord:
```
https://vendorlens-backend.onrender.com
```

Member B pastes it into Lovable as:
```js
const API_BASE = "https://vendorlens-backend.onrender.com"
```

---

#### Step 5: Test the deployment
```bash
# Health check
curl https://vendorlens-backend.onrender.com/

# Should return:
# {"status":"VendorLens AI is running 🚀","version":"1.0.0"}
```

---

### ⚠️ Render Free Tier Note
- App **sleeps after 15 minutes** of inactivity
- First request after sleep takes **~30 seconds** to wake up
- **Fix for demo**: Open the health check URL 1 minute before presenting
- Or use UptimeRobot (free) to ping every 14 minutes and keep it awake:
  → https://uptimerobot.com → New Monitor → HTTP → paste your Render URL
