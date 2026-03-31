# MediCaps Marketplace

A full-stack OLX-style marketplace for MediCaps University students to buy and sell items within campus.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + Framer Motion + Zustand
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT (HTTP-only cookies)
- **Real-time:** Socket.io
- **Encryption:** AES end-to-end encrypted chat (CryptoJS)
- **Images:** Cloudinary

## Quick Start

### 1. Clone & Install
```bash
# Install frontend deps
cd client && npm install

# Install backend deps
cd ../server && npm install --legacy-peer-deps
```

### 2. Configure Environment

**server/.env**
```
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/medicaps
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=development
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_ENCRYPTION_KEY=medicaps-e2e-secret-key-2024-32ch
```

### 3. Run
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Features
- JWT authentication with email verification
- Post/edit/delete listings with image upload
- Category & price filters, full-text search
- Real-time E2E encrypted chat (Socket.io + AES)
- Save/favorite listings
- Report listings
- Admin dashboard (ban users, remove listings, resolve reports)
- Dark mode
- Fully responsive (mobile-first)

## Deployment
- **Frontend:** Vercel — connect GitHub repo, set `VITE_API_URL` to your backend URL
- **Backend:** Render — set all env vars in dashboard
- **Database:** MongoDB Atlas (already set up)

## Make a user Admin
In MongoDB Atlas Data Explorer, find the user in the `users` collection and set `role: "admin"`.
