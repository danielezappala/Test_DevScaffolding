# eno_inventory - Architecture Documentation

## Overview

eno_inventory is a production-ready monorepo application built with modern technologies and best practices. The system consists of a FastAPI backend, Next.js frontend, PostgreSQL database with PgBouncer connection pooling, Redis for session management, and Traefik as the ingress controller with automatic HTTPS.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS (443)
                         │
                    ┌────▼─────┐
                    │ Traefik  │ (Ingress + ACME/Let's Encrypt)
                    │   v3     │
                    └────┬─────┘
                         │
            ┌────────────┴────────────┐
            │                         │
       ┌────▼─────┐            ┌─────▼────┐
       │ Frontend │            │ Backend  │
       │ Next.js  │            │ FastAPI  │
       │  :3000   │            │  :8000   │
       └──────────┘            └─────┬────┘
                                     │
                        ┌────────────┼────────────┐
                        │                         │
                   ┌────▼─────┐            ┌─────▼────┐
                   │PgBouncer │            │  Redis   │
                   │  :6432   │            │  :6379   │
                   └────┬─────┘            └──────────┘
                        │
                   ┌────▼─────┐
                   │PostgreSQL│
                   │    17    │
                   │  :5432   │
                   └──────────┘
```

### Components

#### Frontend (Next.js)
- **Technology**: Next.js 14+ with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Features**: Server-Side Rendering (SSR), Incremental Static Regeneration (ISR)
- **Port**: 3000 (internal)
- **Routing**: Served at `https://test.example.com/`

#### Backend (FastAPI)
- **Technology**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy/SQLModel
- **Features**: 
  - RESTful API with automatic OpenAPI documentation
  - JSON structured logging
  - Prometheus metrics at `/metrics`
  - Version endpoint at `/api/v1/version`
  - Redis-based session management with opaque tokens
- **Port**: 8000 (internal)
- **Routing**: Served at `https://test.example.com/api/`

#### Database (PostgreSQL 17)
- **Technology**: PostgreSQL 17 with JSONB support
- **Connection Pooling**: PgBouncer in transaction mode
- **Migrations**: Alembic
- **Port**: 5432 (internal), accessed via PgBouncer at 6432

#### Cache (Redis)
- **Technology**: Redis 7
- **Purpose**: Session storage with opaque tokens
- **Port**: 6379 (internal)

#### Ingress (Traefik v3)
- **Technology**: Traefik v3
- **Features**:
  - Automatic HTTPS with Let's Encrypt (ACME)
  - HTTP to HTTPS redirect
  - Docker service discovery
  - Prometheus metrics
- **Ports**: 80 (HTTP), 443 (HTTPS), 8080 (Dashboard)

#### Monitoring (Prometheus)
- **Technology**: Prometheus
- **Scrape Targets**: Backend metrics, Traefik metrics
- **Port**: 9090 (internal)

## Directory Structure

```
eno_inventory/
├── backend/              # FastAPI backend service
│   ├── app/             # Application code
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Core functionality (logging, metrics, sessions)
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── migrations/  # Alembic migrations
│   ├── tests/           # Backend tests
│   ├── venv/            # Python virtual environment (gitignored)
│   └── setup.sh         # Virtual environment setup script
├── frontend/            # Next.js frontend service
│   ├── src/
│   │   ├── app/         # Next.js App Router pages
│   │   ├── components/  # React components (including shadcn/ui)
│   │   ├── lib/         # Utilities and API client
│   │   └── types/       # TypeScript types
│   └── tests/           # Frontend tests
├── infrastructure/      # Infrastructure configuration
│   ├── docker-compose.yml
│   ├── traefik/         # Traefik configuration
│   ├── postgres/        # PostgreSQL and PgBouncer config
│   ├── redis/           # Redis configuration
│   └── prometheus/      # Prometheus configuration
├── docs/                # Documentation
│   ├── adr/             # Architecture Decision Records
│   └── api/             # API documentation
├── scripts/             # Utility scripts
└── Makefile             # Common tasks
```

## Data Flow

### Request Flow

1. **Client Request**: User makes HTTPS request to `https://test.example.com`
2. **Traefik**: Terminates TLS, routes based on path:
   - `/api/*` → Backend service
   - `/*` → Frontend service
3. **Backend Processing** (for API requests):
   - FastAPI receives request
   - Validates request with Pydantic
   - Checks session in Redis
   - Queries database via PgBouncer
   - Returns JSON response
4. **Frontend Processing** (for page requests):
   - Next.js Server Components render on server
   - Fetches data from backend API if needed
   - Returns HTML response

### Database Connection Flow

```
Backend → PgBouncer (transaction pooling) → PostgreSQL
```

PgBouncer maintains a pool of connections to PostgreSQL and assigns them to backend requests on a per-transaction basis, significantly reducing connection overhead.

## Configuration

### Environment Variables

All configuration is managed through environment variables (12-factor methodology). See `.env.example` for the complete list.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string (via PgBouncer)
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: Session encryption key
- `APP_VERSION`: Application version
- `GIT_COMMIT`: Git commit hash
- `BUILD_DATE`: Build timestamp

### Service Configuration

- **Backend**: `backend/app/config.py` (Pydantic Settings)
- **Frontend**: `frontend/next.config.js`
- **Traefik**: `infrastructure/traefik/traefik.yml`
- **Docker Compose**: `infrastructure/docker-compose.yml`

## Security

### HTTPS/TLS
- Automatic certificate provisioning via Let's Encrypt
- HTTP to HTTPS redirect enforced
- Certificates stored in `infrastructure/traefik/acme/`

### Secrets Management
- All secrets via environment variables
- No hardcoded credentials
- `.env` file gitignored
- `.env.example` provides template

### Session Management
- Opaque session tokens stored in Redis
- Tokens generated with cryptographically secure random
- Session data never exposed to client

### Container Security
- Non-root users in all containers
- Minimal base images (Alpine where possible)
- Regular security updates

## Monitoring and Observability

### Metrics
- **Backend**: Prometheus metrics at `http://backend:8000/metrics`
- **Traefik**: Prometheus metrics at `http://traefik:8080/metrics`
- **Prometheus**: Aggregates metrics at `http://localhost:9090`

### Logging
- **Backend**: JSON structured logging to stdout
- **Frontend**: Next.js logs to stdout
- **Traefik**: Access logs in JSON format

### Health Checks
- **Backend**: `/api/v1/health` endpoint
- **PostgreSQL**: Docker health check
- **Redis**: Docker health check

## Development Workflow

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development guidelines.

Quick start:
```bash
# Initialize project
make init

# Start services
make up

# Run migrations
make migrate

# Run tests
make test

# Stop services
make down
```

## API Documentation

The backend automatically generates OpenAPI documentation:
- **Swagger UI**: `https://test.example.com/api/docs`
- **ReDoc**: `https://test.example.com/api/redoc`
- **OpenAPI JSON**: `https://test.example.com/api/openapi.json`

See [api/README.md](./api/README.md) for more details.

## Architecture Decision Records

Key architectural decisions are documented in ADRs:
- [ADR-0001: Use FastAPI for Backend](./adr/0001-use-fastapi-for-backend.md)
- [ADR-0002: Use Next.js App Router](./adr/0002-use-nextjs-app-router.md)
- [ADR-0003: Use PgBouncer Transaction Mode](./adr/0003-use-pgbouncer-transaction-mode.md)
- [ADR-0004: Use Traefik for Ingress](./adr/0004-use-traefik-for-ingress.md)

## Deployment

### Prerequisites
- Docker and Docker Compose
- Domain name pointing to server
- Ports 80 and 443 available

### Production Deployment
1. Clone repository to server
2. Copy `.env.example` to `.env` and configure
3. Run `make init` to initialize
4. Run `make up` to start services
5. Verify services are healthy
6. Traefik will automatically provision HTTPS certificates

### Backup and Recovery
- Database backups: `./scripts/backup-db.sh`
- Volume backups: Docker volume backup strategy
- Configuration: `.env` file backup

## Troubleshooting

### Services won't start
- Check Docker logs: `docker compose logs [service]`
- Verify environment variables in `.env`
- Ensure ports 80, 443 are available

### HTTPS certificate issues
- Verify domain DNS points to server
- Check Traefik logs: `docker compose logs traefik`
- Ensure port 80 accessible for ACME challenge

### Database connection issues
- Check PgBouncer logs: `docker compose logs pgbouncer`
- Verify DATABASE_URL in backend configuration
- Check PostgreSQL is healthy: `docker compose ps postgres`

### Performance issues
- Monitor Prometheus metrics at `http://localhost:9090`
- Check PgBouncer pool size in `infrastructure/postgres/pgbouncer.ini`
- Review backend logs for slow queries

## Further Reading

- [Contributing Guidelines](./CONTRIBUTING.md)
- [API Documentation](./api/README.md)
- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
