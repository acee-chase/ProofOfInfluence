# GitHub Actions Setup Guide

How to configure and use GitHub Actions for ProofOfInfluence.

## Overview

GitHub Actions provides automated CI/CD workflows for:
- ✅ Code quality checks (linting, type checking)
- ✅ Automated testing (unit tests, contract tests)
- ✅ Build verification
- ✅ PR validation
- ✅ Deployment notifications

---

## Workflow Files

### Location

All workflows are in `.github/workflows/`:

| File | Purpose | Trigger |
|------|---------|---------|
| `ci.yml` | Main CI pipeline | Push to main/dev, PRs |
| `pr-checks.yml` | PR validation | PR opened/updated |
| `deploy-notification.yml` | Deployment alerts | Push to main/dev |

---

## CI Pipeline (`ci.yml`)

### What It Does

**On every push to main/dev or PR:**

1. **Lint & Type Check**
   - Runs TypeScript type checking
   - Runs ESLint
   - Fails if type errors found

2. **Build Application**
   - Compiles frontend and backend
   - Uploads build artifacts
   - Verifies build succeeds

3. **Smart Contract Tests**
   - Compiles Solidity contracts
   - Runs Hardhat test suite
   - Verifies contract functionality

4. **Generate Report**
   - Summarizes all job results
   - Shows pass/fail status

### Local Testing

Before pushing, run locally:

```bash
# Type check
npm run check

# Lint
npm run lint

# Build
npm run build

# Contract tests
npx hardhat test
```

---

## PR Checks (`pr-checks.yml`)

### What It Does

**On every PR:**

1. **Validates PR Title**
   - Checks Conventional Commits format
   - Example: `feat(frontend): add dashboard`

2. **Checks for Large Files**
   - Warns if files > 1MB detected
   - Helps prevent bloat

3. **Scans for Secrets**
   - Simple check for Stripe keys
   - Prevents accidental secret commits

4. **File Change Summary**
   - Counts total files changed
   - Warns if PR too large (>50 files)

5. **Categorizes Changes**
   - Frontend: `client/**`
   - Backend: `server/**`
   - Contracts: `contracts/**`
   - Docs: `*.md`, `docs/**`

### Best Practices

**Good PR:**
- ✅ Title: `feat(api): add market stats endpoint (Cursor)`
- ✅ Files changed: < 20
- ✅ No secrets in code
- ✅ Clear description

**Needs Improvement:**
- ⚠️ Title: "updates" (too vague)
- ⚠️ Files changed: > 50 (consider splitting)
- ❌ Contains hardcoded API keys

---

## Deployment Notification (`deploy-notification.yml`)

### What It Does

**On push to main or dev:**

1. Extracts commit info (message, author, SHA)
2. Determines deployment environment:
   - `main` → Production
   - `dev` → Testing/Staging
3. Logs deployment notification
4. (Optional) Sends to Slack/Discord

### Replit Integration

Replit watches the repository and auto-deploys on push:

```
GitHub Push → GitHub Actions Notification → Replit Auto-Deploy
```

---

## Setup Instructions

### Step 1: Enable GitHub Actions

GitHub Actions is enabled by default for all repos. No special setup needed!

### Step 2: Configure Secrets (Optional)

If you want Slack/Discord notifications:

1. Go to GitHub Repo → Settings → Secrets and variables → Actions
2. Add secrets:
   - `SLACK_WEBHOOK_URL` (optional)
   - `DISCORD_WEBHOOK_URL` (optional)

### Step 3: Verify Workflows

After pushing workflow files:

1. Go to GitHub Repo → Actions tab
2. You should see workflows listed
3. Click on a workflow to see runs

---

## Workflow Status

### How to Check

**In GitHub:**
1. Visit: https://github.com/acee-chase/ProofOfInfluence/actions
2. See all workflow runs
3. Click any run to see details

**In README (optional):**

Add status badges:

```markdown
![CI](https://github.com/acee-chase/ProofOfInfluence/workflows/CI%20Pipeline/badge.svg)
```

---

## Common Scenarios

### Scenario 1: PR Created

```
1. Developer creates PR
2. GitHub Actions triggers:
   - ci.yml (lint, build, test)
   - pr-checks.yml (validation)
3. Results show in PR page
4. Green checkmark ✅ = ready to merge
5. Red X ❌ = needs fixes
```

### Scenario 2: Push to dev

```
1. Developer pushes to dev
2. GitHub Actions triggers:
   - ci.yml (full CI pipeline)
   - deploy-notification.yml
3. Replit detects push
4. Replit auto-deploys to staging
```

### Scenario 3: Merge to main

```
1. PR merged to main
2. GitHub Actions triggers:
   - ci.yml (verify production code)
   - deploy-notification.yml (production alert)
3. Replit auto-deploys to production
```

---

## Customization

### Add More Jobs

Edit `.github/workflows/ci.yml`:

```yaml
jobs:
  # Add security scanning
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run npm audit
        run: npm audit --production

  # Add dependency check
  dependency-check:
    name: Check Dependencies
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check for outdated packages
        run: npm outdated || true
```

### Add Slack Notifications

Uncomment in `deploy-notification.yml`:

```yaml
- name: Send Slack notification
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "🚀 Deployment needed on ${{ github.ref_name }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Skip CI for Docs

Add to commit message:

```bash
git commit -m "docs: update readme [skip ci]"
```

---

## Troubleshooting

### Workflow Not Running

**Check:**
1. Workflow file syntax (use YAML validator)
2. Branch name matches trigger configuration
3. GitHub Actions enabled in repo settings

### Tests Failing

**Common causes:**
1. Missing dependencies (check `package.json`)
2. Environment variables not set
3. Test database not configured

**Fix:**
- Run tests locally first: `npm test`
- Check workflow logs for specific errors
- Add required secrets in repo settings

### Build Failing

**Check:**
1. TypeScript errors: `npm run check`
2. ESLint errors: `npm run lint`
3. Build command: `npm run build`

---

## Best Practices

### Do's ✅

- Commit workflow files to repository
- Test workflows on feature branches first
- Keep workflows fast (< 5 minutes ideal)
- Use caching for node_modules
- Monitor workflow run times

### Don'ts ❌

- Don't put secrets in workflow files
- Don't run heavy operations on every commit
- Don't ignore failing workflows
- Don't skip tests to "speed up" CI

---

## Advanced Configuration

### Matrix Testing (Multiple Node Versions)

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

### Conditional Jobs

```yaml
jobs:
  deploy-contracts:
    if: contains(github.event.head_commit.message, '(Codex)')
    runs-on: ubuntu-latest
    steps:
      - name: Deploy contracts
        run: echo "Contract deployment needed"
```

### Scheduled Workflows

```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
```

---

## Integration with Replit

### Auto-Deployment Flow

```
1. Push to GitHub (main or dev)
   ↓
2. GitHub Actions runs CI
   ↓
3. If CI passes, Replit detects push
   ↓
4. Replit auto-deploys application
   ↓
5. Replit runs deployment tests
   ↓
6. Report results
```

### Manual Deployment

If Replit doesn't auto-deploy:

1. Log into Replit
2. Go to your project
3. Click "Run" or pull manually:
   ```bash
   git pull origin main  # or dev
   npm install
   npm run build
   npm start
   ```

---

## Monitoring

### GitHub Actions Tab

View all workflow runs:
```
https://github.com/acee-chase/ProofOfInfluence/actions
```

### Status Checks

Required status checks (optional):
1. Go to Repo Settings → Branches
2. Add branch protection rule for `main`
3. Require status checks to pass:
   - Lint & Type Check
   - Build Application
   - Smart Contract Tests

---

## Cost & Limits

### GitHub Actions Free Tier

- **Public repos**: Unlimited minutes ✅
- **Private repos**: 2,000 minutes/month
- **Storage**: 500 MB

### Optimize Usage

- Use caching to speed up workflows
- Run tests in parallel
- Skip unnecessary jobs with conditions

---

## Next Steps

1. ✅ Push workflow files to repository
2. ✅ Verify workflows run on next commit
3. ✅ Configure branch protection (optional)
4. ✅ Add status badges to README (optional)
5. ✅ Set up Slack/Discord notifications (optional)

---

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

---

**Automated CI/CD is now configured!**

Every push and PR will automatically run quality checks and tests.

