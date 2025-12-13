# Contributing to eno_inventory

Thank you for your interest in contributing to eno_inventory! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Development Setup

### Prerequisites

- **Docker & Docker Compose**: For containerized development
- **Python 3.12**: For local backend development
- **Node.js 20**: For local frontend development
- **Git**: Version control

### Initial Setup

#### Option 1: Docker Development (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd eno_inventory

# Initialize project
make init

# Start all services
make up

# View logs
docker compose logs -f
```

#### Option 2: Local Development

**Backend Setup:**

```bash
cd backend

# Run setup script (creates venv and installs dependencies)
./setup.sh

# Or manually:
python3 -m venv venv
source venv/bin/activate  # On Linux/macOS
# venv\Scripts\activate   # On Windows

pip install -r requirements.txt
pip install -r requirements-dev.txt

# Set up environment variables
cp ../.env.example ../.env
# Edit .env with your configuration

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup:**

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables (if needed)
cp .env.example .env.local

# Run development server
npm run dev
```

### Database Setup

```bash
# Run migrations
make migrate

# Or manually with Docker:
docker compose exec backend alembic upgrade head

# Or locally:
cd backend
source venv/bin/activate
alembic upgrade head
```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following our [Code Standards](#code-standards)
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   make test
   make lint
   ```

4. **Commit your changes**
   - Follow our [Commit Guidelines](#commit-guidelines)
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Running Services

```bash
# Start all services
make up

# Start specific service
docker compose up backend

# Stop all services
make down

# View logs
docker compose logs -f [service]

# Restart service
docker compose restart [service]
```

## Code Standards

### Backend (Python)

**Style Guide:**
- Follow PEP 8 style guide
- Use type hints for all function signatures
- Maximum line length: 100 characters
- Use docstrings for all public functions and classes

**Tools:**
- **Linter**: ruff
- **Formatter**: ruff format
- **Type Checker**: mypy

**Running checks:**
```bash
cd backend
source venv/bin/activate

# Lint
ruff check .

# Format
ruff format .

# Type check
mypy .
```

**Code Structure:**
- Keep functions small and focused
- Use dependency injection for services
- Follow repository pattern for data access
- Use Pydantic models for validation

### Frontend (TypeScript)

**Style Guide:**
- Follow TypeScript best practices
- Use functional components with hooks
- Maximum line length: 100 characters
- Use JSDoc comments for complex functions

**Tools:**
- **Linter**: ESLint
- **Formatter**: Prettier
- **Type Checker**: TypeScript compiler

**Running checks:**
```bash
cd frontend

# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

**Code Structure:**
- Use Server Components by default
- Mark Client Components with 'use client'
- Keep components small and reusable
- Use shadcn/ui components for UI elements
- Organize by feature when possible

### Pre-commit Hooks

We use pre-commit hooks to ensure code quality:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

Hooks will automatically run on commit and check:
- Code formatting (ruff, prettier)
- Linting (ruff, eslint)
- Type checking (mypy, tsc)
- Trailing whitespace
- YAML syntax

## Testing

### Backend Tests

**Test Structure:**
- `tests/unit/`: Unit tests for business logic
- `tests/api/`: API endpoint tests
- `tests/integration/`: Integration tests with database

**Running tests:**
```bash
# All tests
make test

# Or with Docker:
docker compose exec backend pytest

# Or locally:
cd backend
source venv/bin/activate
pytest

# With coverage:
pytest --cov=app --cov-report=html

# Specific test file:
pytest tests/api/test_version.py

# Specific test:
pytest tests/api/test_version.py::test_version_endpoint
```

**Writing tests:**
```python
# tests/api/test_example.py
from fastapi.testclient import TestClient

def test_example_endpoint(client: TestClient):
    """Test example endpoint returns expected data."""
    response = client.get("/api/v1/example")
    assert response.status_code == 200
    assert response.json()["key"] == "value"
```

### Frontend Tests

**Test Structure:**
- `tests/unit/`: Component and utility tests
- `tests/integration/`: Integration tests

**Running tests:**
```bash
# All tests
cd frontend
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

**Writing tests:**
```typescript
// tests/unit/example.test.ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExampleComponent from '@/components/ExampleComponent';

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(<ExampleComponent />);
    expect(screen.getByText('Example')).toBeInTheDocument();
  });
});
```

### Test Guidelines

- Write tests for all new features
- Maintain or improve code coverage
- Test edge cases and error conditions
- Use descriptive test names
- Keep tests focused and independent
- Mock external dependencies appropriately

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(backend): add user authentication endpoint

Implement JWT-based authentication with refresh tokens.
Includes login, logout, and token refresh endpoints.

Closes #123

---

fix(frontend): resolve navigation menu overflow on mobile

The navigation menu was overflowing on small screens.
Added responsive breakpoints and mobile menu toggle.

---

docs: update API documentation for version endpoint

Added examples and response schema details.
```

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**
   ```bash
   make test
   ```

2. **Run linters**
   ```bash
   make lint
   ```

3. **Update documentation**
   - Update README if needed
   - Add/update API documentation
   - Update relevant ADRs

4. **Rebase on main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No new warnings
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linters
2. **Code Review**: At least one approval required
3. **Address Feedback**: Make requested changes
4. **Merge**: Squash and merge when approved

## Database Migrations

### Creating Migrations

```bash
# With Docker:
docker compose exec backend alembic revision --autogenerate -m "description"

# Locally:
cd backend
source venv/bin/activate
alembic revision --autogenerate -m "description"
```

### Applying Migrations

```bash
# With Docker:
make migrate

# Locally:
cd backend
source venv/bin/activate
alembic upgrade head
```

### Migration Guidelines

- Review auto-generated migrations carefully
- Test migrations on development database first
- Include both upgrade and downgrade paths
- Document complex migrations
- Never modify applied migrations

## Release Process

### Creating a Release

```bash
# Use the release script
make release

# Or manually:
./scripts/release.sh
```

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version bumped in VERSION file
- [ ] Git tag created (vX.Y.Z)
- [ ] Docker images tagged

## Getting Help

- **Documentation**: Check [docs/README.md](./README.md)
- **Issues**: Search existing issues or create new one
- **Discussions**: Use GitHub Discussions for questions

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

Thank you for contributing to eno_inventory!
