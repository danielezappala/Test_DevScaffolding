# eno_inventory Backend

FastAPI backend service for eno_inventory.

## Features

- **FastAPI** - Modern, fast web framework for building APIs
- **Pydantic v2** - Data validation using Python type annotations
- **SQLAlchemy** - Async ORM for PostgreSQL
- **Alembic** - Database migration tool
- **Redis** - Session storage with opaque tokens
- **Prometheus** - Metrics and monitoring
- **JSON Logging** - Structured logging for production

## Prerequisites

- Python 3.12 or higher
- PostgreSQL 17
- Redis
- pip

## Development Setup

### Local Development (without Docker)

1. **Create and activate virtual environment:**

   ```bash
   # Run setup script
   ./setup.sh
   
   # Or manually:
   python3 -m venv venv
   source venv/bin/activate  # On Linux/macOS
   # venv\Scripts\activate   # On Windows
   
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

2. **Set environment variables:**

   ```bash
   cp ../.env.example ../.env
   # Edit .env with your configuration
   ```

3. **Run database migrations:**

   ```bash
   alembic upgrade head
   ```

4. **Run development server:**

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access the API:**

   - API Documentation: http://localhost:8000/api/docs
   - ReDoc: http://localhost:8000/api/redoc
   - Health Check: http://localhost:8000/health
   - Version: http://localhost:8000/api/v1/version
   - Metrics: http://localhost:8000/metrics

   When running behind Traefik with a subpath, set `ROOT_PATH=/inventory` and use:
   - API Documentation: https://test.example.com/inventory/api/docs
   - ReDoc: https://test.example.com/inventory/api/redoc
   - Health Check: https://test.example.com/inventory/api/v1/health
   - Version: https://test.example.com/inventory/api/v1/version

### Docker Development

```bash
# From project root
docker compose up -d backend
```

## Testing

### Run all tests

```bash
pytest
```

### Run with coverage

```bash
pytest --cov=app --cov-report=html
```

### Run specific test types

```bash
# Unit tests only
pytest -m unit

# Integration tests only
pytest -m integration
```

## Code Quality

### Linting

```bash
# Check code style
ruff check .

# Auto-fix issues
ruff check --fix .
```

### Type Checking

```bash
mypy .
```

### Formatting

```bash
# Format code
black .

# Or use ruff
ruff format .
```

## Database Migrations

### Create a new migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations

```bash
alembic upgrade head
```

### Rollback migration

```bash
alembic downgrade -1
```

### View migration history

```bash
alembic history
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application factory
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database setup
│   ├── api/
│   │   ├── deps.py          # API dependencies
│   │   └── v1/
│   │       ├── router.py    # API v1 router
│   │       └── endpoints/   # API endpoints
│   ├── core/
│   │   ├── logging.py       # JSON logging setup
│   │   ├── metrics.py       # Prometheus metrics
│   │   └── session.py       # Redis session management
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   └── migrations/          # Alembic migrations
├── tests/                   # Test suite
├── Dockerfile
├── requirements.txt
├── requirements-dev.txt
├── pyproject.toml
└── README.md
```

## Environment Variables

See `../.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - Secret key for session signing
- `APP_VERSION` - Application version
- `GIT_COMMIT` - Git commit hash
- `BUILD_DATE` - Build timestamp
- `ROOT_PATH` - Base path for reverse proxies (e.g. `/inventory` when using Traefik subpath routing)

## API Documentation

The API is automatically documented using OpenAPI/Swagger:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

## Monitoring

### Metrics

Prometheus metrics are exposed at `/metrics`:

```bash
curl http://localhost:8000/metrics
```

Key metrics:
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration histogram
- `http_requests_in_progress` - Current in-progress requests
- `active_sessions_total` - Number of active sessions

### Logging

Logs are output in JSON format for easy parsing:

```json
{
  "timestamp": "2024-01-01T12:00:00",
  "level": "INFO",
  "logger": "app.http",
  "message": "GET /api/v1/version 200",
  "request_id": "req_1234567890",
  "method": "GET",
  "path": "/api/v1/version",
  "status_code": 200,
  "duration_ms": 12.34
}
```

## Deactivating Virtual Environment

When you're done working:

```bash
deactivate
```

## License

MIT
