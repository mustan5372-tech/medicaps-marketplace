# Listing Expiry Configuration

## Overview
Updated the listing system to enforce consistent expiration times:
- **All listings**: Live for 15 days
- **Boosted listings**: Remain boosted for 30 days
- **New listings**: Automatically follow the same rules

## Changes Made

### 1. Listing Model (`server/models/Listing.js`)
- `expiresAt` default: 15 days from creation
- `boostExpiresAt` default: 30 days when boosted

### 2. User Boost Route (`server/routes/listings.js`)
- **Boost duration**: Changed from 24 hours to 30 days
- **Expiration**: `boostExpiresAt = now + 30 days`
- **Message**: Updated to reflect "30 days" boost

### 3. Admin Boost Route (`server/routes/admin.js`)
- **Default duration**: 30 days (customizable)
- **Flexibility**: Admins can set custom durations (7, 14, 30, 60, 90 days)

### 4. Migration Script (`server/scripts/updateListingExpiry.js`)
- Updates all existing active listings
- Sets `expiresAt` to 15 days from now
- Sets `boostExpiresAt` to 30 days from now

## Expiration Timeline

### Regular Listings
```
Created: Day 0
Expires: Day 15
Status: Becomes inactive after 15 days
```

### Boosted Listings
```
Created: Day 0
Boosted: Day X (any time)
Boost Expires: Day X + 30
Listing Expires: Day 15 (independent of boost)
```

### Example Scenario
```
Listing created on Jan 1
- Expires on Jan 16 (15 days)
- If boosted on Jan 5, boost expires on Feb 4 (30 days)
- Listing becomes inactive on Jan 16 regardless of boost status
```

## How to Apply Changes

### Step 1: Update Existing Listings
Run the migration script to update all current listings:
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

### Step 2: Verify Changes
Check a listing in the database:
```javascript
// Should show:
{
  expiresAt: 2024-01-16T10:30:00.000Z,  // 15 days from now
  boostExpiresAt: 2024-02-04T10:30:00.000Z,  // 30 days from now (if boosted)
  isBoosted: true
}
```

## New Listing Behavior

### When User Creates a Listing
```javascript
// Automatically set to 15 days
expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
```

### When User Boosts a Listing
```javascript
// Boost set to 30 days
boostExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
```

### When Admin Boosts a Listing
```javascript
// Admin can customize duration (default 30 days)
// Options: 7, 14, 30, 60, 90 days
boostExpiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
```

## Database Queries

### Find Expired Listings
```javascript
db.listings.find({
  expiresAt: { $lt: new Date() },
  status: { $ne: 'deleted' }
})
```

### Find Active Listings
```javascript
db.listings.find({
  expiresAt: { $gt: new Date() },
  isActive: true,
  status: { $ne: 'deleted' }
})
```

### Find Boosted Listings
```javascript
db.listings.find({
  isBoosted: true,
  boostExpiresAt: { $gt: new Date() }
})
```

## API Endpoints

### Create Listing
```
POST /listings
Response: Listing with expiresAt = now + 15 days
```

### Boost Listing (User)
```
POST /listings/:id/boost
Response: Listing with boostExpiresAt = now + 30 days
```

### Boost Listing (Admin)
```
PATCH /admin/listings/:id/boost
Body: { duration: 7|14|30|60|90 }
Response: Listing with boostExpiresAt = now + duration days
```

## Frontend Display

### Show Expiry Date
```javascript
const daysLeft = Math.ceil((listing.expiresAt - new Date()) / (1000 * 60 * 60 * 24))
// Display: "Expires in X days"
```

### Show Boost Status
```javascript
if (listing.isBoosted && listing.boostExpiresAt > new Date()) {
  // Show "Boosted" badge
  const boostDaysLeft = Math.ceil((listing.boostExpiresAt - new Date()) / (1000 * 60 * 60 * 24))
  // Display: "Boosted - expires in X days"
}
```

## Important Notes

1. **Listing Expiry**: Independent of boost status
   - A listing expires after 15 days regardless of boost
   - Boost can extend visibility but not listing lifetime

2. **Boost Expiry**: Independent of listing expiry
   - Boost can last up to 30 days
   - If listing expires before boost, listing becomes inactive

3. **Expired Listings**: Automatically hidden
   - Not shown in search results
   - Not shown in home feed
   - Still accessible via direct link (for reference)

4. **Reactivation**: Not supported
   - Users must create a new listing to repost
   - Encourages fresh content

## Testing Checklist

- [ ] Run migration script successfully
- [ ] Verify existing listings have correct expiry dates
- [ ] Create new listing and verify 15-day expiry
- [ ] Boost new listing and verify 30-day boost expiry
- [ ] Check admin boost with custom duration
- [ ] Verify expired listings don't appear in search
- [ ] Verify boosted listings appear first in results

## Rollback (if needed)

If you need to revert to previous expiry times:
```javascript
// Revert to 30 days for all listings
db.listings.updateMany(
  { status: { $ne: 'deleted' } },
  { $set: { expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }
)
```

## Summary

✓ All listings now live for 15 days
✓ Boosted listings remain boosted for 30 days
✓ New listings automatically follow the same rules
✓ Admin can customize boost duration
✓ Migration script ready to update existing listings
