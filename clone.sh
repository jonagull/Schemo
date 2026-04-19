#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error()   { echo -e "${RED}✗${NC} $1"; }
print_info()    { echo -e "${BLUE}ℹ${NC} $1"; }

SOURCE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -z "$1" ]; then
    echo "Usage: ./clone.sh <destination>"
    echo "  ./clone.sh ~/code/myapp"
    echo "  ./clone.sh myapp              (creates in current directory)"
    exit 1
fi

# Resolve destination to absolute path
DEST="$(mkdir -p "$1" && cd "$1" && pwd)"

if [ "$DEST" = "$SOURCE" ]; then
    print_error "Destination cannot be the same as the source."
    exit 1
fi

print_info "Copying template to $DEST ..."

rsync -a \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.turbo' \
    --exclude='BackendApi/bin' \
    --exclude='BackendApi/obj' \
    --exclude='project.env' \
    --exclude='web/.env.local' \
    "$SOURCE/" "$DEST/"

print_success "Files copied"

cd "$DEST"

# Derive names from folder
SLUG=$(basename "$DEST" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/-*$//')
TITLE=$(basename "$DEST" | tr '-_' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')

# package.json name
sed -i '' "s/\"name\": \"web\"/\"name\": \"$SLUG\"/" web/package.json

# App title in layout.tsx
sed -i '' "s/title: 'App'/title: '$TITLE'/" web/src/app/layout.tsx
sed -i '' "s/description: 'App'/description: '$TITLE'/" web/src/app/layout.tsx

# JWT issuer/audience in appsettings.json
sed -i '' "s/\"Issuer\": \"BackendApi\"/\"Issuer\": \"$SLUG\"/" BackendApi/appsettings.json
sed -i '' "s/\"Audience\": \"BackendApiClients\"/\"Audience\": \"${SLUG}-clients\"/" BackendApi/appsettings.json

print_success "Project renamed to '$TITLE'"

git init -q
git add -A
git commit -q -m "Initial commit: $TITLE"
print_success "Git repo initialized"

echo ""
exec ./setup.sh
