# Pull Request Status Checks Guide

This guide explains how to understand and work with status checks on pull requests in your project.

## What Are Status Checks?

Status checks are automated tests and validations that run when you open or update a pull request. They ensure your code meets quality standards before merging.

## Status Check Overview

Your project includes the following status checks:

### Core Quality Checks (Always Required)

| Check Name | Purpose | Typical Duration | Workflow File |
|------------|---------|------------------|---------------|
| **Lint Backend** | Python code linting (ruff) and type checking (mypy) | 2-3 minutes | `.github/workflows/ci.yml` |
| **Test Backend** | Backend unit tests with 80% coverage requirement | 3-5 minutes | `.github/workflows/ci.yml` |
| **Lint Frontend** | TypeScript/JavaScript linting (ESLint) and type checking | 1-2 minutes | `.github/workflows/ci.yml` |
| **Test Frontend** | Frontend unit tests with 80% coverage requirement | 2-3 minutes | `.github/workflows/ci.yml` |
| **Build Docker Images** | Validates Docker images build successfully | 5-7 minutes | `.github/workflows/ci.yml` |
| **Integration Tests** | Full-stack integration tests with all services | 10-15 minutes | `.github/workflows/ci.yml` |

### Security Checks (Recommended)

| Check Name | Purpose | Typical Duration | Workflow File |
|------------|---------|------------------|---------------|
| **Scan Python Dependencies** | Checks for vulnerabilities in Python packages | 2-3 minutes | `.github/workflows/security.yml` |
| **Scan Node.js Dependencies** | Checks for vulnerabilities in Node.js packages | 2-3 minutes | `.github/workflows/security.yml` |
| **Scan Docker Images** | Scans Docker images for OS and app vulnerabilities | 5-10 minutes | `.github/workflows/security.yml` |

### Build Checks (Optional)

| Check Name | Purpose | Typical Duration | Workflow File |
|------------|---------|------------------|---------------|
| **Build Backend Image** | Builds and optionally pushes backend Docker image | 5-7 minutes | `.github/workflows/docker.yml` |
| **Build Frontend Image** | Builds and optionally pushes frontend Docker image | 5-7 minutes | `.github/workflows/docker.yml` |

## Understanding Status Check States

### ✅ Success (Green Check)

The check passed successfully. No action needed.

```
✅ Lint Backend — Passed in 2m 15s
```

### ❌ Failure (Red X)

The check failed. You must fix the issue before merging.

```
❌ Test Backend — Failed in 1m 30s
```

**What to do:**
1. Click "Details" to view the full logs
2. Read the error messages (they include helpful suggestions)
3. Fix the issue locally
4. Push your changes to re-run the check

### ⏳ Pending (Yellow Circle)

The check is currently running or queued.

```
⏳ Integration Tests — Running for 5m 30s
```

**What to do:**
- Wait for the check to complete
- If it takes longer than expected, check the workflow logs

### ⚠️ Skipped (Gray Dash)

The check was skipped, usually because a previous check failed.

```
⚠️ Integration Tests — Skipped
```

**What to do:**
- Fix the failing checks first
- Skipped checks will run automatically when you push fixes

### ⏸️ Cancelled (Gray X)

The check was cancelled, usually because you pushed new commits.

```
⏸️ Lint Backend — Cancelled
```

**What to do:**
- This is normal when you push updates to your PR
- The new commit will trigger fresh checks

## Viewing Check Details

### From Pull Request Page

1. Scroll to the bottom of your PR
2. Find the "Checks" section
3. Click "Details" next to any check

### What You'll See

- **Summary**: Overall status and duration
- **Steps**: Each step of the workflow with its status
- **Logs**: Detailed output from each step
- **Artifacts**: Downloadable files (coverage reports, logs, etc.)

### Understanding Error Messages

Our workflows provide actionable error messages:

```
❌ Backend linting failed
::error::Backend linting errors found. Run 'cd backend && ruff check app/ tests/' locally.
::error::To auto-fix issues, run: cd backend && ruff check --fix app/ tests/
::error::Documentation: https://docs.astral.sh/ruff/
::error::Common fixes: Remove unused imports, fix line length, add missing docstrings
```

Each error message includes:
- **What failed**: Clear description of the problem
- **How to reproduce**: Command to run locally
- **How to fix**: Suggested fix commands
- **Documentation**: Links to relevant docs
- **Common fixes**: Typical solutions

## Common Failure Scenarios

### Linting Failures

**Backend (Python)**
```
❌ Lint Backend — Failed
Error: Linting errors found
```

**How to fix:**
```bash
cd backend
ruff check app/ tests/              # See all errors
ruff check --fix app/ tests/        # Auto-fix most issues
mypy app/ --show-error-codes        # Check type errors
```

**Frontend (TypeScript/JavaScript)**
```
❌ Lint Frontend — Failed
Error: ESLint errors found
```

**How to fix:**
```bash
cd frontend
npm run lint                        # See all errors
npm run lint -- --fix               # Auto-fix most issues
npm run type-check                  # Check TypeScript errors
```

### Test Failures

**Backend Tests**
```
❌ Test Backend — Failed
Error: Tests failed or coverage below 80%
```

**How to fix:**
```bash
cd backend
pytest -v                           # See which tests failed
pytest -vv                          # See detailed output
pytest tests/test_file.py -v       # Run specific test file
pytest --cov=app --cov-report=html # Check coverage
```

**Frontend Tests**
```
❌ Test Frontend — Failed
Error: Tests failed
```

**How to fix:**
```bash
cd frontend
npm test                            # Run all tests
npm test -- --ui                    # Run in UI mode
npm test -- tests/file.test.ts     # Run specific test
npm test -- --coverage              # Check coverage
```

### Docker Build Failures

```
❌ Build Docker Images — Failed
Error: Backend Docker image build failed
```

**How to fix:**
```bash
cd backend
docker build -t backend:test .                    # Build locally
docker build --progress=plain -t backend:test .   # See detailed output
docker compose -f ../infrastructure/docker-compose.yml build backend
```

**Common issues:**
- Missing dependencies in requirements.txt or package.json
- Incorrect file paths in Dockerfile
- Base image not available
- Network issues during build

### Integration Test Failures

```
❌ Integration Tests — Failed
Error: Backend health check failed
```

**How to fix:**
```bash
cd infrastructure
docker compose up                   # Start all services
docker compose logs backend         # Check backend logs
docker compose logs postgres        # Check database logs
docker compose down -v              # Clean up
```

**Common issues:**
- Services not starting correctly
- Database connection failures
- Port conflicts
- Missing environment variables

### Security Scan Failures

```
❌ Scan Python Dependencies — Failed
Error: High-severity vulnerabilities found
```

**How to fix:**
```bash
cd backend
pip-audit --requirement requirements.txt    # See vulnerabilities
# Update vulnerable packages in requirements.txt
pip install --upgrade <package-name>
```

```
❌ Scan Node.js Dependencies — Failed
Error: High-severity vulnerabilities found
```

**How to fix:**
```bash
cd frontend
npm audit                           # See vulnerabilities
npm audit fix                       # Auto-fix vulnerabilities
npm audit fix --force               # Fix with breaking changes (careful!)
```

## Re-running Checks

### Re-run All Checks

1. Go to your pull request
2. Scroll to the checks section
3. Click "Re-run all checks"

### Re-run Failed Checks Only

1. Go to your pull request
2. Scroll to the checks section
3. Click "Re-run failed checks"

### Re-run by Pushing Changes

The easiest way to re-run checks is to push new commits:

```bash
git commit --allow-empty -m "Re-run checks"
git push
```

## Artifacts and Reports

Many checks produce artifacts you can download:

### Coverage Reports

**Backend Coverage**
- Artifact name: `backend-coverage-reports`
- Contains: `coverage.xml`, `htmlcov/`
- How to view: Download and open `htmlcov/index.html` in browser

**Frontend Coverage**
- Artifact name: `frontend-coverage-reports`
- Contains: `coverage/`
- How to view: Download and open `coverage/index.html` in browser

### Integration Test Logs

- Artifact name: `integration-test-logs`
- Contains: Logs from all services (backend, frontend, postgres, redis, traefik)
- How to view: Download and open `.log` files in text editor

### Security Scan Reports

- Artifact names: `python-security-audit`, `nodejs-security-audit`, `trivy-scan-reports`
- Contains: Detailed vulnerability reports
- How to view: Download and open `.txt`, `.md`, or `.json` files

### Downloading Artifacts

1. Click "Details" on any check
2. Scroll to the bottom of the workflow run page
3. Find the "Artifacts" section
4. Click on the artifact name to download

## Required vs Optional Checks

### Required Checks

These **must pass** before you can merge:

- Lint Backend
- Test Backend
- Lint Frontend
- Test Frontend
- Build Docker Images
- Integration Tests

If any required check fails, the merge button will be disabled.

### Optional Checks

These provide additional information but don't block merging:

- Security scans (unless configured as required)
- Docker build workflow (separate from CI)

Optional checks are useful for:
- Informational purposes
- Gradual adoption of new checks
- Checks that may have false positives

## Merge Requirements

Before you can merge your PR, you must:

1. ✅ All required status checks pass
2. ✅ Branch is up to date with base branch
3. ✅ At least 1 approval (if configured)
4. ✅ All conversations resolved (if configured)

### Updating Your Branch

If your branch is out of date:

```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
git push
```

Or use the GitHub UI:
1. Click "Update branch" button on your PR
2. Wait for checks to re-run

## Troubleshooting

### Checks Not Running

**Problem**: No checks appear on your PR.

**Solutions**:
1. Ensure workflows are enabled in repository settings
2. Check that workflow files exist in `.github/workflows/`
3. Verify workflows are triggered by `pull_request` events
4. Wait a few minutes - checks may be queued

### Checks Stuck in Pending

**Problem**: A check shows "pending" for a long time.

**Solutions**:
1. Check if GitHub Actions is experiencing issues: https://www.githubstatus.com/
2. View the workflow run to see if it's queued or running
3. Cancel and re-run if stuck for more than 30 minutes

### Can't Find Error Details

**Problem**: Check failed but error message is unclear.

**Solutions**:
1. Click "Details" to view full logs
2. Expand each step to see detailed output
3. Look for lines starting with `::error::`
4. Check artifacts for additional reports
5. Run the same commands locally to reproduce

### Checks Pass Locally But Fail in CI

**Problem**: Tests pass on your machine but fail in CI.

**Common causes**:
1. **Environment differences**: Different Python/Node versions
2. **Missing dependencies**: Not committed to requirements.txt or package.json
3. **Cached data**: Old cache on your machine
4. **Timing issues**: Race conditions in tests
5. **File paths**: Absolute paths that don't work in CI

**Solutions**:
```bash
# Match CI environment
python --version  # Should match PYTHON_VERSION in workflow
node --version    # Should match NODE_VERSION in workflow

# Clear local cache
rm -rf ~/.cache/pip
rm -rf node_modules
pip install -r requirements.txt
npm ci

# Run tests in clean environment
docker compose -f infrastructure/docker-compose.yml up --build
```

## Best Practices

### Before Opening a PR

Run checks locally to catch issues early:

```bash
# Backend checks
cd backend
ruff check app/ tests/
mypy app/
pytest --cov=app --cov-fail-under=80

# Frontend checks
cd frontend
npm run lint
npm run type-check
npm test -- --coverage

# Docker builds
cd infrastructure
docker compose build
docker compose up -d
docker compose down -v
```

### While PR is Open

1. **Monitor checks**: Keep an eye on check status
2. **Fix failures quickly**: Don't let PRs sit with failing checks
3. **Keep branch updated**: Merge main regularly to avoid conflicts
4. **Respond to reviews**: Address feedback promptly

### Before Merging

1. **All checks green**: Ensure all required checks pass
2. **Branch updated**: Merge latest changes from main
3. **Approvals received**: Get required approvals
4. **Conversations resolved**: Address all review comments

## Getting Help

If you're stuck:

1. **Check this guide**: Review relevant sections above
2. **View workflow logs**: Click "Details" for full error messages
3. **Run locally**: Reproduce the issue on your machine
4. **Ask the team**: Post in your team chat or open a discussion
5. **Check documentation**: Links provided in error messages

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Status Checks Documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [Branch Protection Guide](./BRANCH_PROTECTION.md)
- [CI/CD Documentation](../docs/CI_CD.md)

## Quick Reference

### Common Commands

```bash
# Backend
cd backend
ruff check app/ tests/ --fix        # Fix linting
mypy app/                            # Type check
pytest -v                            # Run tests
pytest --cov=app --cov-report=html  # Coverage report

# Frontend
cd frontend
npm run lint -- --fix                # Fix linting
npm run type-check                   # Type check
npm test                             # Run tests
npm test -- --coverage               # Coverage report

# Docker
cd infrastructure
docker compose up --build            # Start services
docker compose logs <service>        # View logs
docker compose down -v               # Clean up

# Git
git commit --allow-empty -m "Re-run checks"  # Re-trigger checks
git merge main                                # Update branch
```

### Status Check URLs

- **Actions Tab**: `https://github.com/{owner}/{repo}/actions`
- **Workflow Runs**: `https://github.com/{owner}/{repo}/actions/workflows/{workflow}.yml`
- **Specific Run**: Click "Details" on any check in your PR
