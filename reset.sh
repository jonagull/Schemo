#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error()   { echo -e "${RED}✗${NC} $1"; }
print_info()    { echo -e "${BLUE}ℹ${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_header()  {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "$PROJECT_ROOT/project.env" ]; then
    print_error "project.env not found. Run ./setup.sh first."
    exit 1
fi
set -a; source "$PROJECT_ROOT/project.env"; set +a

print_header "Reset $PROJECT_NAME"
print_warning "This will wipe the database and re-run migrations. All data will be lost."
echo -n "Are you sure? (y/N) "
read -r CONFIRM
[[ "$CONFIRM" =~ ^[Yy]$ ]] || { print_info "Aborted."; exit 0; }

# ── Stop running services ─────────────────────────────────────
print_header "Stopping Services"

kill_port() {
    local port=$1
    local label=$2
    local pids
    pids=$(lsof -ti TCP:"$port" -sTCP:LISTEN 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill 2>/dev/null
        print_success "$label stopped"
    fi
}

kill_port "$BACKEND_PORT"  "Backend"
kill_port "$FRONTEND_PORT" "Frontend"

# ── Wipe DB container + volume ────────────────────────────────
print_header "Wiping Database"
cd "$PROJECT_ROOT/BackendApi"
COMPOSE_PROJECT_NAME=$PROJECT_NAME PROJECT_NAME=$PROJECT_NAME DB_PORT=$DB_PORT \
    docker-compose down -v || { print_error "Failed to remove DB container/volume"; exit 1; }
print_success "Database container and volume removed"

# ── Fresh DB ──────────────────────────────────────────────────
print_header "Starting Fresh Database"
COMPOSE_PROJECT_NAME=$PROJECT_NAME PROJECT_NAME=$PROJECT_NAME DB_PORT=$DB_PORT \
    docker-compose up -d || { print_error "Failed to start DB container"; exit 1; }

print_info "Waiting for database to be ready..."
ATTEMPT=0
while [ $ATTEMPT -lt 30 ]; do
    docker exec "${PROJECT_NAME}_postgres" pg_isready -U backendapi_user >/dev/null 2>&1 && break
    ATTEMPT=$((ATTEMPT + 1)); echo -n "."; sleep 1
done
echo
[ $ATTEMPT -eq 30 ] && { print_error "Database failed to start"; exit 1; }
print_success "Database is ready"

# ── Re-run migrations ─────────────────────────────────────────
print_header "Running Migrations"
ConnectionStrings__DefaultConnection="Host=localhost;Port=${DB_PORT};Database=backendapi_db;Username=backendapi_user;Password=backendapi_password" \
    dotnet ef database update || { print_error "Migrations failed"; exit 1; }
print_success "Migrations applied"

print_success "Reset complete — run ./start.sh to start the project"
