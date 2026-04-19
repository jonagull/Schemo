#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error()   { echo -e "${RED}✗${NC} $1"; }
print_info()    { echo -e "${BLUE}ℹ${NC} $1"; }
print_header()  {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

command_exists() { command -v "$1" >/dev/null 2>&1; }

port_in_use() { lsof -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

find_free_port() {
    local port=$1
    while port_in_use "$port"; do
        port=$((port + 1))
    done
    echo "$port"
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# ── Auto-configure project.env ────────────────────────────────
# Derive the expected project name from the actual folder name
FOLDER_NAME=$(basename "$PROJECT_ROOT" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '_' | sed 's/_*$//')

configure_project() {
    print_info "Detecting free ports..."
    PROJECT_NAME=$FOLDER_NAME
    DB_PORT=$(find_free_port 5555)
    BACKEND_PORT=$(find_free_port 5157)
    FRONTEND_PORT=$(find_free_port 3000)

    cat > "$PROJECT_ROOT/project.env" <<EOF
PROJECT_NAME=$PROJECT_NAME
DB_PORT=$DB_PORT
BACKEND_PORT=$BACKEND_PORT
FRONTEND_PORT=$FRONTEND_PORT
EOF

    print_success "Project name:  $PROJECT_NAME"
    print_success "DB port:       $DB_PORT"
    print_success "Backend port:  $BACKEND_PORT"
    print_success "Frontend port: $FRONTEND_PORT"
}

if [ ! -f "$PROJECT_ROOT/project.env" ]; then
    print_header "First-time Setup — Auto-configuring"
    configure_project
else
    set -a; source "$PROJECT_ROOT/project.env"; set +a

    # If the saved project name doesn't match the folder, this was copied
    # from another project — reconfigure everything from scratch
    if [ "$PROJECT_NAME" != "$FOLDER_NAME" ]; then
        print_header "Copied project detected — Reconfiguring"
        print_warning "Folder is '$FOLDER_NAME' but project.env says '$PROJECT_NAME' — re-detecting ports"
        configure_project
    else
        print_header "Setup — $PROJECT_NAME"
        print_info "DB port:       $DB_PORT"
        print_info "Backend port:  $BACKEND_PORT"
        print_info "Frontend port: $FRONTEND_PORT"
    fi
fi

# ── Prerequisites ─────────────────────────────────────────────
print_header "Checking Prerequisites"
MISSING_DEPS=0

if command_exists docker; then
    print_success "Docker: $(docker --version)"
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is installed but not running. Please start Docker Desktop."
        MISSING_DEPS=1
    else
        print_success "Docker is running"
    fi
else
    print_error "Docker not installed — https://www.docker.com/products/docker-desktop"
    MISSING_DEPS=1
fi

if command_exists node; then
    NODE_MAJOR=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_success "Node.js: $(node --version)"
    else
        print_error "Node.js too old: $(node --version) (need >= 18)"
        MISSING_DEPS=1
    fi
else
    print_error "Node.js not installed — https://nodejs.org/"
    MISSING_DEPS=1
fi

if command_exists dotnet; then
    DOTNET_MAJOR=$(dotnet --version | cut -d'.' -f1)
    if [ "$DOTNET_MAJOR" -ge 9 ]; then
        print_success ".NET SDK: $(dotnet --version)"
    else
        print_error ".NET SDK too old: $(dotnet --version) (need >= 9.0)"
        MISSING_DEPS=1
    fi
else
    print_error ".NET SDK not installed — https://dotnet.microsoft.com/download/dotnet/8.0"
    MISSING_DEPS=1
fi

if command_exists pnpm; then
    PNPM_MAJOR=$(pnpm --version | cut -d'.' -f1)
    if [ "$PNPM_MAJOR" -ge 8 ]; then
        print_success "pnpm: $(pnpm --version)"
    else
        print_warning "pnpm might be old — updating..."
        npm install -g pnpm@latest
    fi
else
    print_info "pnpm not found — installing..."
    npm install -g pnpm@latest
    command_exists pnpm || { print_error "Failed to install pnpm"; MISSING_DEPS=1; }
fi

[ $MISSING_DEPS -eq 1 ] && { print_error "Fix missing dependencies then re-run."; exit 1; }
print_success "All prerequisites met"

# ── Frontend dependencies ─────────────────────────────────────
print_header "Installing Frontend Dependencies"
cd "$PROJECT_ROOT/web"
pnpm install || { print_error "pnpm install failed"; exit 1; }
print_success "Frontend dependencies installed"

echo "NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT" > "$PROJECT_ROOT/web/.env.local"
print_success "Wrote web/.env.local"

# ── Database ──────────────────────────────────────────────────
print_header "Starting Database"
cd "$PROJECT_ROOT/BackendApi"
COMPOSE_PROJECT_NAME=$PROJECT_NAME PROJECT_NAME=$PROJECT_NAME DB_PORT=$DB_PORT \
    docker-compose up -d || { print_error "Failed to start DB container"; exit 1; }
print_success "DB container started (${PROJECT_NAME}_postgres on :$DB_PORT)"

print_info "Waiting for database to be ready..."
ATTEMPT=0
while [ $ATTEMPT -lt 30 ]; do
    docker exec "${PROJECT_NAME}_postgres" pg_isready -U backendapi_user >/dev/null 2>&1 && break
    ATTEMPT=$((ATTEMPT + 1)); echo -n "."; sleep 1
done
echo
[ $ATTEMPT -eq 30 ] && { print_error "Database failed to start in time"; exit 1; }
print_success "Database is ready"

# ── Migrations ────────────────────────────────────────────────
print_header "Running Migrations"
dotnet restore || { print_error "dotnet restore failed"; exit 1; }
ConnectionStrings__DefaultConnection="Host=localhost;Port=${DB_PORT};Database=backendapi_db;Username=backendapi_user;Password=backendapi_password" \
    dotnet ef database update || { print_error "Migrations failed"; exit 1; }
print_success "Migrations applied"

# ── Tmuxinator config ─────────────────────────────────────────
DB_CONN="Host=localhost;Port=${DB_PORT};Database=backendapi_db;Username=backendapi_user;Password=backendapi_password"
TMUX_DIR="$HOME/.config/tmuxinator"
mkdir -p "$TMUX_DIR"
cat > "$TMUX_DIR/${PROJECT_NAME}.yml" <<EOF
name: ${PROJECT_NAME}
root: ${PROJECT_ROOT}

pre: cd ${PROJECT_ROOT}/BackendApi && COMPOSE_PROJECT_NAME=${PROJECT_NAME} PROJECT_NAME=${PROJECT_NAME} DB_PORT=${DB_PORT} docker-compose up -d

windows:
  - backend:
      root: ${PROJECT_ROOT}/BackendApi
      panes:
        - ASPNETCORE_URLS=http://localhost:${BACKEND_PORT} ConnectionStrings__DefaultConnection="${DB_CONN}" Cors__AllowedOrigin="http://localhost:${FRONTEND_PORT}" dotnet run --no-launch-profile
  - frontend:
      root: ${PROJECT_ROOT}/web
      panes:
        - PORT=${FRONTEND_PORT} pnpm dev
  - shell:
      root: ${PROJECT_ROOT}
      panes:
        - ''
EOF
print_success "Tmuxinator config: ~/.config/tmuxinator/${PROJECT_NAME}.yml"
print_info "  Start later with: tmuxinator start ${PROJECT_NAME}"

# ── Start services ────────────────────────────────────────────
cd "$PROJECT_ROOT"
print_header "Starting Services"
print_info "Backend:  http://localhost:$BACKEND_PORT"
print_info "Frontend: http://localhost:$FRONTEND_PORT"
print_info "Swagger:  http://localhost:$BACKEND_PORT/swagger"
print_info "\nPress Ctrl+C to stop\n"

cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

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
