# test-devscaffolding

[![CI](https://github.com/YOUR_USERNAME/test-devscaffolding/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/test-devscaffolding/actions/workflows/ci.yml) [![Docker Build](https://github.com/YOUR_USERNAME/test-devscaffolding/actions/workflows/docker.yml/badge.svg)](https://github.com/YOUR_USERNAME/test-devscaffolding/actions/workflows/docker.yml) [![Security Scan](https://github.com/YOUR_USERNAME/test-devscaffolding/actions/workflows/security.yml/badge.svg)](https://github.com/YOUR_USERNAME/test-devscaffolding/actions/workflows/security.yml)

A production-ready monorepo application with FastAPI backend, Next.js frontend, PostgreSQL database, Redis cache, and Traefik ingress with automatic HTTPS.

## Features

- **Backend**: FastAPI with Python 3.12, Pydantic v2, SQLAlchemy/SQLModel
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL 17 with PgBouncer connection pooling
- **Cache**: Redis 7 for session management
- **Ingress**: Traefik v3 with automatic Let's Encrypt HTTPS
- **Monitoring**: Prometheus metrics
- **Testing**: pytest for backend, Vitest for frontend
- **Documentation**: Automatic OpenAPI/Swagger documentation

## 📚 Quick Links

- **[Testing Guide](./TESTING.md)** - How to test the API (Swagger UI + curl examples)
- **[Docker Setup Guide](./docs/DOCKER_SETUP.md)** - Multi-project Docker/Colima management
- **[Colima Troubleshooting](./docs/COLIMA_TROUBLESHOOTING.md)** - Fix common Colima issues
- **[Backend README](./backend/README.md)** - Backend setup and development
- **[Frontend README](./frontend/README.md)** - Frontend setup and development

## CI/CD Status Badges

The badges at the top of this README show the current status of automated workflows:

- **CI Badge**: Shows if code quality checks and tests are passing
- **Docker Build Badge**: Shows if Docker images build successfully
- **Security Scan Badge**: Shows if there are any security vulnerabilities

### Setting Up Badges

After pushing your project to GitHub, update the badge URLs:

1. Replace `YOUR_USERNAME` with your GitHub username or organization name in the badge URLs at the top of this file
2. The badges will automatically update based on your workflow runs

**Example:**
```markdown
[![CI](https://github.com/mycompany/test-devscaffolding/actions/workflows/ci.yml/badge.svg)](https://github.com/mycompany/test-devscaffolding/actions/workflows/ci.yml)
```

### Viewing Workflow Runs

To view detailed workflow results:

1. **Via GitHub UI:**
   - Go to your repository on GitHub
   - Click the "Actions" tab
   - Select a workflow from the left sidebar
   - Click on a specific run to see details

2. **Via Pull Requests:**
   - Open any pull request
   - Scroll to the bottom to see status checks
   - Click "Details" next to any check to view logs

3. **Via Commits:**
   - Go to the "Commits" page
   - Click the ✅ or ❌ icon next to any commit
   - View all workflow statuses for that commit

For more information about the CI/CD pipelines, see [docs/CI_CD.md](docs/CI_CD.md).

## Quick Start

### Prerequisites

- **Docker**: Docker Desktop, Colima, or OrbStack
  - **Colima (raccomandato per Mac)**: `brew install colima`
  - Vedi [Docker Setup Guide](./docs/DOCKER_SETUP.md) per configurazione multi-progetto
- Domain name pointing to your server (for production)
- Ports 80 and 443 available

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd test-devscaffolding
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize and start services**
   ```bash
   make init
   make up
   ```

4. **Run database migrations**
   ```bash
   make migrate
   ```

5. **Access the application**
- Frontend: `https://test.example.com/test-devscaffolding`
   - Backend API: `https://test.example.com/test-devscaffolding/api/v1`
   - API Docs: `https://test.example.com/test-devscaffolding/api/docs`
   - Local Frontend: `http://localhost/test-devscaffolding`
   - Local Backend API: `http://localhost/test-devscaffolding/api/v1`
- Traefik Dashboard: `http://localhost:8080`
   - Prometheus: `http://localhost:9090`

## Development

### Docker Development (Recommended)

```bash
# Start all services
make up

# View logs
docker compose logs -f

# Stop services
make down

# Run tests
make test

# Run linters
make lint
```

### Local Development

**Backend:**

```bash
cd backend

# Setup virtual environment
./setup.sh

# Or manually:
python3 -m venv venv
source venv/bin/activate  # On Linux/macOS
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Run linter
ruff check .
ruff format .
mypy .
```

**Frontend:**

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Run linter
npm run lint
npm run format
```

### Avviare rapidamente tutti i servizi

Per avviare frontend, backend e l'intero stack Docker (PostgreSQL, PgBouncer, Redis, Traefik, Prometheus) con un solo comando, assicurandoti prima che le porte richieste siano libere:

```bash
./scripts/start_services.sh
```

Lo script verifica le porte più comuni (3000, 8000, 5432, 6379, 8080, 80, 443, 9090, 6432) e termina automaticamente eventuali processi che le stanno utilizzando prima di eseguire `docker compose up -d`.

## Project Structure

```
test-devscaffolding/
├── backend/              # FastAPI backend
│   ├── app/             # Application code
│   ├── tests/           # Backend tests
│   └── venv/            # Python virtual environment
├── frontend/            # Next.js frontend
│   ├── src/             # Source code
│   └── tests/           # Frontend tests
├── infrastructure/      # Docker Compose and configs
│   ├── docker-compose.yml
│   ├── traefik/         # Traefik configuration
│   ├── postgres/        # PostgreSQL and PgBouncer
│   ├── redis/           # Redis configuration
│   └── prometheus/      # Prometheus configuration
├── docs/                # Documentation
│   ├── README.md        # Architecture documentation
│   ├── CONTRIBUTING.md  # Contributing guidelines
│   ├── adr/             # Architecture Decision Records
│   └── api/             # API documentation
├── scripts/             # Utility scripts
├── .env.example         # Environment variables template
├── Makefile             # Common tasks
└── README.md            # This file
```

## Available Commands

### Makefile Targets

```bash
make init          # Initialize project (copy .env, build images)
make init-local    # Initialize for local development
make up            # Start all services
make down          # Stop all services
make migrate       # Run database migrations
make migrate-local # Run migrations locally
make test          # Run all tests
make test-local    # Run tests locally
make lint          # Run linters
make lint-local    # Run linters locally
make release       # Create a new release
```

### Docker Compose Commands

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f [service]

# Stop services
docker compose down

# Restart service
docker compose restart [service]

# Execute command in service
docker compose exec [service] [command]

# View service status
docker compose ps
```

## Configuration

### Environment Variables

All configuration is managed through environment variables. Copy `.env.example` to `.env` and configure:

**Required Variables:**
- `PROJECT_NAME`: Project name
- `DOMAIN`: Domain for HTTPS (e.g., example.com)
- `ACME_EMAIL`: Email for Let's Encrypt certificates
- `SECRET_KEY`: Secret key for sessions (auto-generated)
- `POSTGRES_PASSWORD`: PostgreSQL password (auto-generated)

**Optional Variables:**
- `APP_VERSION`: Application version (default: 0.1.0)
- `GIT_COMMIT`: Git commit hash (default: dev)
- `BUILD_DATE`: Build timestamp (auto-generated)
- `BASE_PATH`: URL base path for subpath deployment (configured as: /test-devscaffolding)
See `.env.example` for complete list with descriptions.

### Subpath Deployment Configuration

This application is configured for **subpath deployment** at `/test-devscaffolding`. This means:

- The application is accessible at `https://test.example.com/test-devscaffolding` (not at the domain root)
- All API endpoints are prefixed with `/test-devscaffolding/api`
- Static assets are served under `/test-devscaffolding`
- For local testing, use `http://localhost/test-devscaffolding`

**Key Configuration Details:**
- **Next.js basePath**: Set to `/test-devscaffolding` in `frontend/next.config.js`
- **FastAPI root_path**: Set to `/test-devscaffolding` in `backend/app/main.py`
- **Traefik routing**: Configured with `PathPrefix(/test-devscaffolding)` rules
- **Environment variable**: `NEXT_PUBLIC_BASE_PATH=/test-devscaffolding`

## API Documentation

The backend automatically generates interactive API documentation:

- **Swagger UI**: `https://test.example.com/api/docs`
- **ReDoc**: `https://test.example.com/api/redoc`
- **OpenAPI JSON**: `https://test.example.com/api/openapi.json`

See [docs/api/README.md](docs/api/README.md) for detailed API documentation.

## Testing

### Backend Tests

```bash
# Run all tests
cd backend
source venv/bin/activate
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test
pytest tests/api/test_version.py
```

### Frontend Tests

```bash
# Run all tests
cd frontend
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Deployment

### Production Deployment

1. **Prepare server**
   - Install Docker and Docker Compose
   - Configure domain DNS to point to server
   - Ensure ports 80 and 443 are open

2. **Deploy application**
   ```bash
   git clone <repository-url>
   cd test-devscaffolding
   cp .env.example .env
   # Edit .env with production values
   make init
   make up
   make migrate
   ```

3. **Verify deployment**
   - Check all services are running: `docker compose ps`
   - Verify HTTPS is working: `https://test.example.com`
   - Check Traefik dashboard: `http://localhost:8080`

### Backup and Recovery

**Database Backup:**
```bash
./scripts/backup-db.sh
```

**Restore Database:**
```bash
docker compose exec -T postgres psql -U postgres test-devscaffolding < backup.sql
```

## Monitoring

### Prometheus Metrics

Access Prometheus at `http://localhost:9090`

**Available Metrics:**
- Backend API metrics: `http://backend:8000/metrics`
- Traefik metrics: `http://traefik:8080/metrics`

### Logs

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f traefik

# View recent logs
docker compose logs --tail=100 backend
```

### Health Checks

```bash
# Backend health
curl https://test.example.com/test-devscaffolding/api/v1/health
# Backend version
curl https://test.example.com/test-devscaffolding/api/v1/version
# Check service status
docker compose ps
```

## Troubleshooting

### Docker/Colima Issues

Se hai problemi con Docker o Colima:

```bash
# Verifica Docker
docker ps

# Se fallisce, riavvia Colima
./scripts/restart_colima.sh
```

Vedi la guida completa: [Colima Troubleshooting](./docs/COLIMA_TROUBLESHOOTING.md)

### Services won't start

```bash
# Check logs
docker compose logs [service]

# Check service status
docker compose ps

# Restart service
docker compose restart [service]

# Rebuild and restart
docker compose up -d --build [service]
```

### HTTPS certificate issues

```bash
# Check Traefik logs
docker compose logs traefik

# Verify domain DNS
nslookup test.example.com

# Check ACME storage
ls -la infrastructure/traefik/acme/

# Ensure ports 80 and 443 are accessible
curl -I http://test.example.com
```

### Database connection issues

```bash
# Check PostgreSQL logs
docker compose logs postgres

# Check PgBouncer logs
docker compose logs pgbouncer

# Test database connection
docker compose exec backend python -c "from app.database import engine; engine.connect()"

# Check database is running
docker compose exec postgres psql -U postgres -c "SELECT version();"
```

### Performance issues

```bash
# Check resource usage
docker stats

# Check PgBouncer pool
docker compose exec pgbouncer psql -p 6432 -U postgres pgbouncer -c "SHOW POOLS;"

# Check Redis memory
docker compose exec redis redis-cli INFO memory

# View Prometheus metrics
open http://localhost:9090
```

### Subpath routing issues

**Problem: 404 errors when accessing the application**

```bash
# Verify Traefik routing rules
docker compose logs traefik | grep "/test-devscaffolding"

# Check that services are registered with Traefik
curl http://localhost:8080/api/http/routers

# Test localhost routing
curl -I http://localhost/test-devscaffolding
```

**Solution:**
- Ensure you're accessing the correct URL: `https://test.example.com/test-devscaffolding` (not `https://test.example.com`)
- For local testing, use: `http://localhost/test-devscaffolding`
- Verify Traefik labels in `infrastructure/docker-compose.yml` include `PathPrefix(/test-devscaffolding)`

**Problem: Static assets (JS, CSS, images) fail to load**

**Symptoms:**
- Frontend loads but appears broken or unstyled
- Browser console shows 404 errors for `.js` and `.css` files
- Images don't display

**Solution:**
```bash
# Verify Next.js basePath configuration
cat frontend/next.config.js | grep basePath

# Check environment variable is set
docker compose exec frontend env | grep NEXT_PUBLIC_BASE_PATH

# Rebuild frontend with correct base path
docker compose up -d --build frontend
```

**Expected configuration:**
- `frontend/next.config.js` should have: `basePath: '/test-devscaffolding'`
- `NEXT_PUBLIC_BASE_PATH` environment variable should be: `/test-devscaffolding`

**Problem: API calls return 404 or CORS errors**

**Symptoms:**
- Frontend loads but API requests fail
- Browser console shows CORS errors
- Network tab shows requests to wrong API URL

**Solution:**
```bash
# Verify API URL configuration
docker compose exec frontend env | grep NEXT_PUBLIC_API_URL

# Check backend routing in Traefik
docker compose logs traefik | grep backend

# Test API endpoint directly
curl http://localhost/test-devscaffolding/api/v1/health
```

**Expected configuration:**
- `NEXT_PUBLIC_API_URL` should be: `https://test.example.com/test-devscaffolding/api`
- Backend Traefik rule should include: `PathPrefix(/test-devscaffolding/api)`

**Problem: OpenAPI docs not accessible**

**Solution:**
```bash
# Access docs at the correct path
open https://test.example.com/test-devscaffolding/api/docs

# Or for local testing
open http://localhost/test-devscaffolding/api/docs

# Verify FastAPI root_path is set
docker compose exec backend python -c "from app.main import app; print(app.root_path)"
```

**Expected output:** `/test-devscaffolding`

**Problem: Internal navigation (Link components) doesn't work**

**Symptoms:**
- Clicking links results in 404 errors
- URLs don't include the base path
- Navigation works on first load but breaks on subsequent clicks

**Solution:**
- Ensure you're using Next.js `Link` component (not `<a>` tags)
- Verify `basePath` is set in `next.config.js`
- Rebuild frontend: `docker compose up -d --build frontend`

**Testing subpath routing locally:**

```bash
# 1. Ensure services are running
docker compose ps

# 2. Test frontend (should return HTML)
curl -I http://localhost/test-devscaffolding

# 3. Test backend API (should return JSON)
curl http://localhost/test-devscaffolding/api/v1/health

# 4. Test static assets (should return JavaScript)
curl -I http://localhost/test-devscaffolding/_next/static/

# 5. Check Traefik routing
curl http://localhost:8080/api/http/routers | jq '.[] | select(.name | contains("test-devscaffolding"))'
```

**All tests should return 200 OK status codes.**

## Security

### Best Practices

- **Secrets**: Never commit `.env` file or secrets to version control
- **HTTPS**: Always use HTTPS in production (automatic with Traefik)
- **Updates**: Regularly update dependencies and Docker images
- **Backups**: Implement regular database backup strategy
- **Monitoring**: Monitor logs and metrics for suspicious activity

### Security Features

- Automatic HTTPS with Let's Encrypt
- HTTP to HTTPS redirect
- Non-root users in all containers
- Session tokens stored in Redis (not in cookies)
- CORS configured for frontend domain only
- Rate limiting (via Traefik middleware)

## CI/CD

This project includes comprehensive CI/CD pipelines using GitHub Actions.

### Status Checks

Every pull request runs automated checks:

| Check | Purpose | Duration |
|-------|---------|----------|
| ✅ Lint Backend | Python code quality | ~1-2 min |
| ✅ Test Backend | Backend tests + coverage | ~2-3 min |
| ✅ Lint Frontend | TypeScript/JS quality | ~1-2 min |
| ✅ Test Frontend | Frontend tests + coverage | ~2-3 min |
| ✅ Build Docker | Validate Docker builds | ~3-5 min |
| ✅ Integration Tests | Full stack testing | ~5-8 min |

**Total Time:** ~10-15 minutes

### Viewing Status Checks

- **Detailed logs**: PR → Checks tab
- **Quick overview**: PR → Conversation tab (bottom)
- **Commit status**: Commits tab → Click badges

See [.github/PR_STATUS_CHECKS.md](.github/PR_STATUS_CHECKS.md) for detailed guide.

### Quick Reference

```bash
# Run checks locally before pushing
cd backend && ruff check --fix app/ tests/
cd backend && pytest --cov=app
cd frontend && npm run lint -- --fix
cd frontend && npm test
```

**Documentation:**
- 📖 [Pull Request Status Checks Guide](.github/PR_STATUS_CHECKS.md)
- 📋 [Status Checks Quick Reference](.github/STATUS_CHECKS_REFERENCE.md)
- 🛡️ [Branch Protection Configuration](.github/BRANCH_PROTECTION.md)
- 📚 [CI/CD Documentation](docs/CI_CD.md)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. **Run checks locally** (see CI/CD section above)
6. Submit a pull request
7. **Wait for status checks** to pass
8. Address review feedback

## Documentation

- [Architecture Documentation](docs/README.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)
- [API Documentation](docs/api/README.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

### Architecture Decision Records

- [ADR-0001: Use FastAPI for Backend](docs/adr/0001-use-fastapi-for-backend.md)
- [ADR-0002: Use Next.js App Router](docs/adr/0002-use-nextjs-app-router.md)
- [ADR-0003: Use PgBouncer Transaction Mode](docs/adr/0003-use-pgbouncer-transaction-mode.md)
- [ADR-0004: Use Traefik for Ingress](docs/adr/0004-use-traefik-for-ingress.md)

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.12
- **ORM**: SQLAlchemy/SQLModel
- **Validation**: Pydantic v2
- **Migrations**: Alembic
- **Testing**: pytest, pytest-asyncio

### Frontend
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Testing**: Vitest, React Testing Library

### Infrastructure
- **Database**: PostgreSQL 17
- **Connection Pool**: PgBouncer
- **Cache**: Redis 7
- **Ingress**: Traefik v3
- **Monitoring**: Prometheus
- **Container**: Docker & Docker Compose

## License

[Your License Here]

## Support

For issues, questions, or contributions:
- **Issues**: [GitHub Issues](<repository-url>/issues)
- **Discussions**: [GitHub Discussions](<repository-url>/discussions)
- **Documentation**: [docs/README.md](docs/README.md)

## Acknowledgments

Built with modern technologies and best practices for production-ready applications.

---

**Version**: 0.1.0  
**Build**: dev  
**Date**: 2025-11-19T21:50:07.698425
