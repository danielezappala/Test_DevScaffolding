.PHONY: init init-local up down migrate migrate-local test test-local lint lint-local release clean help

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)test-devscaffolding - Available targets:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

init: ## Initialize project for Docker (copy .env, build images)
	@echo "$(BLUE)Initializing project for Docker...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)Created .env file from .env.example$(NC)"; \
		echo "$(YELLOW)Please edit .env with your configuration before running 'make up'$(NC)"; \
	else \
		echo "$(YELLOW).env file already exists, skipping...$(NC)"; \
	fi
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env --env-file .env build
	@echo "$(GREEN)Initialization complete!$(NC)"

init-local: ## Initialize project for local development (setup venv, install deps)
	@echo "$(BLUE)Initializing project for local development...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)Created .env file from .env.example$(NC)"; \
		echo "$(YELLOW)Please edit .env with your configuration$(NC)"; \
	else \
		echo "$(YELLOW).env file already exists, skipping...$(NC)"; \
	fi
	@echo "$(BLUE)Setting up backend virtual environment...$(NC)"
	cd backend && ./setup.sh
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)Local development setup complete!$(NC)"
	@echo "$(YELLOW)Backend: cd backend && source venv/bin/activate$(NC)"
	@echo "$(YELLOW)Frontend: cd frontend && npm run dev$(NC)"

up: ## Start all services with Docker Compose
	@echo "$(BLUE)Starting services...$(NC)"
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env --env-file .env up -d
	@echo "$(GREEN)Services started!$(NC)"
	@BASE_PATH=$$(grep '^BASE_PATH=' .env | cut -d '=' -f2 | tr -d '"' | tr -d "'"); \
	echo "$(BLUE)Frontend:$(NC) http://localhost$$BASE_PATH"; \
	echo "$(BLUE)Backend API:$(NC)  http://localhost$$BASE_PATH/api/v1"; \
	echo "$(BLUE)API Docs:$(NC)  http://localhost$$BASE_PATH/api/docs"; \
	echo "$(BLUE)Traefik Dashboard:$(NC)  http://localhost:8080"

down: ## Stop all services
	@echo "$(BLUE)Stopping services...$(NC)"
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env --env-file .env down
	@echo "$(GREEN)Services stopped!$(NC)"

migrate: ## Run database migrations (Docker)
	@echo "$(BLUE)Running database migrations...$(NC)"
	docker compose -f infrastructure/docker-compose.yml --env-file .env exec -e DATABASE_URL="$$(grep '^POSTGRES_URL=' .env | cut -d '=' -f2- | sed 's/postgresql:/postgresql+asyncpg:/')" backend alembic upgrade head
	@echo "$(GREEN)Migrations complete!$(NC)"

migrate-local: ## Run database migrations (local)
	@echo "$(BLUE)Running database migrations locally...$(NC)"
	cd backend && source venv/bin/activate && alembic upgrade head
	@echo "$(GREEN)Migrations complete!$(NC)"

test: ## Run all tests (Docker)
	@echo "$(BLUE)Running backend tests...$(NC)"
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env exec backend pytest
	@echo "$(BLUE)Running frontend tests...$(NC)"
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env exec frontend npm run test
	@echo "$(GREEN)All tests complete!$(NC)"

test-local: ## Run all tests (local)
	@echo "$(BLUE)Running backend tests locally...$(NC)"
	cd backend && source venv/bin/activate && pytest
	@echo "$(BLUE)Running frontend tests locally...$(NC)"
	cd frontend && npm run test
	@echo "$(GREEN)All tests complete!$(NC)"

lint: ## Run code quality checks (Docker)
	@echo "$(BLUE)Running backend linting...$(NC)"
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env exec backend ruff check .
	@echo "$(BLUE)Running backend type checking...$(NC)"
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env exec backend mypy .
	@echo "$(BLUE)Running frontend linting...$(NC)"
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env exec frontend npm run lint
	@echo "$(GREEN)Linting complete!$(NC)"

lint-local: ## Run code quality checks (local)
	@echo "$(BLUE)Running backend linting locally...$(NC)"
	cd backend && source venv/bin/activate && ruff check . && mypy .
	@echo "$(BLUE)Running frontend linting locally...$(NC)"
	cd frontend && npm run lint
	@echo "$(GREEN)Linting complete!$(NC)"

release: ## Create a new versioned release
	@echo "$(BLUE)Creating release...$(NC)"
	@./scripts/release.sh
	@echo "$(GREEN)Release complete!$(NC)"

clean: ## Clean up containers, volumes, and build artifacts
	@echo "$(BLUE)Cleaning up...$(NC)"
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env down -v
	@echo "$(YELLOW)Removing build artifacts...$(NC)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)Cleanup complete!$(NC)"

logs: ## Show logs from all services
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env logs -f

logs-backend: ## Show backend logs
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env logs -f backend

logs-frontend: ## Show frontend logs
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env logs -f frontend

ps: ## Show running services
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env ps

restart: ## Restart all services
	@echo "$(BLUE)Restarting services...$(NC)"
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env restart
	@echo "$(GREEN)Services restarted!$(NC)"

shell-backend: ## Open shell in backend container
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env exec backend /bin/bash

shell-frontend: ## Open shell in frontend container
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env exec frontend /bin/sh

db-shell: ## Open PostgreSQL shell
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env exec postgres psql -U postgres -d test-devscaffolding

redis-cli: ## Open Redis CLI
	docker compose -f infrastructure/docker-compose.yml --env-file .env --env-file .env exec redis redis-cli
