
# IGPS Bhopal Management System - Professional Portal

This is the production-ready management portal for Indira Gandhi Public School, Bhopal.

## 🚀 Final Deployment Steps (Vercel)

### 1. Upload to GitHub
Create a new private repository on GitHub and upload all files.

### 2. Connect to Vercel
Connect your GitHub repository to [Vercel](https://vercel.com).

### 3. Environment Variable (The ONLY one needed now)
Because the Firebase keys are now built into the code, you only need to add **one key** in Vercel **Settings -> Environment Variables**:

| Vercel KEY Name | Value Source |
|:--- |:--- |
| `GEMINI_API_KEY` | Get this for free from [aistudio.google.com](https://aistudio.google.com/) |

**⚠️ IMPORTANT**: After adding the key, go to the **Deployments** tab and click **Redeploy**.

## 🔐 Creating your Owner Account
Once your site is live, go to `/register` and enter these details:
- **Title**: Mr.
- **Name**: Avdhesh Purohit
- **Mobile**: 9669872269
- **Password**: 250674
- **Authorization Code**: `IGPS_MASTER`

## 🛠️ Troubleshooting
- **API Key Error**: If you see an API key error, ensure you have **Redeployed** the project in Vercel after the last code update.
- **Login Issues**: Ensure you have successfully completed the `/register` step first before trying to log in.

---
**Maintained by Parth Rajpurohit**
