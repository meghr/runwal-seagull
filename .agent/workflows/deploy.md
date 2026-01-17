---
description: How to deploy changes to production with testing
---

# Deployment Workflow

This workflow describes how to deploy changes to production safely, ensuring tests pass before deployment.

## Prerequisites
- Vercel account connected to repository
- All environment variables configured in Vercel
- Supabase database running

## Steps

### 1. Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Implement the feature or fix
- Follow existing code patterns
- Update relevant documentation

### 3. Run Unit Tests Locally
// turbo
```bash
npm run test:unit
```
Ensure all tests pass before proceeding.

### 4. Run E2E Tests Locally
```bash
npm run test:e2e
```
This requires the dev server to be running. Fix any failures.

### 5. Verify Build Locally
// turbo
```bash
npm run build
```
Ensure production build succeeds.

### 6. Commit and Push
```bash
git add .
git commit -m "feat: description of your change"
git push origin feature/your-feature-name
```

### 7. Create Pull Request
- Go to GitHub and create a PR from your feature branch to `main`
- CI will run automatically
- Wait for all checks to pass

### 8. Merge to Main
- Once approved and CI passes, merge the PR
- Vercel will auto-deploy to production

### 9. Verify on Production
- Check the Vercel deployment logs
- Test the live site at the production URL
- Verify your changes work as expected

## Rollback Procedure
If something goes wrong:
1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"

## Useful Commands
```bash
# Check current Git status
git status

# View recent commits
git log -n 5 --oneline

# Run linting
npm run lint

# Format code
npm run format
```
