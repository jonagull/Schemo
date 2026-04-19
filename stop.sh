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

if [ ! -f "$PROJECT_ROOT/project.env" ]; then
    print_error "project.env not found. Nothing to stop."
    exit 1
fi
set -a; source "$PROJECT_ROOT/project.env"; set +a

print_header "Stopping $PROJECT_NAME"

# Kill whatever is listening on the backend and frontend ports
kill_port() {
    local port=$1
    local label=$2
    local pids
    pids=$(lsof -ti TCP:"$port" -sTCP:LISTEN 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill 2>/dev/null
        print_success "$label stopped (port $port)"
    else
        print_info "$label was not running (port $port)"
    fi
}

kill_port "$BACKEND_PORT"  "Backend"
kill_port "$FRONTEND_PORT" "Frontend"

# Stop the DB container (keep the volume so data is preserved)
cd "$PROJECT_ROOT/BackendApi"
if docker ps --format '{{.Names}}' | grep -q "^${PROJECT_NAME}_postgres$"; then
    COMPOSE_PROJECT_NAME=$PROJECT_NAME PROJECT_NAME=$PROJECT_NAME DB_PORT=$DB_PORT \
        docker-compose stop
    print_success "Database stopped"
else
    print_info "Database was not running"
fi

print_success "Done"
