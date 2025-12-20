# Status Checks Reference

Quick reference for all GitHub Actions checks and their source workflows.

## CI Workflow (`.github/workflows/ci.yml`)

| Check Name | Purpose |
|------------|---------|
| Lint Backend | Ruff linting + mypy type checking |
| Test Backend | Backend tests with coverage threshold |
| Lint Frontend | ESLint + TypeScript type checking |
| Test Frontend | Frontend tests |
| Build Docker Images | Validate backend/frontend images build |
| Integration Tests | Full stack tests after images build |

## Security Workflow (`.github/workflows/security.yml`)

| Check Name | Purpose |
|------------|---------|
| Scan Python Dependencies | `pip-audit` vulnerability scan |
| Scan Node.js Dependencies | `npm audit` vulnerability scan |
| Scan Docker Images | Trivy scan for backend/frontend images |
| Security Scan Summary | Aggregate pass/fail status |

## Docker Build Workflow (`.github/workflows/docker.yml`)

| Check Name | Purpose |
|------------|---------|
| Build Backend Image | Build and optionally push backend image |
| Build Frontend Image | Build and optionally push frontend image |
| Build Summary | Aggregate build status |
