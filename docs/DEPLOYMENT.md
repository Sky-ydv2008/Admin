# Team Apex Admin Panel — Deployment Guide

This guide provides instructions for deploying the **Team Apex Admin Panel**:
- **Frontend Admin Panel**: Deployed on **Vercel**
- **Backend API**: Deployed on **Render**

---

## 🎨 1. Deploying Admin Frontend to Vercel

### Step-by-Step Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com/new) and click **Add New Project**.
2. Select your GitHub repository: `Sky-ydv2008/Admin`.
3. Vercel will auto-detect `vercel.json` and configure build settings:
   - **Framework Preset**: Other / HTML
   - **Build Command**: Leave blank (Static HTML/CSS/JS)
   - **Output Directory**: `./` (Root directory)
4. **Environment Variables** (Optional):
   - `VITE_API_URL`: `https://apex-innovators.onrender.com/api`
5. Click **Deploy**. Vercel will assign a live URL (e.g. `https://team-apex-admin.vercel.app/dashboard`).

---

## ⚙️ 2. Deploying Backend to Render

### Step-by-Step Render Deployment

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Blueprint**.
2. Select your GitHub repository: `Sky-ydv2008/Admin` or `Sky-ydv2008/Team.Apex`.
3. Render auto-detects `render.yaml`:
   - **Service Name**: `team-apex-admin-backend`
   - **Health Check Path**: `/health` or `/`
4. Click **Apply**.

---

## 🔗 3. Dynamic CORS & API Proxying

The `vercel.json` automatically proxies API requests matching `/api/*` to `https://apex-innovators.onrender.com/api/*`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://apex-innovators.onrender.com/api/:path*"
    }
  ]
}
```
