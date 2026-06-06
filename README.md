
# IGPS Bhopal Management System - Professional Portal

This is the production-ready management portal for Indira Gandhi Public School, Bhopal.

## 📥 Manual Download Instructions
If the ZIP download button is failing, you must copy these essential files/folders manually:
1. **`src/`** folder: Contains all logic and UI.
2. **`.env`**: **CRITICAL** - Contains your Firebase connection keys. Without this, the app won't connect.
3. **`package.json`**: Required to install the app's dependencies.
4. **`docs/backend.json`**: The database blueprint for your security rules.
5. **Configuration Files**: `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `components.json`.

*Note: You do NOT need the `.idx` folder.*

## 🚀 Phase 1: Deployment (Free)
1. **GitHub**: Create a new private repository and upload all the files mentioned above.
2. **Vercel**: Connect your GitHub to [Vercel.com](https://vercel.com).
3. **Firebase Keys**: In Vercel's "Environment Variables" settings, copy the values from your `.env` file so the live site can connect to your database.

## 🔐 Setting up your Owner Account
1. Once deployed, navigate to `/register`.
2. Fill in your details (Choose your professional Title: Mr./Ms./Dr.).
3. Use the Secret Authorization Code: **`IGPS_MASTER`** to become the **Owner**.
4. **Security Tip**: To change this code, open `src/app/register/page.tsx` and search for the string `'IGPS_MASTER'`.

## 🛠️ Data Management
- **Live Monitor**: The Owner Dashboard shows real-time check-in times for all staff.
- **System Reset**: Go to "Staff Management" as an Owner to find the "Purge All Testing Data" button to clear out your testing records before the school year starts.

---
**Maintained by Parth Rajpurohit**
