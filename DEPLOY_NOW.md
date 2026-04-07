# Deploy to Vercel & Railway

## Frontend to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy Frontend
```bash
cd client
vercel --prod
```

### 3. Set Environment Variables in Vercel Dashboard
- Go to Settings → Environment Variables
- Add: `VITE_API_URL` = Your Railway backend URL

---

## Backend to Railway

### 1. Install Railway CLI
```bash
npm i -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Deploy Backend
```bash
cd server
railway up
```

### 4. Set Environment Variables in Railway Dashboard
- `MONGODB_URI` = Your MongoDB connection string
- `JWT_SECRET` = Your JWT secret
- `CLOUDINARY_NAME` = Your Cloudinary name
- `CLOUDINARY_KEY` = Your Cloudinary key
- `CLOUDINARY_SECRET` = Your Cloudinary secret
- `SMTP_USER` = Your email
- `SMTP_PASS` = Your email password
- `CLIENT_URL` = Your Vercel frontend URL

---

## Run Migration Scripts

After deployment, run these on Railway:

```bash
# Update listing expiry
railway run node scripts/updateListingExpiry.js

# Enable unlimited boost
railway run node scripts/enableUnlimitedBoost.js
```

---

## Verify Deployment

- Frontend: https://your-app.vercel.app
- Backend: https://your-app.railway.app/api/health

Done! ✅
