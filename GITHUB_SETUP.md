# GitHub Repository Setup Guide

## ✅ Git Repository Initialized

Your DryJets repository has been initialized with:
- **154 files committed**
- **58,879 lines of code**
- Complete project history

## 🚀 Push to GitHub (Choose One Method)

### Method 1: Using GitHub Website (Easiest)

1. **Create Repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `DryJets`
   - Description: `AI-powered three-sided marketplace for dry cleaning & laundry services`
   - **Keep it Private** (recommended initially)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Push Your Code:**
   ```bash
   cd /Users/husamahmed/DryJets

   # Add GitHub as remote (replace USERNAME with your GitHub username)
   git remote add origin https://github.com/USERNAME/DryJets.git

   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

3. **Enter Credentials:**
   - Username: your GitHub username
   - Password: use a **Personal Access Token** (not your GitHub password)

   **Get Token:** https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: "DryJets Development"
   - Expiration: 90 days (or longer)
   - Scopes: Select `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again)
   - Use this token as your password when pushing

---

### Method 2: Using GitHub CLI (Advanced)

If you want to install GitHub CLI for easier management:

```bash
# Install GitHub CLI
brew install gh

# Authenticate with GitHub
gh auth login

# Create repository and push
cd /Users/husamahmed/DryJets
gh repo create DryJets --private --source=. --remote=origin --push
```

---

### Method 3: Using SSH (Most Secure)

1. **Generate SSH Key** (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter to accept default location
   # Enter a passphrase (optional but recommended)
   ```

2. **Add SSH Key to GitHub:**
   ```bash
   # Copy your public key
   cat ~/.ssh/id_ed25519.pub
   # Copy the output
   ```

   - Go to https://github.com/settings/keys
   - Click "New SSH key"
   - Title: "DryJets MacBook"
   - Paste your public key
   - Click "Add SSH key"

3. **Create Repository on GitHub** (via website as in Method 1)

4. **Push with SSH:**
   ```bash
   cd /Users/husamahmed/DryJets

   # Add GitHub as remote (replace USERNAME with your GitHub username)
   git remote add origin git@github.com:USERNAME/DryJets.git

   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

---

## 🔄 Continuous Updates (After Initial Push)

Once you've pushed to GitHub, use these commands for future updates:

### Daily Workflow

```bash
cd /Users/husamahmed/DryJets

# 1. Check what's changed
git status

# 2. Stage all changes
git add .

# 3. Commit with a message
git commit -m "Your commit message here"

# 4. Push to GitHub
git push
```

### Commit Message Examples

**Good commit messages:**
```bash
git commit -m "Add merchant dashboard equipment detail page"
git commit -m "Fix health scoring calculation for dryers"
git commit -m "Update IoT integration documentation"
git commit -m "Implement alert notification system"
```

**Feature-specific commits:**
```bash
git commit -m "feat: add resource optimization recommendations API"
git commit -m "fix: correct vibration threshold in health scoring"
git commit -m "docs: update quick start guide with troubleshooting"
git commit -m "test: add unit tests for maintenance alerts service"
```

---

## 📋 Common Git Commands

### View Changes
```bash
# See what files have changed
git status

# See line-by-line changes
git diff

# See commit history
git log --oneline --graph --all
```

### Undo Changes
```bash
# Discard changes to a file
git checkout -- filename.ts

# Unstage a file (keep changes)
git reset HEAD filename.ts

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) - CAREFUL!
git reset --hard HEAD~1
```

### Branches
```bash
# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Merge branch into main
git checkout main
git merge feature/new-feature

# Push branch to GitHub
git push -u origin feature/new-feature
```

---

## 🔐 Security Best Practices

### Never Commit These Files

Already in .gitignore (you're safe):
- ✅ `.env` files with secrets
- ✅ `node_modules/`
- ✅ Database files (*.db)
- ✅ API keys in code

### If You Accidentally Commit Secrets

1. **Remove from history:**
   ```bash
   # Install BFG Repo Cleaner
   brew install bfg

   # Remove sensitive file from history
   bfg --delete-files .env

   # Clean up
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive

   # Force push (only if repo is private and you haven't shared it)
   git push --force
   ```

2. **Rotate all exposed secrets:**
   - Regenerate API keys
   - Change database passwords
   - Update Stripe keys
   - Reset JWT secrets

---

## 🤖 Automated Updates (Optional)

### Set Up Auto-Push Script

Create `scripts/auto-commit.sh`:
```bash
#!/bin/bash
cd /Users/husamahmed/DryJets

# Check if there are changes
if [[ -n $(git status -s) ]]; then
  echo "📝 Changes detected, committing..."

  git add .
  git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
  git push

  echo "✅ Pushed to GitHub"
else
  echo "✓ No changes to commit"
fi
```

Make it executable:
```bash
chmod +x scripts/auto-commit.sh
```

Run periodically (e.g., every hour):
```bash
# Add to crontab
crontab -e

# Add this line (runs every hour)
0 * * * * /Users/husamahmed/DryJets/scripts/auto-commit.sh >> /tmp/dryjets-git.log 2>&1
```

---

## 📊 Repository Stats

**Current Status:**
- Total Files: 154
- Lines of Code: 58,879
- Commit Message: Initial commit with full project summary
- Branch: main

**Project Breakdown:**
- Backend API: 45 files
- Frontend Apps: 48 files
- Database: 4 files
- Documentation: 17 files
- Scripts: 4 files
- Configuration: 36 files

---

## ✅ Verification Steps

After pushing to GitHub:

1. **Visit your repository:**
   ```
   https://github.com/USERNAME/DryJets
   ```

2. **Check files are there:**
   - You should see 154 files
   - README.md should display on the homepage
   - All documentation files should be visible

3. **Verify commit message:**
   - Click "commits"
   - You should see your detailed initial commit message

4. **Check repository size:**
   - Should be around 5-10 MB (without node_modules)

---

## 🆘 Troubleshooting

### "Permission denied (publickey)"
**Fix:** Set up SSH key (see Method 3 above)

### "remote: Repository not found"
**Fix:** Check repository name and your username in the remote URL
```bash
git remote -v  # View current remote
git remote set-url origin https://github.com/CORRECT_USERNAME/DryJets.git
```

### "Updates were rejected because the remote contains work"
**Fix:** This happens if you initialized the repo on GitHub with a README
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

### "Authentication failed"
**Fix:** Use Personal Access Token, not password
- Get token: https://github.com/settings/tokens
- Use token as password when prompted

### Large file warning
**Fix:** Ensure node_modules is gitignored
```bash
# Remove node_modules if accidentally committed
git rm -r --cached node_modules
git commit -m "Remove node_modules from git"
git push
```

---

## 📱 GitHub Mobile App

Download GitHub mobile app for:
- View commits on the go
- Review code changes
- Receive notifications
- Merge pull requests

**Download:**
- iOS: https://apps.apple.com/app/github/id1477376905
- Android: https://play.google.com/store/apps/details?id=com.github.android

---

## 🎓 Next Steps After Pushing

1. **Add Repository Description:**
   - Go to repository settings
   - Add description: "AI-powered marketplace for dry cleaning services with IoT monitoring"
   - Add topics: `marketplace`, `nextjs`, `nestjs`, `react-native`, `iot`, `ai`, `dry-cleaning`

2. **Set Up Branch Protection:**
   - Settings > Branches > Add rule
   - Branch name pattern: `main`
   - Enable: "Require pull request reviews before merging"

3. **Add Collaborators** (if working with a team):
   - Settings > Collaborators
   - Invite team members

4. **Set Up GitHub Actions** (optional, for CI/CD):
   - Create `.github/workflows/ci.yml`
   - Run tests on every push
   - Auto-deploy to staging

---

## 📞 Need Help?

- **GitHub Docs:** https://docs.github.com
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf
- **Git Tutorials:** https://git-scm.com/docs/gittutorial

---

**Ready to push? Start with Method 1 above! 🚀**
