# Feature Overview - Visual Guide

## Admin Panel Dashboard

### Main Tabs
```
┌─────────────────────────────────────────────────────────┐
│ [Listings] [Flagged] [Users] [Reports] [Announcements] │
└─────────────────────────────────────────────────────────┘
```

### Listings Tab
```
┌─ Listing Card ──────────────────────────────────────────┐
│ [Image] Title                    ⚠️ Flagged ⚡ Boosted  │
│         ₹Price · Category · Seller                      │
│                                                          │
│ [Edit] [Boost/Remove] [Flag] [Delete]                  │
└─────────────────────────────────────────────────────────┘
```

### Users Tab
```
┌─ User Card ─────────────────────────────────────────────┐
│ [Avatar] Name                    👤 Admin ⚡ Unlimited  │
│          email@example.com                              │
│                                                          │
│ [✓ Verify] [⚡ Enable Boost] [🚫 Ban]                  │
└─────────────────────────────────────────────────────────┘
```

## Modals

### Edit Listing Modal
```
┌─ Edit Listing ──────────────────────────────────────────┐
│                                                          │
│ Title:        [________________]                        │
│ Description:  [________________]                        │
│               [________________]                        │
│               [________________]                        │
│                                                          │
│ Price:        [________]  Category: [________]          │
│ Condition:    [________]  Location:  [________]         │
│                                                          │
│ ☐ Negotiable                                            │
│                                                          │
│ [Cancel]                              [Save Changes]    │
└─────────────────────────────────────────────────────────┘
```

### Boost Modal
```
┌─ Boost Listing ⚡ ──────────────────────────────────────┐
│                                                          │
│ Select boost duration (unlimited for admins)            │
│                                                          │
│ [7 Days]                                                │
│ [14 Days]                                               │
│ [30 Days] ← Default                                     │
│ [60 Days]                                               │
│ [90 Days]                                               │
│                                                          │
│ [Cancel]                              [Boost Now]       │
└─────────────────────────────────────────────────────────┘
```

### Flag Modal
```
┌─ Flag Listing ──────────────────────────────────────────┐
│                                                          │
│ Select reason:                                          │
│ [Fake listing]                                          │
│ [Spam]                                                  │
│ [Inappropriate content]                                 │
│ [Wrong category]                                        │
│ [Misleading price]                                      │
│                                                          │
│ [Cancel]                              [Flag Listing]    │
└─────────────────────────────────────────────────────────┘
```

## Status Badges

### Listing Badges
```
⚠️ Flagged      - Red background, warning icon
⚡ Boosted      - Yellow background, lightning icon
```

### User Badges
```
👤 Admin                - Blue background
⚡ Unlimited Boost      - Yellow background, lightning icon
🚫 Banned               - Red background
```

## Timeline Visualization

### Regular Listing Lifecycle
```
Day 0          Day 15
├──────────────┤
Created        Expires
(Active)       (Inactive)
```

### Boosted Listing Lifecycle
```
Day 0          Day 5          Day 15         Day 35
├──────────────┼──────────────┤──────────────┤
Created        Boosted        Listing        Boost
               (Boost +30d)   Expires        Expires
               (Visible)      (Hidden)       (N/A)
```

### Admin Boosted Listing (60 days)
```
Day 0          Day 2          Day 15         Day 62
├──────────────┼──────────────┤──────────────┤
Created        Admin Boost    Listing        Boost
               (Boost +60d)   Expires        Expires
               (Visible)      (Hidden)       (N/A)
```

## Feature Matrix

### Admin Capabilities
```
┌─────────────────────┬──────┬──────┬──────┬──────┐
│ Feature             │ View │ Edit │ Boost│ Flag │
├─────────────────────┼──────┼──────┼──────┼──────┤
│ Listings            │  ✓   │  ✓   │  ✓   │  ✓   │
│ Users               │  ✓   │  ✓   │  ✓   │  -   │
│ Reports             │  ✓   │  -   │  -   │  ✓   │
│ Announcements       │  ✓   │  ✓   │  -   │  -   │
└─────────────────────┴──────┴──────┴──────┴──────┘
```

### User Capabilities
```
┌─────────────────────┬──────┬──────┬──────┐
│ Feature             │ View │ Edit │ Boost│
├─────────────────────┼──────┼──────┼──────┤
│ Own Listings        │  ✓   │  ✓   │  ✓   │
│ Other Listings      │  ✓   │  -   │  -   │
│ Boost (5 limit)     │  -   │  -   │  ✓   │
│ Boost (Unlimited)   │  -   │  -   │  ✓   │
└─────────────────────┴──────┴──────┴──────┘
```

## Boost Duration Options

### User Boost
```
Duration: 30 days (fixed)
Limit: 5 boosts (or unlimited if enabled)
```

### Admin Boost
```
Duration Options:
├─ 7 days
├─ 14 days
├─ 30 days (default)
├─ 60 days
└─ 90 days
```

## Listing Expiry Rules

### Rule 1: Listing Lifetime
```
All listings expire after 15 days
Regardless of boost status
```

### Rule 2: Boost Duration
```
Boost lasts 30 days (user) or custom (admin)
Independent of listing expiry
```

### Rule 3: Visibility
```
Active (< 15 days):     Visible in search
Expired (> 15 days):    Hidden from search
Boosted:                Appears first in results
```

## Action Flow

### Boost a Listing (Admin)
```
1. Go to Admin Dashboard
   ↓
2. Click "Listings" tab
   ↓
3. Find listing
   ↓
4. Click "Boost" button
   ↓
5. Select duration (7-90 days)
   ↓
6. Click "Boost Now"
   ↓
7. Listing boosted ✓
```

### Edit a Listing (Admin)
```
1. Go to Admin Dashboard
   ↓
2. Click "Listings" tab
   ↓
3. Find listing
   ↓
4. Click "Edit" button
   ↓
5. Modify fields
   ↓
6. Click "Save Changes"
   ↓
7. Listing updated ✓
```

### Enable Unlimited Boost (Admin)
```
1. Go to Admin Dashboard
   ↓
2. Click "Users" tab
   ↓
3. Find user
   ↓
4. Click "Enable Boost" button
   ↓
5. User has unlimited boost ✓
```

## Color Scheme

### Buttons
```
Blue:    Primary actions (Edit, Save, Verify)
Yellow:  Boost actions (Boost, Remove Boost)
Orange:  Flag actions (Flag, Flag & Resolve)
Red:     Destructive actions (Delete, Ban)
Green:   Positive actions (Unflag, Unban, Resolve)
```

### Badges
```
Blue:    Admin status
Yellow:  Boost status
Red:     Flagged/Banned status
Green:   Success status
Orange:  Warning status
```

## Icons Used

```
FiEdit2         - Edit button
FiZap           - Boost/unlimited boost
FiFlag          - Flag listing
FiTrash2        - Delete
FiUserX         - Ban user
FiCheckCircle   - Resolve/confirm
FiEye           - Unflag
FiShield        - Admin/security
FiList          - Listings
FiUsers         - Users
FiAlertTriangle - Reports
```

## Responsive Design

### Desktop (> 1024px)
```
Full admin dashboard with all features
Multiple columns for listings/users
All buttons visible
```

### Tablet (768px - 1024px)
```
Stacked layout
Buttons wrap to next line
Modals full width
```

### Mobile (< 768px)
```
Single column layout
Buttons stack vertically
Modals full screen
Horizontal scroll for tables
```

## Performance Metrics

```
Admin Dashboard Load:    < 2 seconds
Listing Update:          < 500ms
Boost Action:            < 300ms
User Toggle:             < 300ms
Modal Open:              < 200ms
```

## Accessibility Features

```
✓ Keyboard navigation
✓ ARIA labels on buttons
✓ Color contrast compliance
✓ Focus indicators
✓ Screen reader support
✓ Touch-friendly buttons (min 44px)
```

---

**Visual Guide Complete** - Ready for implementation
