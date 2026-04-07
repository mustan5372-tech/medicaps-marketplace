# Quick Start Guide - Listing Expiry & Boost Features

## What Changed?

### Listing Lifetime
- **Before**: 30 days
- **After**: 15 days

### Boost Duration
- **Before**: 24 hours
- **After**: 30 days

## Setup Instructions

### 1. Update All Existing Listings (One-time)
```bash
cd server
node scripts/updateListingExpiry.js
```

### 2. Enable Unlimited Boost for User
```bash
cd server
node scripts/enableUnlimitedBoost.js
```
This enables unlimited boost for: `en24me3050010@medicaps.ac.in`

## Features Summary

### Admin Panel Features
✓ **Boost any listing** - Select duration (7, 14, 30, 60, 90 days)
✓ **Edit any listing** - Modify title, description, price, category, condition, location
✓ **Remove boost** - Instantly remove boost from any listing
✓ **Manage users** - Enable/disable unlimited boost per user
✓ **Flag listings** - Mark suspicious listings
✓ **Delete listings** - Remove listings permanently

### User Features
✓ **Boost listings** - 5 free boosts (or unlimited if enabled)
✓ **Boost duration** - 30 days per boost
✓ **Listing lifetime** - 15 days from creation
✓ **Unlimited boost** - Available for special users

## Timeline

### Regular User Listing
```
Day 0:  Listing created (expires in 15 days)
Day 5:  User boosts listing (boost expires in 30 days)
Day 15: Listing expires and becomes inactive
Day 35: Boost expires (but listing already inactive)
```

### Admin Boosted Listing
```
Day 0:  Listing created (expires in 15 days)
Day 2:  Admin boosts for 60 days
Day 15: Listing expires and becomes inactive
Day 62: Boost expires (but listing already inactive)
```

## Key Points

1. **Listing expiry is independent of boost**
   - Listings always expire after 15 days
   - Boost can extend visibility but not listing lifetime

2. **Boost extends visibility**
   - Boosted listings appear first in search results
   - Boost lasts 30 days (or custom duration for admin)

3. **Users can repost**
   - After 15 days, users can create a new listing
   - Encourages fresh content

4. **Admin flexibility**
   - Admins can boost for custom durations
   - Admins can edit any listing
   - Admins can manage unlimited boost per user

## API Quick Reference

### Create Listing
```
POST /listings
→ Automatically expires in 15 days
```

### Boost Listing (User)
```
POST /listings/:id/boost
→ Boost expires in 30 days
→ Limited to 5 boosts (or unlimited if enabled)
```

### Boost Listing (Admin)
```
PATCH /admin/listings/:id/boost
Body: { duration: 30 }
→ Boost expires in 30 days (customizable)
```

### Edit Listing (Admin)
```
PUT /admin/listings/:id
Body: { title, description, price, category, condition, location, negotiable }
→ Updates listing details
```

### Enable Unlimited Boost (Admin)
```
PATCH /admin/users/:id/unlimited-boost
Body: { enabled: true }
→ User can boost unlimited times
```

## Admin Dashboard Navigation

1. **Listings Tab**
   - View all listings
   - Edit, boost, flag, or delete
   - See boost status and expiry

2. **Flagged Tab**
   - View flagged listings
   - Unflag or delete

3. **Users Tab**
   - View all users
   - Verify sellers
   - Enable/disable unlimited boost
   - Ban/unban users

4. **Reports Tab**
   - View user reports
   - Flag and resolve

5. **Announcements Tab**
   - Post announcements
   - Manage existing announcements

## Status Badges

- 🔵 **Admin** - User is an admin
- ⚡ **Unlimited Boost** - User has unlimited boost
- 🚫 **Banned** - User is banned
- ⚠️ **Flagged** - Listing is flagged
- ⚡ **Boosted** - Listing is currently boosted

## Common Tasks

### Task: Boost a Listing for 60 Days
1. Go to Admin Dashboard → Listings
2. Find the listing
3. Click "Boost" button
4. Select "60 Days"
5. Click "Boost Now"

### Task: Enable Unlimited Boost for a User
1. Go to Admin Dashboard → Users
2. Find the user
3. Click "Enable Boost" button
4. User now has unlimited boost

### Task: Edit a Listing
1. Go to Admin Dashboard → Listings
2. Find the listing
3. Click "Edit" button
4. Modify fields
5. Click "Save Changes"

### Task: Update All Listings Expiry
1. Open terminal
2. Run: `cd server && node scripts/updateListingExpiry.js`
3. Wait for completion message

## Troubleshooting

**Q: Script says "User not found"**
A: Check the email address is correct: `en24me3050010@medicaps.ac.in`

**Q: Listings not updating**
A: Make sure MongoDB connection is working and MONGODB_URI is set in .env

**Q: Boost button not working**
A: Check user has not exceeded 5 boost limit (unless unlimited boost is enabled)

**Q: Can't see unlimited boost badge**
A: Refresh the page or clear browser cache

## Files Modified

- `server/models/User.js` - Added `unlimitedBoost` field
- `server/models/Listing.js` - Updated default expiry to 15 days
- `server/routes/listings.js` - Updated boost to 30 days
- `server/routes/admin.js` - Added admin boost and unlimited boost endpoints
- `client/src/pages/AdminDashboard.jsx` - Added UI for all features

## Scripts Created

- `server/scripts/enableUnlimitedBoost.js` - Enable unlimited boost for user
- `server/scripts/updateListingExpiry.js` - Update all listings expiry

## Documentation Files

- `ADMIN_FEATURES.md` - Detailed admin features
- `UNLIMITED_BOOST_SETUP.md` - Unlimited boost setup
- `LISTING_EXPIRY_SETUP.md` - Listing expiry configuration
- `QUICK_START_GUIDE.md` - This file

---

**Ready to go!** Run the setup scripts and start using the new features.
