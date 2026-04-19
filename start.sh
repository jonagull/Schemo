#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error()   { echo -e "${RED}✗${NC} $1"; }
print_info()    { echo -e "${BLUE}ℹ${NC} $1"; }
print_header()  {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# ── Load config (must have been created by setup.sh) ─────────
if [ ! -f "$PROJECT_ROOT/project.env" ]; then
    print_error "project.env not found. Run ./setup.sh first."
    exit 1
fi
set -a; source "$PROJECT_ROOT/project.env"; set +a

print_header "Starting $PROJECT_NAME"
print_info "Backend:  http://localhost:$BACKEND_PORT"
print_info "Frontend: http://localhost:$FRONTEND_PORT"
print_info "Swagger:  http://localhost:$BACKEND_PORT/swagger"

# ── Checks ────────────────────────────────────────────────────
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

if [ ! -d "$PROJECT_ROOT/web/node_modules" ]; then
    print_error "Frontend dependencies missing. Run ./setup.sh first."
    exit 1
fi

# Keep .env.local in sync
echo "NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT" > "$PROJECT_ROOT/web/.env.local"

# ── Database ──────────────────────────────────────────────────
print_header "Starting Database"
cd "$PROJECT_ROOT/BackendApi"
COMPOSE_PROJECT_NAME=$PROJECT_NAME PROJECT_NAME=$PROJECT_NAME DB_PORT=$DB_PORT \
    docker-compose up -d || { print_error "Failed to start DB container"; exit 1; }

print_info "Waiting for database to be ready..."
ATTEMPT=0
while [ $ATTEMPT -lt 30 ]; do
    docker exec "${PROJECT_NAME}_postgres" pg_isready -U backendapi_user >/dev/null 2>&1 && break
    ATTEMPT=$((ATTEMPT + 1)); echo -n "."; sleep 1
done
echo
[ $ATTEMPT -eq 30 ] && { print_error "Database failed to start in time"; exit 1; }
print_success "Database is ready"

# ── Start services ────────────────────────────────────────────
cd "$PROJECT_ROOT"
print_info "\nPress Ctrl+C to stop\n"

cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

DB_CONN="Host=localhost;Port=${DB_PORT};Database=backendapi_db;Username=backendapi_user;Password=backendapi_password"

cd "$PROJECT_ROOT/BackendApi"
ASPNETCORE_URLS="http://localhost:$BACKEND_PORT" \
    ConnectionStrings__DefaultConnection="$DB_CONN" \
    Cors__AllowedOrigin="http://localhost:$FRONTEND_PORT" \
    dotnet run --no-launch-profile > /tmp/${PROJECT_NAME}_backend.log 2>&1 &
BACKEND_PID=$!

cd "$PROJECT_ROOT/web"
PORT=$FRONTEND_PORT pnpm dev > /tmp/${PROJECT_NAME}_frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

ps -p $BACKEND_PID  > /dev/null || { print_error "Backend failed — check /tmp/${PROJECT_NAME}_backend.log";  exit 1; }
ps -p $FRONTEND_PID > /dev/null || { print_error "Frontend failed — check /tmp/${PROJECT_NAME}_frontend.log"; exit 1; }

print_success "Everything is running!"
print_info "Logs: /tmp/${PROJECT_NAME}_backend.log  |  /tmp/${PROJECT_NAME}_frontend.log"

wait $BACKEND_PID $FRONTEND_PID
