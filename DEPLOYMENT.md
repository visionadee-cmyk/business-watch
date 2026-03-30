# Vercel Deployment Guide

## Auto-Deploy Setup

This project is configured for automatic deployment to Vercel via GitHub Actions.

## Prerequisites

1. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **GitHub Secrets**: Add the following secrets to your GitHub repository

## Required GitHub Secrets

Navigate to **Settings > Secrets and variables > Actions** and add:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token (get from vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel organization ID (from `vercel team list`) |
| `VERCEL_PROJECT_ID` | Your Vercel project ID |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

## Setup Steps

### 1. Link Project to Vercel
```bash
vercel login
vercel link
```

### 2. Get Project Info
```bash
vercel project list
cat .vercel/project.json
```

### 3. Get Vercel Token
- Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
- Create a new token
- Copy the token value

### 4. Add Secrets to GitHub
Go to your GitHub repository **Settings > Secrets and variables > Actions** and add all the secrets listed above.

### 5. Deploy
Push to the `main` branch - the GitHub Action will automatically deploy to Vercel:
```bash
git push origin main
```

## Manual Deploy

If you want to deploy manually:
```bash
vercel --prod
```

## Preview Deployments

Pull requests will automatically create preview deployments.

## Troubleshooting

- Check GitHub Actions logs for build errors
- Ensure all Firebase environment variables are set
- Verify Vercel token has the correct permissions
