# Branch Protection Configuration Guide

This guide explains how to configure branch protection rules to ensure all workflow statuses appear on pull requests and make required checks clear.

## Overview

Branch protection rules enforce quality gates by requiring specific status checks to pass before merging pull requests. This ensures code quality, security, and stability.

## Required Status Checks

The following status checks should be configured as required for your main branch:

### CI Workflow Checks

- **Lint Backend** - Ensures backend code passes linting and type checking
- **Test Backend** - Ensures backend tests pass with minimum coverage
- **Lint Frontend** - Ensures frontend code passes linting and type checking
- **Test Frontend** - Ensures frontend tests pass with minimum coverage
- **Build Docker Images** - Ensures Docker images build successfully
- **Integration Tests** - Ensures all services work together correctly

### Security Workflow Checks (Optional but Recommended)

- **Scan Python Dependencies** - Ensures no high-severity vulnerabilities in Python packages
- **Scan Node.js Dependencies** - Ensures no high-severity vulnerabilities in Node.js packages
- **Scan Docker Images** - Ensures no critical vulnerabilities in Docker images

## Configuring Branch Protection

### Via GitHub Web Interface

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Branches**
3. Click **Add rule** or edit existing rule for your main branch
4. Configure the following settings:

#### Basic Settings

- **Branch name pattern**: `main` (or your default branch)
- ✅ **Require a pull request before merging**
  - ✅ **Require approvals**: 1 (adjust based on team size)
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**

#### Required Status Checks

Add the following status checks (exact names from workflows):

**From CI Workflow** (`.github/workflows/ci.yml`):
```
Lint Backend
Test Backend
Lint Frontend
Test Frontend
Build Docker Images
Integration Tests
```

**From Security Workflow** (`.github/workflows/security.yml`) - Optional:
```
Scan Python Dependencies
Scan Node.js Dependencies
Scan Docker Images
```

**From Docker Workflow** (`.github/workflows/docker.yml`) - Optional:
```
Build Backend Image
Build Frontend Image
Build Summary
```

#### Additional Recommended Settings

- ✅ **Require conversation resolution before merging**
- ✅ **Require linear history** (optional, for cleaner git history)
- ✅ **Include administrators** (enforce rules for everyone)
- ✅ **Restrict who can push to matching branches** (optional, for stricter control)

### Via GitHub CLI

You can also configure branch protection using the GitHub CLI:

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Configure branch protection for main branch
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Lint Backend","Test Backend","Lint Frontend","Test Frontend","Build Docker Images","Integration Tests"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

### Via Terraform (Infrastructure as Code)

```hcl
resource "github_branch_protection" "main" {
  repository_id = github_repository.repo.node_id
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = [
      "Lint Backend",
      "Test Backend",
      "Lint Frontend",
      "Test Frontend",
      "Build Docker Images",
      "Integration Tests",
    ]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews          = true
  }

  enforce_admins = true
}
```

## Understanding Status Check Names

Status check names come from the `name` field in each job within your workflow files:

```yaml
jobs:
  lint-backend:
    name: Lint Backend  # This is the status check name
    runs-on: ubuntu-latest
    # ...
```

To find the exact status check names:

1. Open a pull request
2. Scroll to the bottom to see the status checks section
3. The names displayed are the exact names to use in branch protection

## Viewing Status Checks on Pull Requests

Once configured, pull requests will display:

### Status Check Summary

At the bottom of each PR, you'll see:

```
✅ All checks have passed
   6 successful checks

or

❌ Some checks were not successful
   4 successful checks
   2 failing checks
```

### Individual Check Details

Click on "Details" next to any check to:
- View the full workflow run logs
- See which step failed
- Access error messages and remediation suggestions
- Download artifacts (coverage reports, logs, etc.)

### Required vs Optional Checks

- **Required checks** (configured in branch protection):
  - Must pass before merging
  - Displayed with a red X if failing
  - Merge button is disabled until they pass

- **Optional checks** (not in branch protection):
  - Can fail without blocking merge
  - Displayed with a yellow warning icon
  - Useful for informational checks

## Customizing Required Checks

### Making Checks Optional

To make a check optional (not required for merge):

1. Remove it from the branch protection required status checks list
2. The check will still run but won't block merging

### Adding New Required Checks

When you add new jobs to your workflows:

1. Push the workflow changes to your repository
2. Open a test pull request to trigger the new checks
3. Go to branch protection settings
4. Add the new check names to the required status checks list

### Conditional Checks

Some checks may be conditional (e.g., security scans only on schedule):

```yaml
jobs:
  scan-docker-images:
    name: Scan Docker Images
    if: vars.ENABLE_DOCKER_SCANNING != 'false'
    # ...
```

For conditional checks:
- Don't add them to required status checks if they don't always run
- Or ensure they always run on pull requests

## Troubleshooting

### Check Not Appearing on PR

**Problem**: A workflow runs but doesn't show up as a status check on the PR.

**Solutions**:
1. Ensure the workflow is triggered by `pull_request` events:
   ```yaml
   on:
     pull_request:
       branches: ["**"]
   ```

2. Check that the job has a `name` field:
   ```yaml
   jobs:
     my-job:
       name: My Job Name  # Required for status checks
   ```

3. Verify the workflow file is in `.github/workflows/` directory

### Check Always Pending

**Problem**: A status check shows as "pending" indefinitely.

**Solutions**:
1. Check workflow logs for errors or timeouts
2. Ensure the job completes (doesn't hang)
3. Add timeout to prevent hanging:
   ```yaml
   jobs:
     my-job:
       timeout-minutes: 30
   ```

### Wrong Check Name in Branch Protection

**Problem**: Branch protection requires a check that doesn't exist.

**Solutions**:
1. Open a recent PR and note the exact check names displayed
2. Update branch protection to use the correct names
3. Check names are case-sensitive and must match exactly

### Can't Merge Despite Passing Checks

**Problem**: All checks pass but merge button is still disabled.

**Solutions**:
1. Ensure "Require branches to be up to date" is not blocking you
   - Click "Update branch" to merge latest changes from main
2. Check if conversation resolution is required
3. Verify you have sufficient permissions to merge

### Checks Not Running on PR

**Problem**: Workflows don't trigger when opening a PR.

**Solutions**:
1. Verify workflow files are on the base branch (main)
2. Check workflow trigger configuration includes `pull_request`
3. Ensure repository has Actions enabled (Settings → Actions)
4. Check if workflows are disabled or have errors

## Best Practices

### Start with Essential Checks

Begin with core quality checks:
1. Linting (backend and frontend)
2. Tests (backend and frontend)
3. Docker builds

Add additional checks (security, integration tests) as your team matures.

### Balance Speed and Quality

- Too many required checks slow down development
- Too few checks risk quality issues
- Find the right balance for your team

### Use Concurrency Control

Prevent multiple workflow runs from confusing status checks:

```yaml
concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
### Provide Clear Error Messages

Help developers fix issues quickly:

```yaml
- name: Run tests
  run: |
    if ! pytest; then
      echo "::error::Tests failed. Run 'pytest -v' locally to see details."
      exit 1
    fi
```

### Monitor Check Performance

- Track how long checks take to run
- Optimize slow checks with caching
- Consider splitting large jobs into smaller parallel jobs

## Example PR Status Display

When properly configured, a pull request will show:

```
Checks (6)
✅ Lint Backend — Passed in 2m 15s
✅ Test Backend — Passed in 3m 42s
✅ Lint Frontend — Passed in 1m 30s
✅ Test Frontend — Passed in 2m 05s
✅ Build Docker Images — Passed in 5m 20s
✅ Integration Tests — Passed in 8m 15s

This branch has no conflicts with the base branch
Merging can be performed automatically.

[Merge pull request ▼]
```

If a check fails:

```
Checks (6)
✅ Lint Backend — Passed in 2m 15s
❌ Test Backend — Failed in 1m 30s
✅ Lint Frontend — Passed in 1m 30s
✅ Test Frontend — Passed in 2m 05s
⚠️  Build Docker Images — Skipped
⚠️  Integration Tests — Skipped

Some checks were not successful
2 failing and 2 skipped checks

[Details] [Re-run failed checks]
```

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Status Checks Documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub CLI Branch Protection](https://cli.github.com/manual/gh_api)

## Support

If you encounter issues with status checks or branch protection:

1. Check the workflow logs in the Actions tab
2. Review this documentation for common solutions
3. Consult the GitHub documentation links above
4. Open an issue in your repository for team discussion
