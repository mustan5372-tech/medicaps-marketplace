# 🚀 DEPLOYMENT GUIDE - All Features

## Pre-Deployment Checklist

### ✅ Code Validation
```bash
# Check for errors
npm run lint
npm run build
```

### ✅ Database Backup
```bash
# Backup MongoDB
mongodump --uri="mongodb://..." --out=./backup_$(date +%Y%m%d)
```

### ✅ Environment Setup
```bash
# Verify .env file
cat server/.env
# Should contain: MONGODB_URI, NODE_ENV, PORT, JWT_SECRET
```

---

## Deployment Steps

### Step 1: Stop Current Services
```bash
# Stop backend
npm stop

# Stop frontend (if running)
# Ctrl+C in frontend terminal
```

### Step 2: Pull Latest Code
```bash
# Update from git (if using version control)
git pull origin main

# Or manually update files
```

### Step 3: Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Step 4: Run Migration Scripts

#### 4a. Update Listing Expiry
```bash
cd server
node scripts/updateListingExpiry.js
```

Expected output:
```
Connected to MongoDB
✓ Updated X listings
  - All listings now expire in 15 days
  - Boosted listings expire in 30 days
```

#### 4b. Enable Unlimited Boost
```bash
node scripts/enableUnlimitedBoost.js
```

Expected output:
```
Connected to MongoDB
✓ Unlimited boost enabled for en24me3050010@medicaps.ac.in
```

### Step 5: Build Frontend
```bash
cd client
npm run build
```

### Step 6: Start Services

#### Option A: Development Mode
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

#### Option B: Production Mode
```bash
# Backend
cd server
NODE_ENV=production npm start

# Frontend (serve build)
cd client
npm run preview
```

### Step 7: Verify Deployment

#### Check Backend
```bash
# Test API
curl http://localhost:5000/admin/stats

# Should return JSON with stats
```

#### Check Frontend
```bash
# Open browser
http://localhost:5173 (dev)
http://localhost:4173 (production)

# Should load without errors
```

#### Check Admin Dashboard
1. Login as admin
2. Go to Admin Dashboard
3. Verify all tabs work:
   - [ ] Listings tab
   - [ ] Flagged tab
   - [ ] Users tab
   - [ ] Reports tab
   - [ ] Announcements tab

#### Check Features
- [ ] Can boost listing
- [ ] Can edit listing
- [ ] Can remove boost
- [ ] Can flag listing
- [ ] Can manage users
- [ ] Can enable unlimited boost

---

## Post-Deployment Verification

### 1. Functionality Tests
```bash
# Test boost endpoint
curl -X PATCH http://localhost:5000/admin/listings/{id}/boost \
  -H "Content-Type: application/json" \
  -d '{"duration": 30}'

# Test unlimited boost endpoint
curl -X PATCH http://localhost:5000/admin/users/{id}/unlimited-boost \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

### 2. Database Verification
```bash
# Check listing expiry
db.listings.findOne({}, {expiresAt: 1, boostExpiresAt: 1})

# Check user unlimited boost
db.users.findOne({email: "en24me3050010@medicaps.ac.in"}, {unlimitedBoost: 1})
```

### 3. Performance Check
- [ ] Admin dashboard loads in < 2 seconds
- [ ] Listing updates in < 500ms
- [ ] Boost action completes in < 300ms
- [ ] No console errors
- [ ] No network errors

### 4. Browser Testing
- [ ] Chrome - OK
- [ ] Firefox - OK
- [ ] Safari - OK
- [ ] Mobile - OK

---

## Monitoring

### Logs to Check
```bash
# Backend logs
tail -f server.log

# Frontend logs
tail -f client.log

# Database logs
tail -f mongodb.log
```

### Metrics to Monitor
- API response time
- Database query time
- Error rate
- User activity
- Listing creation rate
- Boost usage rate

### Alerts to Set
- High error rate (> 1%)
- Slow API response (> 1s)
- Database connection failure
- Memory usage (> 80%)
- Disk usage (> 90%)

---

## Rollback Plan

### If Critical Error Occurs
```bash
# 1. Stop services
npm stop

# 2. Restore from backup
mongorestore --uri="mongodb://..." ./backup_YYYYMMDD

# 3. Revert code changes
git revert <commit-hash>

# 4. Restart services
npm start
```

### If Database Issue
```bash
# Restore specific collection
mongorestore --uri="mongodb://..." --collection listings ./backup/listings.bson
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code review completed
- [ ] All tests passed
- [ ] Database backup created
- [ ] Environment variables set
- [ ] Dependencies installed

### During Deployment
- [ ] Migration scripts run successfully
- [ ] No errors in console
- [ ] Services start without issues
- [ ] Database connection verified

### Post-Deployment
- [ ] All features working
- [ ] Admin dashboard accessible
- [ ] Boost feature working
- [ ] Edit feature working
- [ ] Unlimited boost working
- [ ] Listing expiry correct
- [ ] No performance issues
- [ ] Monitoring active

### Verification
- [ ] Users can access platform
- [ ] Admins can access dashboard
- [ ] Listings display correctly
- [ ] Boost works as expected
- [ ] Edit works as expected
- [ ] User management works
- [ ] No data loss
- [ ] All features functional

---

## Deployment Timeline

### Estimated Time: 30-45 minutes

1. **Pre-deployment checks** (5 min)
2. **Stop services** (2 min)
3. **Update code** (5 min)
4. **Install dependencies** (5 min)
5. **Run migrations** (5 min)
6. **Build frontend** (10 min)
7. **Start services** (2 min)
8. **Verification** (5 min)

---

## Success Criteria

✅ All services running  
✅ No console errors  
✅ Admin dashboard accessible  
✅ All features working  
✅ Database updated  
✅ Performance acceptable  
✅ Monitoring active  

---

## Post-Deployment Tasks

### 1. Notify Team
- [ ] Send deployment notification
- [ ] Share feature overview
- [ ] Provide quick start guide

### 2. Monitor Performance
- [ ] Check error logs
- [ ] Monitor API response time
- [ ] Track user activity
- [ ] Gather feedback

### 3. Document Issues
- [ ] Log any issues found
- [ ] Create tickets for bugs
- [ ] Plan fixes if needed

### 4. Update Documentation
- [ ] Update README
- [ ] Update API docs
- [ ] Update user guide

---

## Support

### If Issues Occur
1. Check error logs
2. Review deployment checklist
3. Check database connection
4. Verify environment variables
5. Check file permissions
6. Review recent changes

### Contact
- Backend issues: Check server logs
- Frontend issues: Check browser console
- Database issues: Check MongoDB logs
- Deployment issues: Review this guide

---

## Deployment Sign-Off

**Deployment Date**: [Date]  
**Deployed By**: [Name]  
**Status**: ✅ Complete  
**Issues**: None  
**Rollback Needed**: No  

---

**Ready to deploy? Follow the steps above!** 🚀
