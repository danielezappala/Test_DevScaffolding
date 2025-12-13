#!/bin/bash
set -e

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/eno_inventory_${TIMESTAMP}.sql"
RETENTION_DAYS=30

echo -e "${BLUE}Starting database backup for eno_inventory...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo -e "${YELLOW}Please run 'make init' first${NC}"
    exit 1
fi

# Load environment variables
source .env

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Check if database service is running
if ! docker compose ps postgres | grep -q "Up"; then
    echo -e "${RED}Error: Database service is not running${NC}"
    echo -e "${YELLOW}Please start services with 'make up' first${NC}"
    exit 1
fi

# Check database connection
echo -e "${BLUE}Checking database connection...${NC}"
if ! docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to database${NC}"
    exit 1
fi

# Create backup
echo -e "${BLUE}Creating backup: ${BACKUP_FILE}${NC}"
docker compose exec -T postgres pg_dump -U postgres -d eno_inventory_db --clean --if-exists > "${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ] && [ -s "${BACKUP_FILE}" ]; then
    # Compress backup
    echo -e "${BLUE}Compressing backup...${NC}"
    gzip "${BACKUP_FILE}"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo -e "${GREEN}Backup created successfully!${NC}"
    echo -e "${BLUE}File: ${BACKUP_FILE}${NC}"
    echo -e "${BLUE}Size: ${BACKUP_SIZE}${NC}"
else
    echo -e "${RED}Error: Backup failed${NC}"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# Clean up old backups
echo -e "${BLUE}Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
find "${BACKUP_DIR}" -name "eno_inventory_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
DELETED_COUNT=$(find "${BACKUP_DIR}" -name "eno_inventory_*.sql.gz" -type f -mtime +${RETENTION_DAYS} | wc -l)

if [ ${DELETED_COUNT} -gt 0 ]; then
    echo -e "${YELLOW}Deleted ${DELETED_COUNT} old backup(s)${NC}"
fi

# Show backup statistics
TOTAL_BACKUPS=$(find "${BACKUP_DIR}" -name "eno_inventory_*.sql.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)

echo -e "${GREEN}Backup complete!${NC}"
echo -e "${BLUE}Total backups: ${TOTAL_BACKUPS}${NC}"
echo -e "${BLUE}Total size: ${TOTAL_SIZE}${NC}"

# Restore instructions
echo -e ""
echo -e "${YELLOW}To restore this backup, run:${NC}"
echo -e "  gunzip -c ${BACKUP_FILE} | docker compose exec -T postgres psql -U postgres -d eno_inventory_db"
