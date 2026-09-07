#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Change directory to the repository root where this script resides
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Checking git status in $REPO_DIR...${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed or not in PATH.${NC}"
    exit 1
fi

# Detect current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")

# Commit message (argument or prompt/default)
COMMIT_MSG="$*"
if [ -z "$COMMIT_MSG" ]; then
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    COMMIT_MSG="Update website: $TIMESTAMP"
fi

# Stage all changes
echo -e "${YELLOW}📦 Staging changes...${NC}"
git add .

# Check if there is anything to commit
if git diff --staged --quiet; then
    echo -e "${YELLOW}ℹ️  No changes to commit.${NC}"
else
    echo -e "${YELLOW}💾 Committing changes: \"$COMMIT_MSG\"...${NC}"
    git commit -m "$COMMIT_MSG"
fi

# Push to remote
echo -e "${YELLOW}🚀 Pushing to origin/$BRANCH...${NC}"
git push origin "$BRANCH"

echo -e "${GREEN}✅ Successfully pushed to GitHub ($BRANCH)!${NC}"
