# Unlimited Boost Feature Setup

## Overview
Added unlimited boost capability for specific users. The user `en24me3050010@medicaps.ac.in` has been configured with unlimited boost access.

## What's New

### 1. User Model Update
- Added `unlimitedBoost` field (Boolean, default: false)
- Tracks which users have unlimited boost capability

### 2. Backend Changes

#### Updated Routes:
- **`POST /listings/:id/boost`** - Enhanced to check for unlimited boost
  - Users with `unlimitedBoost: true` bypass the 5-boost limit
  - Regular users still limited to 5 free boosts
  - Boost duration: 24 hours

- **`PATCH /admin/users/:id/unlimited-boost`** - New admin endpoint
  - Enable/disable unlimited boost for any user
  - Request body: `{ enabled: true/false }`

#### New Script:
- **`server/scripts/enableUnlimitedBoost.js`** - One-time setup script
  - Enables unlimited boost for a specific email
  - Usage: `node server/scripts/enableUnlimitedBoost.js`

### 3. Frontend Changes

#### Admin Dashboard - Users Tab:
- New "Unlimited Boost" badge for users with unlimited boost enabled
- New button to toggle unlimited boost status per user
- Yellow theme with lightning bolt icon (FiZap)
- Responsive button layout

#### User Display:
- Shows all user statuses: Admin, Unlimited Boost, Banned
- Easy toggle between enabled/disabled states

## How to Enable Unlimited Boost

### Method 1: Using the Script (Recommended)
```bash
cd server
node scripts/enableUnlimitedBoost.js
```
This will enable unlimited boost for `en24me3050010@medicaps.ac.in`

### Method 2: Using Admin Dashboard
1. Go to Admin Dashboard
2. Click "Users" tab
3. Find the user in the list
4. Click "Enable Boost" button
5. User now has unlimited boost

### Method 3: Direct API Call
```bash
PATCH /admin/users/{userId}/unlimited-boost
Body: { "enabled": true }
```

## User Experience

### For Users with Unlimited Boost:
- Can boost listings unlimited times
- No "5 boost limit" restriction
- Each boost lasts 24 hours
- Boost counter doesn't increment

### For Regular Users:
- Limited to 5 free boosts
- After 5 boosts, cannot boost more
- Each boost lasts 24 hours
- Boost counter increments with each use

## Database Schema

### User Model Addition:
```javascript
unlimitedBoost: { type: Boolean, default: false }
```

### Listing Model (Already Exists):
```javascript
isBoosted: { type: Boolean, default: false }
boostExpiresAt: { type: Date, default: null }
```

## API Endpoints

### Boost Listing (User)
```
POST /listings/:id/boost
Headers: Authorization required
Response: { message, freeBoostUsed, boostExpiresAt }
```

### Toggle Unlimited Boost (Admin)
```
PATCH /admin/users/:id/unlimited-boost
Headers: Authorization required (admin only)
Body: { enabled: true/false }
Response: { user, message }
```

## Current Status

✓ User `en24me3050010@medicaps.ac.in` is ready for unlimited boost
✓ Admin can manage unlimited boost for any user
✓ Regular users still have 5-boost limit
✓ All code validated and error-free

## Testing

### Test Unlimited Boost:
1. Login as user with unlimited boost enabled
2. Create multiple listings
3. Boost each listing (should work unlimited times)
4. Verify no "limit reached" error

### Test Admin Controls:
1. Go to Admin Dashboard → Users
2. Find user with unlimited boost
3. Click "Disable Boost" button
4. Verify badge disappears
5. Click "Enable Boost" button
6. Verify badge reappears

## Notes
- Unlimited boost is independent of admin role
- Regular admins can also have unlimited boost if enabled
- Boost duration is fixed at 24 hours for user boosts
- Admin boosts can have custom duration (7-90 days)
