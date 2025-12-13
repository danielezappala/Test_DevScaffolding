#!/bin/bash
set -e

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Initializing database for eno_inventory...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo -e "${YELLOW}Please run 'make init' first${NC}"
    exit 1
fi

# Load environment variables
source .env

# Check if database service is running
if ! docker compose ps postgres | grep -q "Up"; then
    echo -e "${YELLOW}Database service is not running. Starting it now...${NC}"
    docker compose up -d postgres
    echo -e "${BLUE}Waiting for database to be ready...${NC}"
    sleep 5
fi

# Wait for PostgreSQL to be ready
echo -e "${BLUE}Checking database connection...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}Database is ready!${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}Waiting for database... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}Error: Database failed to start${NC}"
    exit 1
fi

# Create database if it doesn't exist
echo -e "${BLUE}Ensuring database exists...${NC}"
docker compose exec -T postgres psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'eno_inventory_db'" | grep -q 1 || \
    docker compose exec -T postgres psql -U postgres -c "CREATE DATABASE eno_inventory_db"

echo -e "${GREEN}Database 'eno_inventory_db' is ready!${NC}"

# Run migrations
echo -e "${BLUE}Running database migrations...${NC}"
docker compose exec backend alembic upgrade head

echo -e "${GREEN}Database initialization complete!${NC}"
echo -e "${BLUE}You can now start the application with 'make up'${NC}"
