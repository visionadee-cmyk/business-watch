# Git Push Guide

Quick reference for pushing changes to the Business Watch repository.

## Quick Push Commands

```powershell
# Check status
git -C business-watch status

# Add all changes
git -C business-watch add .

# Commit with message
git -C business-watch commit -m "your commit message"

# Push to current branch
git -C business-watch push origin $(git -C business-watch branch --show-current)
```

## Step-by-Step Workflow

### 1. Check Current Status
```powershell
git -C business-watch status
```

### 2. View Changes
```powershell
# See what changed in specific files
git -C business-watch diff filename

# See all unpushed commits
git -C business-watch log --oneline origin/main..HEAD
```

### 3. Stage Changes
```powershell
# Stage specific file
git -C business-watch add filename

# Stage all changes
git -C business-watch add .
```

### 4. Commit
```powershell
# Commit with message
git -C business-watch commit -m "feat: description of change"

# Commit all staged changes with message
git -C business-watch commit -m "fix: bug fix description"
```

**Commit message prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance/task
- `docs:` - Documentation
- `refactor:` - Code refactoring

### 5. Push
```powershell
# Push current branch
git -C business-watch push origin $(git -C business-watch branch --show-current)

# Or specify branch name explicitly
git -C business-watch push origin branch-name
```

## Branch Management

```powershell
# List branches
git -C business-watch branch -a

# Switch branch
git -C business-watch checkout branch-name

# Create and switch to new branch
git -C business-watch checkout -b new-branch-name

# Pull latest changes
git -C business-watch pull origin main
```

## Repository Info

- **Remote URL:** `https://github.com/bussinesswatch/Business-Watch.git`
- **Current Branch:** `clean/push-fixes2`
- **Repo Location:** `c:\Users\maushaz.MADIHAA\Desktop\Rettey\bussiness_watch\business-watch`

## Troubleshooting

### Not a git repository error
Make sure to use `git -C business-watch` prefix since the git repo is in the `business-watch` subdirectory.

### Authentication required
GitHub may prompt for browser authentication on first push.

### Merge conflicts
```powershell
# Pull latest first
git -C business-watch pull origin main

# Resolve conflicts, then add and commit
git -C business-watch add .
git -C business-watch commit -m "fix: resolve merge conflicts"
```
