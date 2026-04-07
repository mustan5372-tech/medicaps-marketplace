# Deployment Checklist

## Pre-Deployment

### Code Review
- [ ] All files have no syntax errors
- [ ] All imports are correct
- [ ] No console.log statements left in production code
- [ ] Error handling is proper
- [ ] Security checks are in place

### Testing
- [ ] Admin dashboard loads without errors
- [ ] All modals open and close properly
- [ ] Edit modal saves changes correctly
- [ ] Boost modal applies boost correctly
- [ ] Flag modal flags listings correctly
- [ ] User unlimited boost toggle works
- [ ] Expired listings don't appear in search
- [ ] Boosted listings appear first

### Database
- [ ] MongoDB connection is working
- [ ] User model has `unlimitedBoost` field
- [ ] Listing model has correct defaults
- [ ] Indexes are created
- [ ] No data corruption

## Deployment Steps

### Step 1: Backup Database
```bash
# Create backup before making changes
mongodump --uri="mongodb://..." --out=./backup
```
- [ ] Backup created successfully
- [ ] Backup verified

### Step 2: Update Models
```bash
# Verify models are updated
grep -n "unlimitedBoost" server/models/User.js
grep -n "expiresAt" server/models/Listing.js
```
- [ ] User model updated
- [ ] Listing model updated

### Step 3: Update Routes
```bash
# Verify routes are updated
grep -n "unlimitedBoost" server/routes/admin.js
grep -n "boostExpiresAt" server/routes/listings.js
```
- [ ] Admin routes updated
- [ ] Listing routes updated

### Step 4: Update Frontend
```bash
# Verify frontend is updated
grep -n "editModal" client/src/pages/AdminDashboard.jsx
grep -n "boostModal" client/src/pages/AdminDashboard.jsx
```
- [ ] AdminDashboard updated
- [ ] All imports correct
- [ ] No TypeScript errors

### Step 5: Run Migration Scripts
```bash
# Update existing listings
cd server
node scripts/updateListingExpiry.js
```
- [ ] Migration script ran successfully
- [ ] All listings updated
- [ ] No errors in console

### Step 6: Enable Unlimited Boost
```bash
# Enable for specific user
cd server
node scripts/enableUnlimitedBoost.js
```
- [ ] Script ran successfully
- [ ] User has unlimited boost enabled
- [ ] Verified in database

### Step 7: Restart Services
```bash
# Restart backend
npm start

# Restart frontend (if needed)
npm run dev
```
- [ ] Backend started successfully
- [ ] Frontend loaded without errors
- [ ] No connection errors

### Step 8: Verify Deployment
```bash
# Check API endpoints
curl http://localhost:5000/admin/stats
curl http://localhost:5000/admin/listings
```
- [ ] API endpoints responding
- [ ] Data loading correctly
- [ ] No 500 errors

## Post-Deployment

### Functionality Tests
- [ ] Admin can view all listings
- [ ] Admin can edit listings
- [ ] Admin can boost listings
- [ ] Admin can remove boost
- [ ] Admin can flag listings
- [ ] Admin can manage users
- [ ] Users can boost (5 limit)
- [ ] Special user can boost unlimited
- [ ] Listings expire after 15 days
- [ ] Boosted listings last 30 days

### Performance Tests
- [ ] Admin dashboard loads in < 2 seconds
- [ ] Listing updates in < 500ms
- [ ] Boost action completes in < 300ms
- [ ] No memory leaks
- [ ] Database queries optimized

### Security Tests
- [ ] Admin endpoints require authentication
- [ ] Non-admins cannot access admin routes
- [ ] Users cannot edit other users' listings
- [ ] Users cannot boost other users' listings
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

### User Experience Tests
- [ ] Modals are responsive
- [ ] Buttons are clickable
- [ ] Forms validate input
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Loading states work

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

### Mobile Testing
- [ ] Admin dashboard responsive
- [ ] Modals work on mobile
- [ ] Buttons are touch-friendly
- [ ] No horizontal scroll
- [ ] Forms are usable

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
- [ ] No error logs
- [ ] No warning logs
- [ ] Performance is good

### Metrics to Monitor
- [ ] API response time
- [ ] Database query time
- [ ] Error rate
- [ ] User activity
- [ ] Listing creation rate
- [ ] Boost usage rate

### Alerts to Set Up
- [ ] High error rate (> 1%)
- [ ] Slow API response (> 1s)
- [ ] Database connection failure
- [ ] Memory usage (> 80%)
- [ ] Disk usage (> 90%)

## Rollback Plan

### If Issues Occur
```bash
# Restore from backup
mongorestore --uri="mongodb://..." ./backup

# Revert code changes
git revert <commit-hash>

# Restart services
npm start
```

### Rollback Checklist
- [ ] Backup restored
- [ ] Code reverted
- [ ] Services restarted
- [ ] Functionality verified
- [ ] Users notified

## Documentation

### Update Documentation
- [ ] README.md updated
- [ ] API documentation updated
- [ ] Admin guide updated
- [ ] User guide updated
- [ ] Troubleshooting guide updated

### Notify Team
- [ ] Send deployment notification
- [ ] Share feature overview
- [ ] Provide quick start guide
- [ ] Answer questions
- [ ] Gather feedback

## Post-Deployment Review

### After 24 Hours
- [ ] No critical errors
- [ ] Users are using features
- [ ] Performance is stable
- [ ] No data issues

### After 1 Week
- [ ] All features working smoothly
- [ ] User feedback positive
- [ ] No major bugs reported
- [ ] Performance metrics good

### After 1 Month
- [ ] Feature adoption rate
- [ ] User satisfaction
- [ ] Performance trends
- [ ] Optimization opportunities

## Sign-Off

### Deployment Approval
- [ ] Code review approved
- [ ] QA testing passed
- [ ] Security review passed
- [ ] Performance review passed
- [ ] Product owner approved

### Deployment Confirmation
- [ ] Deployed to production
- [ ] All tests passed
- [ ] Monitoring active
- [ ] Team notified
- [ ] Documentation updated

## Files to Deploy

### Backend Files
- [ ] `server/models/User.js` - Updated
- [ ] `server/models/Listing.js` - Updated
- [ ] `server/routes/admin.js` - Updated
- [ ] `server/routes/listings.js` - Updated
- [ ] `server/scripts/enableUnlimitedBoost.js` - New
- [ ] `server/scripts/updateListingExpiry.js` - New

### Frontend Files
- [ ] `client/src/pages/AdminDashboard.jsx` - Updated

### Documentation Files
- [ ] `ADMIN_FEATURES.md` - New
- [ ] `UNLIMITED_BOOST_SETUP.md` - New
- [ ] `LISTING_EXPIRY_SETUP.md` - New
- [ ] `QUICK_START_GUIDE.md` - New
- [ ] `IMPLEMENTATION_SUMMARY.md` - New
- [ ] `FEATURE_OVERVIEW.md` - New
- [ ] `DEPLOYMENT_CHECKLIST.md` - New

## Environment Variables

### Required .env Variables
```
MONGODB_URI=mongodb://...
NODE_ENV=production
PORT=5000
JWT_SECRET=...
```
- [ ] All variables set
- [ ] No hardcoded values
- [ ] Secrets are secure

## Database Migrations

### Migration Scripts to Run
```bash
# 1. Update listing expiry
node server/scripts/updateListingExpiry.js

# 2. Enable unlimited boost
node server/scripts/enableUnlimitedBoost.js
```
- [ ] All migrations completed
- [ ] Data integrity verified
- [ ] Rollback plan ready

## Final Verification

### Before Going Live
- [ ] All checklist items completed
- [ ] No outstanding issues
- [ ] Team is ready
- [ ] Support is ready
- [ ] Monitoring is active

### Go Live
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Notify users
- [ ] Gather feedback
- [ ] Document lessons learned

---

**Deployment Status**: Ready for production
**Last Updated**: April 6, 2026
**Approved By**: [Admin Name]
**Deployed On**: [Date]
