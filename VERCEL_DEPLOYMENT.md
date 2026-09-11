# Deploying KisanMarg to Vercel (Step-by-Step Guide)

You can deploy KisanMarg to Vercel in **less than 2 minutes**. There are two recommended methods:

---

## Method 1: Deploy via GitHub (Recommended for Judges & Teams)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: KisanMarg AgriTech Platform for Kalpvruksh 2.0"
   git branch -M main
   git remote add origin https://github.com/<your-username>/kisanmarg.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** -> **"Project"**.
   - Select your `kisanmarg` GitHub repository.

3. **Configure Project Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `python database/seed.py` (or leave default if `frontend/data/mandis_gujarat.json` is committed)
   - **Output Directory**: `frontend` (if deploying purely static) or keep `vercel.json` as configured.

4. **Click "Deploy"**:
   - Vercel will build the Python serverless functions and serve the frontend at `https://kisanmarg-yourname.vercel.app`.

---

## Method 2: Deploy via Vercel CLI (Instant from Terminal)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Preview**:
   Run inside the `hackathon/` folder:
   ```bash
   vercel
   ```
   - Follow the prompts to log in and select your scope.
   - Link to existing project? **No**
   - Project name? `kisanmarg-apmc`
   - In which directory is your code located? `./`

3. **Deploy to Production**:
   ```bash
   vercel --prod
   ```
   You will instantly get a live, public HTTPS URL ready for demonstration!

---

## Method 3: Instant Static Edge Deployment (Zero-Config)

If you only want ultra-fast global CDN delivery without serverless cold starts:
- In Vercel Project Settings, set **Root Directory** to `frontend`.
- Since `frontend/data/mandis_gujarat.json` and `frontend/api_client.js` are fully self-contained, all features (interactive map, GPS radius, take-home profit optimization, dockage deductions, queue tracking, and Mann unit conversions) will run 100% in the client browser with zero latency!

---

## Testing Your Vercel Deployment

Once deployed:
1. Open the Vercel URL in your desktop or mobile browser.
2. Verify that the Gujarat APMC map renders centered on Rajkot/Saurashtra.
3. Switch crops (e.g. Groundnut, Cotton, Cumin, Wheat) and adjust moisture to verify real-time net take-home calculation.
4. Test the sidebar features: Gate Queues, Distress Sale Advisor, Unit Converter, and Price Trends.
