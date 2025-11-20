# GitHub Workflows and Status Checks

This directory contains GitHub Actions workflows and documentation for CI/CD pipelines and pull request status checks.

## Contents

### Workflow Files (`workflows/`)

- **`ci.yml`**: Main CI pipeline with linting, testing, Docker builds, and integration tests
- **`docker.yml`**: Docker image building and optional registry push
- **`security.yml`**: Security scanning for dependencies and Docker images

### Documentation Files

- **`PR_STATUS_CHECKS.md`**: Comprehensive guide for understanding and working with PR status checks
- **`STATUS_CHECKS_REFERENCE.md`**: Quick reference for all status checks, job names, and configuration
- **`BRANCH_PROTECTION.md`**: Guide for configuring branch protection rules and required checks

## Quick Start

### For Developers

**Before opening a PR**, run checks locally:

```bash
# Backend
cd backend
ruff check --fix app/ tests/
mypy app/
pytest --cov=app --cov-fail-under=80

# Frontend
cd frontend
npm run lint -- --fix
npm run type-check
npm test -- --coverage
```

**When your PR is open**, monitor status checks:

1. Scroll to bottom of PR page
2. View check status (✅ pass, ❌ fail, ⏳ running)
3. Click "Details" to view logs if checks fail
4. Follow error messages to fix issues

**See [PR_STATUS_CHECKS.md](./PR_STATUS_CHECKS.md) for detailed guidance.**

### For Repository Administrators

**Configure branch protection** to require status checks:

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Add required checks:
   - Lint Backend
   - Test Backend
   - Lint Frontend
   - Test Frontend
   - Build Docker Images
   - Integration Tests

**See [BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md) for step-by-step instructions.**

## Status Checks Overview

### CI Workflow

Runs on every push and pull request:

| Check | Duration | Purpose |
|-------|----------|---------|
| Lint Backend | 2-3 min | Python linting (ruff) and type checking (mypy) |
| Test Backend | 3-5 min | Backend tests with 80% coverage requirement |
| Lint Frontend | 1-2 min | ESLint and TypeScript type checking |
| Test Frontend | 2-3 min | Frontend tests with 80% coverage requirement |
| Build Docker Images | 5-7 min | Validates Docker images build successfully |
| Integration Tests | 10-15 min | Full-stack testing with all services |

**Total**: ~15-20 minutes (jobs run in parallel)

### Security Workflow

Runs weekly and on pull requests to main/develop:

| Check | Duration | Purpose |
|-------|----------|---------|
| Scan Python Dependencies | 2-3 min | Checks for vulnerabilities in Python packages |
| Scan Node.js Dependencies | 2-3 min | Checks for vulnerabilities in Node.js packages |
| Scan Docker Images | 5-10 min | Scans images for OS and app vulnerabilities |

### Docker Workflow

Runs on push to main and pull requests:

| Check | Duration | Purpose |
|-------|----------|---------|
| Build Backend Image | 5-7 min | Builds backend Docker image |
| Build Frontend Image | 5-7 min | Builds frontend Docker image |
| Build Summary | <1 min | Reports overall build status |

## Key Features

### Actionable Error Messages

All workflows provide clear, actionable error messages:

```
❌ Backend linting failed
::error::Backend linting errors found. Run 'cd backend && ruff check app/ tests/' locally.
::error::To auto-fix issues, run: cd backend && ruff check --fix app/ tests/
::error::Documentation: https://docs.astral.sh/ruff/
::error::Common fixes: Remove unused imports, fix line length, add missing docstrings
```

### Artifacts and Reports

Workflows produce downloadable artifacts:

- **Coverage reports**: HTML reports for backend and frontend
- **Integration test logs**: Service logs for debugging
- **Security scan reports**: Detailed vulnerability information

### Concurrency Control

Workflows automatically cancel old runs when you push new commits:

```yaml
concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
### Caching

Workflows cache dependencies to speed up execution:

- Python pip packages
- Node.js npm packages
- Docker layers

## Configuration

### Environment Variables

Workflows use these environment variables:

```yaml
env:
  PYTHON_VERSION: "3.12"
  NODE_VERSION: "20"
  COVERAGE_THRESHOLD: "80"
```

### Required Secrets (Optional)

For Docker registry push:

- `DOCKER_REGISTRY`: Container registry URL (default: ghcr.io)
- `DOCKER_USERNAME`: Registry username
- `DOCKER_PASSWORD`: Registry password/token

**Note**: For GitHub Container Registry, no secrets are required.

### Repository Variables (Optional)

- `ENABLE_DOCKER_SCANNING`: Enable/disable Docker image scanning (default: true)

## Customization

### Adjusting Coverage Threshold

Edit `workflows/ci.yml`:

```yaml
env:
  COVERAGE_THRESHOLD: "80"  # Change to desired percentage
```

### Adding Custom Checks

1. Add new job to workflow file
2. Give it a descriptive `name` field
3. Add to branch protection required checks
4. Update documentation

### Modifying Triggers

Edit the `on:` section in workflow files:

```yaml
on:
  push:
    branches: [main, develop]  # Limit to specific branches
  pull_request:
    branches: [main]            # Only PRs to main
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Checks not appearing on PR | Ensure workflow triggers include `pull_request` |
| Check stuck in pending | Check GitHub Actions status, cancel and re-run |
| Can't find error details | Click "Details" → Expand failed step → Look for `::error::` lines |
| Checks pass locally but fail in CI | Match Python/Node versions, clear caches, check environment |

**See [PR_STATUS_CHECKS.md](./PR_STATUS_CHECKS.md) for detailed troubleshooting.**

## Documentation

### For Developers

- **[PR_STATUS_CHECKS.md](./PR_STATUS_CHECKS.md)**: Complete guide to understanding and working with status checks
  - What are status checks
  - Understanding check states
  - Viewing check details
  - Common failure scenarios
  - Re-running checks
  - Artifacts and reports
  - Troubleshooting

### For Administrators

- **[BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md)**: Complete guide to configuring branch protection
  - Required status checks
  - Configuration via web UI, CLI, and Terraform
  - Understanding status check names
  - Customizing required checks
  - Troubleshooting

### Quick Reference

- **[STATUS_CHECKS_REFERENCE.md](./STATUS_CHECKS_REFERENCE.md)**: Quick reference for all checks
  - Status check names and IDs
  - Workflow triggers
  - Job dependencies
  - Execution times
  - Artifacts produced
  - Environment variables
  - Required secrets

## Best Practices

### For Developers

1. **Run checks locally** before pushing
2. **Monitor check status** on your PRs
3. **Fix failures quickly** - don't let PRs sit with failing checks
4. **Keep branch updated** - merge main regularly
5. **Read error messages** - they include helpful suggestions

### For Teams

1. **Start with essential checks** - add more as team matures
2. **Balance speed and quality** - find the right number of required checks
3. **Provide clear error messages** - help developers fix issues quickly
4. **Monitor check performance** - optimize slow checks
5. **Document customizations** - keep documentation up to date

## Support

For issues or questions:

1. Check the troubleshooting sections in documentation
2. Review workflow logs in the Actions tab
3. Consult GitHub Actions documentation
4. Open a discussion in your repository

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Status Checks Documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Workflow Syntax Documentation](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**Last Updated**: 2024  
**Workflow Version**: 1.0
