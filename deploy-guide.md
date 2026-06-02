# Deployment Guide: Vercel & ngrok Setup

This guide details how to expose your local Elysia Backend & AI Microservice to the public internet using **ngrok**, and connect them to a **Vercel** deployed Next.js Frontend.

---

## 1. Setup ngrok for Local Backend

Since your Elysia Backend (`PORT 8000`) and AI Microservice (`PORT 3002`) run on your local machine, you need to expose them so your Vercel-hosted frontend can communicate with them.

1. **Install ngrok** if you haven't already (download from [ngrok.com](https://ngrok.com)).
2. **Start the tunnel** for the main backend on port 8000:
   ```bash
   ngrok http 8000
   ```
3. Copy the secure forwarding URL (e.g., `https://xxxx-xxxx.ngrok-free.app`). Let's refer to this as the **`NGROK_BACKEND_URL`**.

---

## 2. Setup Vercel (Next.js Frontend)

1. Connect your GitHub repository to **Vercel** (visit [vercel.com](https://vercel.com)).
2. Import the `next-app` directory (you can set the Root Directory as `next-app` inside Vercel's project setup).
3. Configure the following **Environment Variables** in Vercel settings before deploying:

   | Key | Value | Description |
   | --- | --- | --- |
   | `NEXT_PUBLIC_API_URL` | `https://xxxx-xxxx.ngrok-free.app` | **`NGROK_BACKEND_URL`** |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | *(from next-app/.env)* | Firebase configuration keys |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | *(from next-app/.env)* | |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | *(from next-app/.env)* | |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | *(from next-app/.env)* | |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *(from next-app/.env)* | |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | *(from next-app/.env)* | |
   | `NEXT_PUBLIC_GITHUB_CLIENT_ID` | *(your GitHub OAuth client id)* | Use GitHub OAuth credentials |

4. Click **Deploy**. Vercel will build and launch your frontend (e.g., `https://skill-wallet.vercel.app`). Let's refer to this as the **`VERCEL_FRONTEND_URL`**.

---

## 3. Update Local Backend Environment

Once your Vercel site is deployed, your local backend needs to allow requests from it (CORS).

1. Edit your local `backend/.env` file:
   ```env
   # Update FRONTEND_URL to the Vercel app URL
   FRONTEND_URL=https://skill-wallet.vercel.app
   ```
2. Make sure your local Firestore setup works.

> **Tip (Optional/Advanced)**: If you deploy the Elysia backend to another cloud server (instead of ngrok) that doesn't support local JSON files for Firebase service credentials, you can pass your Service Account Credentials JSON as a single environment variable:
> ```env
> FIREBASE_SERVICE_ACCOUNT_JSON={"type": "service_account", "project_id": "...", ...}
> ```
> The backend has been upgraded to automatically detect and parse this variable.

---

## 4. Update GitHub OAuth App Settings

GitHub OAuth needs to send authorization callbacks to the correct backend endpoint.

1. Go to your [GitHub Developer Settings](https://github.com/settings/developers) -> OAuth Apps.
2. Select your App (or create a new one specifically for Vercel/Production).
3. Update the values:
   - **Homepage URL**: `https://skill-wallet.vercel.app` (your **`VERCEL_FRONTEND_URL`**)
   - **Authorization Callback URL**: `https://xxxx-xxxx.ngrok-free.app/auth/github/callback` (your **`NGROK_BACKEND_URL`** + `/auth/github/callback`)
4. Save changes.

---

## 5. Running the Application

When running:
1. Start your local AI Microservice (Terminal 1):
   ```bash
   cd backend/ai-service
   bun run dev
   ```
2. Start your local Backend (Terminal 2):
   ```bash
   cd backend
   bun run dev
   ```
3. Run ngrok (Terminal 3):
   ```bash
   ngrok http 8000
   ```
4. Access your website via the Vercel URL. Login and AI CV features will work seamlessly, communicating safely through the ngrok tunnel to your local machine!
