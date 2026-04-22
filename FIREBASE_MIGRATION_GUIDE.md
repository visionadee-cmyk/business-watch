# Firebase Migration Guide

## Overview
Migrating from OLD project `bussiness-watch` (suspended) to NEW project `business-watch-52e10`.

## Files Created

### Service Account Keys
- `service-account.json` - **NEW** project key (active)
- `service-account-OLD-backup.json` - **OLD** project key (backup)
- `service acount key.json` - Original new key file (you downloaded this)

### Migration Scripts
- `scripts/export-old-firebase-data.cjs` - Export all data from OLD project
- `scripts/import-to-new-firebase.cjs` - Import data to NEW project

## Step-by-Step Migration

### Step 1: Export Old Data
```bash
cd business-watch
node scripts/export-old-firebase-data.cjs
```
This creates: `data/firebase-backup-export.json`

### Step 2: Verify Export
Check that `data/firebase-backup-export.json` exists and contains your data.

### Step 3: Setup New Firebase Project
1. Go to https://console.firebase.google.com
2. Select project: **business-watch-52e10**
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** → Start in test mode
5. Enable **Storage** (optional, for documents)

### Step 4: Import Data to New Project
```bash
node scripts/import-to-new-firebase.cjs
```

### Step 5: Verify Import
Check your new Firebase Console - data should appear in Firestore.

### Step 6: Re-upload Tenders (if needed)
```bash
npm run upload-tenders
```

### Step 7: Redeploy
```bash
git add .
git commit -m "feat: migrate to new Firebase project"
git push origin main
```

## Important Notes

- **service-account.json** now points to NEW project
- **service-account-OLD-backup.json** preserves old credentials
- **DO NOT DELETE** the backup file - you might need it
- All frontend configs already updated (firebaseConfig.js, .env)

## Troubleshooting

### Export fails
- Old project might be fully suspended
- Try accessing data through Firebase Console directly
- Export collections one by one manually if needed

### Import fails
- Check Firestore rules allow writes
- Verify service-account.json has NEW project credentials
- Check batch limits (500 docs per batch, handled by script)

### Missing data
- Some collections might be empty
- Check export JSON file for errors per collection
- Documents with subcollections need special handling
