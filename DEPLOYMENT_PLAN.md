# 🚀 Runwal Seagull - Free Deployment Plan

> **Created**: January 17, 2026  
> **Status**: Planning Phase  
> **Goal**: Deploy the Society Management Portal to free hosting for end users

---

## 📋 Project Overview

### Tech Stack Summary
| Component | Technology | Version | Deployment Consideration |
|-----------|------------|---------|--------------------------|
| **Framework** | Next.js (App Router) | 16.1.1 | Supported on Vercel (free tier) |
| **Language** | TypeScript | 5.x | No impact on deployment |
| **Styling** | Tailwind CSS | 4.x | No impact on deployment |
| **Database** | PostgreSQL | - | Supabase (free tier) or Neon |
| **ORM** | Prisma | 7.2.0 | Compatible with serverless |
| **Authentication** | NextAuth.js | v5 beta | Requires `NEXTAUTH_SECRET` |
| **File Upload** | Cloudinary | - | Already free tier compatible |
| **Email** | Resend | - | Free tier: 3k emails/month |
| **Testing** | Vitest + Playwright | 4.x / 1.57 | Local/CI only |

### Required Environment Variables
```env
# Database (REQUIRED)
DATABASE_URL="postgresql://..."

# Authentication (REQUIRED)
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="strong-secret-for-production"

# File Upload (REQUIRED)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Email Service (OPTIONAL - can be added later)
RESEND_API_KEY=""
EMAIL_FROM=""
```

---

## 🎯 Recommended Free Hosting Stack

### **Tier 1: Primary Recommendation** ⭐
| Service | Purpose | Free Tier Limits | Why Chosen |
|---------|---------|------------------|------------|
| **Vercel** | App Hosting | 100GB bandwidth, serverless | Native Next.js support, zero-config |
| **Supabase** | PostgreSQL DB | 500MB DB, 1GB file storage | Already configured, generous free tier |
| **Cloudinary** | Image CDN | 25GB storage, 25k transformations | Already integrated |
| **Resend** | Transactional Email | 3k emails/month | Simple API, good deliverability |

### **Tier 2: Alternative Options**
| Service | Purpose | Use Case |
|---------|---------|----------|
| **Neon** | PostgreSQL | If Supabase limits are hit |
| **Railway** | DB/Hosting | All-in-one alternative |
| **Render** | Hosting | If Vercel doesn't work |
| **Netlify** | Hosting | Static + serverless option |

---

## 📝 Task Breakdown

### Pre-Deployment Checklist
- [ ] Run full test suite (unit + E2E)
- [ ] Fix any failing tests
- [ ] Ensure production build succeeds (`npm run build`)
- [ ] Review environment variables
- [ ] Set up version control (Git) properly

---

## 🔧 Task 1: Pre-Deployment Preparation

### Task 1.1: Verify Local Build ✅
**Time Estimate**: 30 minutes  
**Priority**: Critical

#### Steps:
1. Clean install dependencies
   ```bash
   rm -rf node_modules .next
   npm install
   ```

2. Run production build
   ```bash
   npm run build
   ```

3. Test production server locally
   ```bash
   npm start
   ```

4. Fix any build errors

#### Success Criteria:
- [ ] `npm run build` completes without errors
- [ ] Application runs at `http://localhost:3000` in production mode

---

### Task 1.2: Run Full Test Suite 🧪
**Time Estimate**: 1 hour  
**Priority**: Critical

#### Steps:
1. Run unit tests
   ```bash
   npm run test:unit
   ```

2. Run E2E tests
   ```bash
   npm run test:e2e
   ```

3. Document test results

#### Success Criteria:
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No regressions from recent changes

---

### Task 1.3: Environment Variables Audit 🔐
**Time Estimate**: 15 minutes  
**Priority**: Critical

#### Steps:
1. Review `.env.example` for completeness
2. Ensure no secrets are committed to Git
3. Prepare production values for all required variables
4. Generate new `NEXTAUTH_SECRET` for production:
   ```bash
   openssl rand -base64 32
   ```

#### Success Criteria:
- [ ] All required env vars documented
- [ ] Production values ready (not committed)
- [ ] `.env.local` is in `.gitignore`

---

## 🌐 Task 2: Database Setup (Supabase)

### Task 2.1: Verify Supabase Project 🗄️
**Time Estimate**: 30 minutes  
**Priority**: Critical

#### Steps:
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard)
2. Verify existing project or create new one
3. Get the **Connection Pooling** URL (port 6543)
4. Note the **Direct Connection** URL for migrations
5. Verify database is accessible

#### Notes:
- Use **Connection Pooling URL** for `DATABASE_URL` in production
- Use **Direct Connection URL** for running migrations

#### Success Criteria:
- [ ] Supabase project active
- [ ] Connection strings documented
- [ ] Database accessible from local machine

---

### Task 2.2: Run Production Migrations 🔄
**Time Estimate**: 20 minutes  
**Priority**: Critical

#### Steps:
1. Ensure database is clean or backed up
2. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Verify all tables created
4. Seed initial data (buildings, admin user):
   ```bash
   npx prisma db seed
   ```

#### Success Criteria:
- [ ] All 14 tables created successfully
- [ ] Seed data inserted
- [ ] Admin user credentials documented

---

## 🚀 Task 3: Vercel Deployment

### Task 3.1: Connect Repository to Vercel 🔗
**Time Estimate**: 30 minutes  
**Priority**: Critical

#### Steps:
1. Push code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Import your repository
5. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `runwal-seagull` (if monorepo)
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Success Criteria:
- [ ] Repository connected to Vercel
- [ ] Project created in Vercel dashboard

---

### Task 3.2: Configure Environment Variables 🔑
**Time Estimate**: 20 minutes  
**Priority**: Critical

#### Steps:
1. Go to Project Settings → Environment Variables
2. Add all required variables:
   | Variable | Environment | Value |
   |----------|-------------|-------|
   | `DATABASE_URL` | Production | Supabase pooled URL |
   | `NEXTAUTH_URL` | Production | `https://your-app.vercel.app` |
   | `NEXTAUTH_SECRET` | Production | Generated secret |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | All | Your cloud name |
   | `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | All | Your preset |
   | `CLOUDINARY_API_KEY` | Production | Your API key |
   | `CLOUDINARY_API_SECRET` | Production | Your secret |

3. Save and trigger redeploy

#### Success Criteria:
- [ ] All environment variables configured
- [ ] No exposed secrets in build logs

---

### Task 3.3: First Deployment 🎉
**Time Estimate**: 15 minutes  
**Priority**: Critical

#### Steps:
1. Trigger deployment from Vercel dashboard
2. Monitor build logs for errors
3. Wait for deployment to complete
4. Test the live URL

#### Success Criteria:
- [ ] Deployment succeeds
- [ ] Application accessible at Vercel URL
- [ ] No console errors on live site

---

## 🔍 Task 4: Post-Deployment Verification

### Task 4.1: Functional Testing on Production 🧪
**Time Estimate**: 1 hour  
**Priority**: High

#### Checklist:
- [ ] Landing page loads correctly
- [ ] Public notices display
- [ ] Public events display
- [ ] Registration form works
- [ ] Login works with test credentials
- [ ] User dashboard accessible after login
- [ ] Admin dashboard accessible (admin login)
- [ ] Image uploads work (Cloudinary)
- [ ] All navigation links work

---

### Task 4.2: Performance Check ⚡
**Time Estimate**: 30 minutes  
**Priority**: Medium

#### Steps:
1. Run Lighthouse audit in Chrome DevTools
2. Check Core Web Vitals in Vercel Analytics
3. Verify mobile responsiveness
4. Check image optimization

#### Target Metrics:
- Performance Score: > 80
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 3s

---

### Task 4.3: Configure Custom Domain (Optional) 🌍
**Time Estimate**: 30 minutes  
**Priority**: Low

#### Steps:
1. Purchase domain (or use existing)
2. Go to Vercel Project Settings → Domains
3. Add custom domain
4. Configure DNS records
5. Wait for SSL certificate provisioning

#### Success Criteria:
- [ ] Domain points to Vercel
- [ ] SSL certificate active
- [ ] HTTPS working

---

## 🔄 Task 5: CI/CD Pipeline Setup

### Task 5.1: Configure GitHub Actions 🤖
**Time Estimate**: 1 hour  
**Priority**: High

#### Create `.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run lint
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

  # E2E tests run separately (optional for PRs)
  e2e:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
```

#### Success Criteria:
- [ ] Workflow file created
- [ ] Tests run on every PR
- [ ] Build verification before deploy

---

### Task 5.2: Configure Branch Protection 🛡️
**Time Estimate**: 15 minutes  
**Priority**: Medium

#### Steps:
1. Go to GitHub Repository Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require status checks before merging
   - Require the "test" check to pass
   - Require pull request reviews (optional)

#### Success Criteria:
- [ ] Branch protection rules active
- [ ] Cannot push directly to main
- [ ] CI must pass before merge

---

## 📊 Task 6: Monitoring & Maintenance

### Task 6.1: Enable Vercel Analytics 📈
**Time Estimate**: 15 minutes  
**Priority**: Medium

#### Steps:
1. Go to Vercel Project Settings → Analytics
2. Enable Web Analytics (free tier)
3. Add analytics to your app if not auto-enabled

---

### Task 6.2: Set Up Error Monitoring 🚨
**Time Estimate**: 30 minutes  
**Priority**: Medium

#### Options (Free Tier):
- **Sentry**: 5k errors/month free
- **LogRocket**: Session replay
- **Vercel's built-in**: Basic error logging

---

### Task 6.3: Database Backup Strategy 💾
**Time Estimate**: 15 minutes  
**Priority**: High

#### Supabase:
- Automatic backups on Pro plan
- For free tier: Manual exports via Dashboard
- Consider scheduled pg_dump for critical data

---

## 📅 Deployment Day-by-Day Schedule

### Day 1: Preparation
- [ ] Task 1.1: Verify Local Build
- [ ] Task 1.2: Run Full Test Suite
- [ ] Task 1.3: Environment Variables Audit

### Day 2: Database & Initial Deploy
- [ ] Task 2.1: Verify Supabase Project
- [ ] Task 2.2: Run Production Migrations
- [ ] Task 3.1: Connect Repository to Vercel

### Day 3: Go Live
- [ ] Task 3.2: Configure Environment Variables
- [ ] Task 3.3: First Deployment
- [ ] Task 4.1: Functional Testing on Production

### Day 4: Optimization
- [ ] Task 4.2: Performance Check
- [ ] Task 4.3: Configure Custom Domain (if needed)

### Day 5: CI/CD & Monitoring
- [ ] Task 5.1: Configure GitHub Actions
- [ ] Task 5.2: Configure Branch Protection
- [ ] Task 6.1: Enable Vercel Analytics

### Ongoing
- [ ] Task 6.2: Set Up Error Monitoring
- [ ] Task 6.3: Database Backup Strategy

---

## ✅ Quick Reference - Deployment Workflow

For **each subsequent change** after initial deployment:

```
1. Create feature branch
   git checkout -b feature/your-feature

2. Make changes

3. Run tests locally
   npm run test:unit
   npm run test:e2e

4. Commit and push
   git add .
   git commit -m "feat: your feature"
   git push origin feature/your-feature

5. Create Pull Request
   - CI runs automatically
   - Review changes

6. Merge to main
   - Vercel auto-deploys

7. Verify on production
```

---

## 🆘 Troubleshooting Guide

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails on Vercel | Missing env vars | Check Variables in project settings |
| Database connection error | Wrong URL format | Use pooled connection string |
| Auth not working | Wrong `NEXTAUTH_URL` | Set to exact production URL |
| Images not uploading | Cloudinary config | Verify cloud name and preset |
| Prisma client error | Build cache | Clear `.next` and redeploy |

### Useful Commands
```bash
# Force rebuild on Vercel
vercel --prod

# Check Prisma connection
npx prisma db pull

# View database
npx prisma studio
```

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Deploy Guide](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Production Setup](https://next-auth.js.org/deployment)

---

## 📝 Notes

- **Free Tier Limits**: Monitor usage on Supabase (500MB DB, 2GB bandwidth/month) and Vercel (100GB bandwidth)
- **Scaling**: When user base grows, consider upgrading to paid tiers
- **Backup**: Regularly export important data from Supabase dashboard
- **Security**: Never expose `NEXTAUTH_SECRET` or `DATABASE_URL` in client code

---

*Last Updated: January 17, 2026*
