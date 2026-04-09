# Git Push Guide

Quick reference for pushing changes to the Business Watch repository.

## Quick Push (One Command)

```powershell
git -C business-watch add .; git -C business-watch commit -m "fix: description"; git -C business-watch push origin main
```

**Note:** Use `main` branch for all pushes. Vercel auto-deploys from `main`.

## Full Workflow

### 1. Check Status
```powershell
git -C business-watch status
```

### 2. Add Changes
```powershell
git -C business-watch add .
```

### 3. Commit
```powershell
git -C business-watch commit -m "fix: description of change"
```

**Commit prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix  
- `chore:` - Maintenance
- `docs:` - Documentation
- `refactor:` - Code refactoring

### 4. Push to Main
```powershell
git -C business-watch push origin main
```

## Quick Commands Reference

```powershell
# Check status + log + branch
git -C business-watch status; git -C business-watch log --oneline -1; git -C business-watch branch --show-current

# See unpushed commits
git -C business-watch log --oneline origin/main..HEAD

# View file changes
git -C business-watch diff filename

# Pull latest
git -C business-watch pull origin main
```

## Repository Info

- **Remote:** `https://github.com/bussinesswatch/Business-Watch.git`
- **Branch:** `main` (deploys to Vercel)
- **Location:** `c:\Users\maushaz.MADIHAA\Desktop\Rettey\bussiness_watch\business-watch`

## Troubleshooting

### "Not a git repository"
Always use `git -C business-watch` prefix (repo is in subdirectory).

### Authentication Prompt
GitHub may ask for browser auth on first push - click the link and approve.

### Secret Scanning Block
If push is rejected due to secrets:
1. Visit the GitHub URL shown in error
2. Click "Allow secret" 
3. Push again

### Merge Conflicts
```powershell
git -C business-watch checkout main
git -C business-watch pull origin main
git -C business-watch merge your-branch --no-edit
git -C business-watch push origin main
```
