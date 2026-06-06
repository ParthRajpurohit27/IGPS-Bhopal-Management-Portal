
# IGPS Bhopal Management System - Professional Portal

This is the production-ready management portal for Indira Gandhi Public School, Bhopal.

## 🚀 Deployment Instructions (Vercel)

### 1. Upload to GitHub
Create a new private repository on GitHub and upload all files (except `.idx` and `node_modules`).

### 2. Connect to Vercel
Connect your GitHub repository to [Vercel](https://vercel.com).

### 3. CRITICAL: Environment Variables
The "invalid-api-key" error happens because Vercel doesn't have your keys during the build. 
1. In your Vercel Dashboard, go to **Settings** -> **Environment Variables**.
2. Add the following keys exactly as they appear in your `.env` file:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GEMINI_API_KEY` (for AI features)
3. **IMPORTANT**: After adding the keys, go to the **Deployments** tab and click **Redeploy**.

## 🔐 Setting up your Owner Account
1. Once deployed, navigate to `/register`.
2. Fill in your details (Choose your professional Title: Mr./Ms./Dr.).
3. Use the Secret Authorization Code: **`IGPS_MASTER`** to become the **Owner**.
4. **Security Tip**: To change this code, open `src/lib/config.ts` and update the `codes.owner` value.

## 🛠️ Troubleshooting Build Failures
- **Deprecation Warnings**: You may see warnings about `rimraf` or `inflight`. **Ignore them.** They are just warnings and do NOT cause the build to fail.
- **Real Errors**: Look for lines starting with `Error:` or `⨯`. 
- **The Solution**: If the build fails, it is almost always because the **Environment Variables** in Vercel were missed or typed incorrectly. Double-check every single key and value.

---
**Maintained by Parth Rajpurohit**
