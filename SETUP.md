# SubbiStyle Setup Guide

Complete step-by-step guide for setting up SubbiStyle from scratch.

## Table of Contents
- [Prerequisites](#prerequisites)
- [1. Supabase Setup](#1-supabase-setup)
- [2. Local Development Setup](#2-local-development-setup)
- [3. Database Migration](#3-database-migration)
- [4. Deployment to Render](#4-deployment-to-render)
- [5. Post-Deployment Configuration](#5-post-deployment-configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** installed
- **Supabase account** ([Sign up](https://supabase.com))
- **Render account** ([Sign up](https://render.com)) or alternative hosting
- **GitHub account** with access to the repository

Check your versions:
```bash
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
git --version
```

---

## 1. Supabase Setup

### Step 1.1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the details:
   - **Name**: `subbistyle` (or your preference)
   - **Database Password**: Generate a strong password and **save it**
   - **Region**: Choose closest to your users (e.g., US East, Europe West)
   - **Pricing Plan**: Free tier is sufficient for MVP

4. Click "Create new project" and wait 2-3 minutes for provisioning

### Step 1.2: Get Your Supabase Credentials

Once the project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy the following values:

   ```
   Project URL: https://[your-project-ref].supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Go to **Database** section → **Connection String**
5. Select **Connection Pooling** tab
6. Copy the connection string (it will look like):
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Step 1.3: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production URL (update later if deploying):
   ```
   http://localhost:5000  (for development)
   https://your-app.onrender.com  (for production)
   ```

3. Add **Redirect URLs**:
   ```
   http://localhost:5000/auth/callback
   https://your-app.onrender.com/auth/callback
   ```

4. Go to **Authentication** → **Providers**
5. Enable **Email** provider (enabled by default)
6. Optionally configure OAuth providers (Google, GitHub, etc.)

---

## 2. Local Development Setup

### Step 2.1: Clone the Repository

```bash
git clone https://github.com/AJ-011/SubbiStyle.git
cd SubbiStyle
```

### Step 2.2: Install Dependencies

```bash
npm install
```

This will install all frontend and backend dependencies (may take 2-3 minutes).

### Step 2.3: Configure Environment Variables

1. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor and fill in the values from Supabase:

   ```env
   # Database Configuration
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

   # Supabase Configuration (Server-side)
   SUPABASE_URL="https://[your-project-ref].supabase.co"
   SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

   # Supabase Configuration (Client-side/Vite)
   VITE_SUPABASE_URL="https://[your-project-ref].supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

   # Server Configuration
   NODE_ENV="development"
   PORT="5000"
   ```

**Important**:
- Use the **same values** for `SUPABASE_URL` and `VITE_SUPABASE_URL`
- Use the **same values** for `SUPABASE_ANON_KEY` and `VITE_SUPABASE_ANON_KEY`
- The `VITE_` prefix is required for Vite to expose these to the browser

### Step 2.4: Verify Configuration

Check that your `.env` file is not tracked by git:
```bash
git status
```

You should NOT see `.env` in the list of changes. It should be in `.gitignore`.

---

## 3. Database Migration

### Step 3.1: Push Database Schema

This command will create all 15 tables in your Supabase database:

```bash
npm run db:push
```

You should see output like:
```
✓ Pulling schema from database...
[i] No changes detected
```

Or if it's the first time:
```
✓ Pushing schema to database...
✓ Schema pushed successfully
```

### Step 3.2: Verify Tables Created

1. Go to your Supabase dashboard
2. Navigate to **Table Editor** (left sidebar)
3. You should see 15 tables:
   - users
   - brands
   - artisans
   - garments
   - nfc_codes
   - impact_metrics
   - cultural_content
   - care_instructions
   - stamps
   - badges
   - user_badges
   - passport_unlocks
   - analytics
   - session (for express-session)
   - drizzle migrations (for tracking)

### Step 3.3: Seed the Database

This adds demo data (3 brands, 4 garments, 4 artisans, etc.):

```bash
npx tsx server/seed.ts
```

Expected output:
```
Seeding database...
✓ Created 3 brands
✓ Created 4 artisans
✓ Created 4 garments
✓ Created 4 NFC codes
✓ Created 4 impact metrics
✓ Created 19 cultural content items
✓ Created 4 care instructions
✓ Created 2 demo users
✓ Created 2 user stamps
✓ Created 3 badges
✓ Created 1 user badge
Database seeded successfully!
```

**Note**: If you run the seed script again, you may see errors about duplicate keys. This is normal - the data already exists.

### Step 3.4: Verify Seed Data

1. In Supabase dashboard → **Table Editor**
2. Click on `garments` table
3. You should see 4 garments:
   - Huipil de Flores
   - Kaftan Azul
   - Indigo Tenugui
   - Lalita Kaftan

---

## 4. Deployment to Render

### Step 4.1: Push Your Code to GitHub

Make sure all your changes are committed:

```bash
git status
git add .
git commit -m "Setup complete with environment configuration"
git push origin feature/debugged_and_updated
```

Or push to main:
```bash
git checkout main
git merge feature/debugged_and_updated
git push origin main
```

### Step 4.2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended) or email
3. Authorize Render to access your GitHub repositories

### Step 4.3: Create a New Web Service

1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repository: `SubbiStyle`
3. Configure the service:

   **Basic Settings:**
   - **Name**: `subbistyle` (or your preference)
   - **Region**: Choose closest to your users
   - **Branch**: `main` or `feature/debugged_and_updated`
   - **Runtime**: `Node`

   **Build & Deploy:**
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

   **Instance Type:**
   - Select **Free** (for testing) or **Starter** ($7/month for always-on)

4. Click **"Advanced"** to expand advanced settings

### Step 4.4: Add Environment Variables

Click **"Add Environment Variable"** and add each of these (use your Supabase values):

```
DATABASE_URL = postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
SUPABASE_URL = https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL = https://[your-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV = production
PORT = 5000
```

**Important**:
- Make sure there are no trailing spaces
- Use the exact same values from your local `.env`
- Double-check the `DATABASE_URL` includes the password

### Step 4.5: Deploy

1. Click **"Create Web Service"**
2. Render will start building your app (takes 3-5 minutes)
3. Watch the logs for any errors
4. Once deployed, you'll see: **"Your service is live 🎉"**

### Step 4.6: Get Your Production URL

Your app will be available at:
```
https://subbistyle.onrender.com
```
(or whatever name you chose)

---

## 5. Post-Deployment Configuration

### Step 5.1: Update Supabase URLs

1. Go back to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Update **Site URL**:
   ```
   https://your-app.onrender.com
   ```

4. Add to **Redirect URLs**:
   ```
   https://your-app.onrender.com/auth/callback
   https://your-app.onrender.com/*
   ```

5. Click **Save**

### Step 5.2: Test Your Production App

1. Open your Render URL in a browser
2. Test the following:
   - [ ] Homepage loads
   - [ ] Shop page shows 4 garments
   - [ ] Click on a garment to view details
   - [ ] Navigate to "My Passport" → should prompt to sign in
   - [ ] Click "Sign In" → creates auth page
   - [ ] Sign up with a new email
   - [ ] Verify you receive confirmation email (check spam)
   - [ ] After login, "My Passport" shows your dashboard

### Step 5.3: Run Database Migration on Production

Render should automatically run `npm run build` which includes database setup, but verify:

1. In Render dashboard, go to your service
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run db:push
   ```

This ensures your production database schema is up to date.

---

## Troubleshooting

### Issue: "Missing Supabase configuration in environment variables"

**Cause**: Vite cannot find `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`

**Solution**:
1. Make sure your `.env` file has `VITE_` prefixed variables
2. Restart the dev server: `Ctrl+C` then `npm run dev`
3. Check that `.env` is in the root directory (same level as `package.json`)

### Issue: "Failed to fetch garments" or API errors

**Cause**: Database connection issue or wrong credentials

**Solution**:
1. Verify `DATABASE_URL` in `.env` is correct
2. Check Supabase dashboard → Database is online (green status)
3. Test database connection:
   ```bash
   npx tsx server/seed.ts
   ```
   If this fails, your DATABASE_URL is wrong

### Issue: Build fails on Render with "Cannot find module"

**Cause**: Missing dependencies or incorrect build command

**Solution**:
1. Make sure `package.json` is committed to git
2. Verify build command in Render is: `npm run build`
3. Check Render logs for specific missing module
4. May need to run `npm install` locally and commit `package-lock.json`

### Issue: Authentication not working (401 errors)

**Cause**: Supabase auth configuration mismatch

**Solution**:
1. Check Supabase → Authentication → URL Configuration
2. Make sure Site URL matches your deployed URL
3. Add all redirect URLs (including `/*` wildcard)
4. Verify `SUPABASE_ANON_KEY` is the **anon** key, not service role
5. Check browser console for specific auth errors

### Issue: "Session timeout" errors

**Cause**: Supabase auth service slow to respond

**Solution**:
- This is expected and handled gracefully in the code
- The app will continue without authentication for public pages
- If persistent, check Supabase service status: https://status.supabase.com

### Issue: No garments showing in Shop page

**Cause**: Database not seeded or API not connecting

**Solution**:
1. Check Supabase Table Editor → `garments` table has 4 rows
2. If empty, run seed script: `npx tsx server/seed.ts`
3. Open browser console (F12) and check for API errors
4. Verify `/api/garments` endpoint returns data:
   ```
   http://localhost:5000/api/garments
   ```

### Issue: Port 5000 already in use

**Cause**: Another process is using port 5000

**Solution**:
1. Stop the other process or use different port
2. Change PORT in `.env`:
   ```env
   PORT=5001
   ```
3. Restart dev server

### Getting Help

If you're still stuck:

1. Check the browser console (F12) for errors
2. Check Render logs for server errors
3. Review `replit.md` for technical architecture details
4. Search for similar issues on GitHub
5. Open a new issue with:
   - What you were trying to do
   - Error messages (with sensitive data removed)
   - Steps to reproduce

---

## Next Steps After Setup

Once your app is running:

1. **Custom Domain** (optional):
   - Add custom domain in Render → Settings
   - Update Supabase URL configuration

2. **Monitoring** (recommended):
   - Set up [Sentry](https://sentry.io) for error tracking
   - Configure Render health checks

3. **Performance**:
   - Enable Render auto-scaling if needed
   - Monitor Supabase database usage

4. **Security**:
   - Rotate credentials every 90 days
   - Enable Supabase row-level security (RLS)
   - Set up rate limiting

5. **Backups**:
   - Supabase provides daily backups (check retention policy)
   - Export data regularly for local backups

---

## Optional: OpenAI Integration

If you want to use AI-generated content features:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add to `.env` and Render environment variables:
   ```env
   OPENAI_API_KEY=sk-...
   ```
3. Update `server/openai.ts` to use correct model name (GPT-4)
4. Monitor usage and costs in OpenAI dashboard

**Note**: AI features are optional - the app works fully without them.

---

## Summary

You've now:
- ✅ Set up Supabase project
- ✅ Configured local development environment
- ✅ Created database schema and seed data
- ✅ Deployed to production on Render
- ✅ Configured authentication

Your SubbiStyle app should be fully operational!

For questions or issues, refer to the [Troubleshooting](#troubleshooting) section or open a GitHub issue.
