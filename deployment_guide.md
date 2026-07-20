# ProjectPulse Cloud Deployment Guide

This guide details how to deploy **ProjectPulse** (Node.js + Express + Socket.io + React + MongoDB) to live cloud hosting for free or minimal cost.

---

## Architecture Overview

```
 [ React Frontend ]  ---> ( Vercel / Render Static )
        |
        +---> [ Express & Socket.io Backend ] ---> ( Render Web Service )
                     |
                     +---> [ MongoDB Atlas Cloud Database ]
```

---

## Step 1: Set Up Cloud MongoDB Database (MongoDB Atlas)

Since your local database (`mongodb://127.0.0.1:27017`) is only on your computer, you need a cloud MongoDB database:

1. Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** and sign up for a free account.
2. Click **Create a Deployment** and select the **M0 Free** cluster.
3. Choose a region near you (e.g., AWS / N. Virginia or Mumbai).
4. **Database Security Setup**:
   - **Database User**: Create a username and password (e.g. `pulseadmin` and a strong password). Save these credentials!
   - **Network Access**: Click **Network Access** -> **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)** so your hosted backend can connect.
5. **Get Connection String**:
   - Go to **Clusters** -> **Connect** -> **Drivers**.
   - Copy the URI string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/projectpulse?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your created database user credentials.

---

## Step 2: Push Project Code to GitHub

1. Create a free account on **[GitHub](https://github.com)**.
2. Create a new repository named `projectpulse`.
3. In your local terminal inside `C:\Users\LENOVO\Desktop\projectpulse`:
   ```powershell
   git init
   git add .
   git commit -m "Initial ProjectPulse Release"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/projectpulse.git
   git push -u origin main
   ```

---

## Step 3: Deploy Backend Server (Render.com)

**Render** supports Node.js web services and WebSockets out of the box:

1. Create a free account on **[Render.com](https://render.com)**.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `projectpulse`.
4. Configure service settings:
   - **Name**: `projectpulse-server`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. **Environment Variables**: Add the following keys under **Environment**:
   - `PORT`: `5000`
   - `MONGO_URI`: *(Your MongoDB Atlas connection string from Step 1)*
   - `JWT_SECRET`: *(A random secret string, e.g., `pulse_live_jwt_secret_9988`)*
6. Click **Deploy Web Service**.
7. Once deployment finishes, copy your live backend URL (e.g. `https://projectpulse-server.onrender.com`).

---

## Step 4: Configure Frontend for Live Backend & WebSockets

1. Open `C:\Users\LENOVO\Desktop\projectpulse\frontend\src\services\api.js`:
   - Replace `http://localhost:5000` with your live Render backend URL:
     ```javascript
     const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://projectpulse-server.onrender.com';
     ```
2. Open `C:\Users\LENOVO\Desktop\projectpulse\frontend\src\context\SocketContext.jsx`:
   - Ensure the Socket.io connection uses your live backend URL:
     ```javascript
     const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://projectpulse-server.onrender.com';
     ```

---

## Step 5: Deploy Frontend Client (Vercel)

**Vercel** provides high-speed global hosting for Vite React apps:

1. Create a free account on **[Vercel](https://vercel.com)**.
2. Click **Add New** -> **Project**.
3. Import your `projectpulse` GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://projectpulse-server.onrender.com`
   - `VITE_SOCKET_URL`: `https://projectpulse-server.onrender.com`
6. Click **Deploy**.
7. Vercel will build your app and issue a live HTTPS URL (e.g. `https://projectpulse.vercel.app`).

---

## Summary Checklist

| Component | Service | URL Example |
| :--- | :--- | :--- |
| **Cloud Database** | MongoDB Atlas | `mongodb+srv://...` |
| **Backend & Socket.io** | Render Web Service | `https://projectpulse-server.onrender.com` |
| **Frontend UI** | Vercel | `https://projectpulse.vercel.app` |

Once deployed, anyone on the internet can open your Vercel web link, log in, chat in real-time, and manage college project teams!
