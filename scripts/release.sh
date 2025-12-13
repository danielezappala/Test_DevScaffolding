#!/bin/bash
set -e

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}eno_inventory Release Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if git is available
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}Error: You have uncommitted changes${NC}"
    echo -e "${YELLOW}Please commit or stash your changes before creating a release${NC}"
    exit 1
fi

# Get current version from VERSION file
if [ -f VERSION ]; then
    CURRENT_VERSION=$(cat VERSION)
    echo -e "${BLUE}Current version: ${CURRENT_VERSION}${NC}"
else
    CURRENT_VERSION="0.0.0"
    echo -e "${YELLOW}No VERSION file found, starting from ${CURRENT_VERSION}${NC}"
fi

# Parse current version
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Calculate next versions
NEXT_MAJOR="$((MAJOR + 1)).0.0"
NEXT_MINOR="${MAJOR}.$((MINOR + 1)).0"
NEXT_PATCH="${MAJOR}.${MINOR}.$((PATCH + 1))"

echo ""
echo -e "${BLUE}Select release type:${NC}"
echo -e "  ${GREEN}1)${NC} Major release (${NEXT_MAJOR}) - Breaking changes"
echo -e "  ${GREEN}2)${NC} Minor release (${NEXT_MINOR}) - New features, backwards compatible"
echo -e "  ${GREEN}3)${NC} Patch release (${NEXT_PATCH}) - Bug fixes"
echo -e "  ${GREEN}4)${NC} Custom version"
echo -e "  ${GREEN}5)${NC} Cancel"
echo ""

read -p "Enter choice [1-5]: " CHOICE

case $CHOICE in
    1)
        NEW_VERSION=$NEXT_MAJOR
        RELEASE_TYPE="major"
        ;;
    2)
        NEW_VERSION=$NEXT_MINOR
        RELEASE_TYPE="minor"
        ;;
    3)
        NEW_VERSION=$NEXT_PATCH
        RELEASE_TYPE="patch"
        ;;
    4)
        read -p "Enter custom version (e.g., 1.2.3): " NEW_VERSION
        # Validate semantic version format
        if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo -e "${RED}Error: Invalid version format. Must be X.Y.Z${NC}"
            exit 1
        fi
        RELEASE_TYPE="custom"
        ;;
    5)
        echo -e "${YELLOW}Release cancelled${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Creating ${RELEASE_TYPE} release: ${NEW_VERSION}${NC}"
echo ""

# Confirm release
read -p "Continue with release v${NEW_VERSION}? [y/N]: " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Release cancelled${NC}"
    exit 0
fi

# Update VERSION file
echo -e "${BLUE}Updating VERSION file...${NC}"
echo "$NEW_VERSION" > VERSION

# Get git commit hash
GIT_COMMIT=$(git rev-parse --short HEAD)

# Get build date
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Update .env.example with new version
if [ -f .env.example ]; then
    echo -e "${BLUE}Updating .env.example...${NC}"
    sed -i.bak "s/APP_VERSION=.*/APP_VERSION=${NEW_VERSION}/" .env.example
    rm -f .env.example.bak
fi

# Commit version changes
echo -e "${BLUE}Committing version changes...${NC}"
git add VERSION
if [ -f .env.example ]; then
    git add .env.example
fi
git commit -m "chore: bump version to ${NEW_VERSION}"

# Create git tag
echo -e "${BLUE}Creating git tag v${NEW_VERSION}...${NC}"
git tag -a "v${NEW_VERSION}" -m "Release version ${NEW_VERSION}"

echo ""
echo -e "${GREEN}Release v${NEW_VERSION} created successfully!${NC}"
echo ""
echo -e "${BLUE}Release Information:${NC}"
echo -e "  Version:    ${NEW_VERSION}"
echo -e "  Commit:     ${GIT_COMMIT}"
echo -e "  Build Date: ${BUILD_DATE}"
echo -e "  Tag:        v${NEW_VERSION}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Review the changes: git show v${NEW_VERSION}"
echo -e "  2. Push the changes:   git push origin main"
echo -e "  3. Push the tag:       git push origin v${NEW_VERSION}"
echo ""
echo -e "${BLUE}To build Docker images with this version:${NC}"
echo -e "  docker compose build --build-arg APP_VERSION=${NEW_VERSION} --build-arg GIT_COMMIT=${GIT_COMMIT} --build-arg BUILD_DATE=${BUILD_DATE}"
echo ""
echo -e "${YELLOW}To undo this release (before pushing):${NC}"
echo -e "  git tag -d v${NEW_VERSION}"
echo -e "  git reset --hard HEAD~1"
