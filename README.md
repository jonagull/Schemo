# Full-Stack Application

A modern full-stack application built with Next.js and .NET, featuring JWT authentication, PostgreSQL database, and a clean architecture.

## Quick Start

**Prerequisites:** .NET 8.0 SDK, Node.js 18+, pnpm 8+, Docker

### First Time Setup

**If this is your first time using the project**, run the setup script:

```bash
./setup.sh
```

This script will:

-   ✓ Check if Docker, Node.js, .NET SDK, and pnpm are installed
-   ✓ Install pnpm if missing
-   ✓ Install frontend dependencies
-   ✓ Start PostgreSQL database
-   ✓ Run database migrations
-   ✓ Start backend and frontend concurrently

**That's it!** Everything runs in one window. Press `Ctrl+C` to stop.

### Running the Project

**If you've already run the setup script**, use the start script to quickly run the services:

```bash
./start.sh
```

This script will:

-   ✓ Start PostgreSQL database
-   ✓ Start backend and frontend concurrently

**Note:** Use `./setup.sh` for first-time setup. Use `./start.sh` for subsequent runs.

### Option 2: Manual Setup

1. **Start the database:**

    ```bash
    cd BackendApi
    docker-compose up -d
    ```

2. **Run the backend:**

    ```bash
    cd BackendApi
    dotnet run
    ```

    API runs at `http://localhost:5157` | Swagger: `http://localhost:5157/swagger`

3. **Run the frontend:**
    ```bash
    cd web
    pnpm install
    pnpm dev
    ```
    App runs at `http://localhost:3000`

---

## Technology Stack

**Backend:** .NET 8.0, PostgreSQL 16, Entity Framework Core, JWT Authentication, BCrypt

**Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, TanStack Query, Zustand, Zod

**Infrastructure:** Docker Compose, pnpm

## Project Structure

```
├── BackendApi/              # .NET 8.0 Web API
│   ├── Configuration/       # Service configuration
│   ├── Controllers/         # API endpoints
│   ├── Data/                # DbContext
│   ├── Entities/            # Domain models
│   ├── Migrations/          # EF Core migrations
│   ├── Models/              # DTOs
│   ├── Repositories/        # Data access
│   └── Services/            # Business logic
│
└── web/                     # Next.js frontend
    ├── src/app/             # Pages
    ├── src/components/      # React components
    └── shared/              # Shared code (API, hooks, stores, types)
```

## Development Commands

### Backend

```bash
cd BackendApi
dotnet run                    # Run application
dotnet ef migrations add Name # Create migration
dotnet ef database update     # Apply migrations
```

### Frontend

```bash
cd web
pnpm dev      # Development server
pnpm build    # Production build
pnpm lint     # Run linter
```

## Database Reset

```bash
cd BackendApi
docker-compose down -v  # Drop database
rm -rf Migrations/*     # Delete migrations
docker-compose up -d    # Start fresh database
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## Configuration

**Backend:** Edit `BackendApi/appsettings.json`

-   Database: `ConnectionStrings:DefaultConnection`
-   JWT: `Jwt:SecretKey`, `Jwt:Issuer`, etc.

**Frontend:** Create `web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5157
```

## API Endpoints

-   `POST /auth/register` - Register user
-   `POST /auth/login` - Login
-   `POST /auth/refresh` - Refresh token
-   `GET /user` - Get current user
-   `PUT /user` - Update user

## Authentication

-   JWT access tokens (15 min) + refresh tokens (7 days)
-   Tokens stored in HTTP-only cookies
-   Automatic token refresh on frontend
-   BCrypt password hashing
