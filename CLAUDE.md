# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Full-stack starter template: **Next.js 15 + React 19** frontend with a **.NET 9.0** backend, PostgreSQL database, and JWT authentication.

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5157` (API docs at `/scalar/v1`)

## Commands

### Setup & Running

```bash
./setup.sh     # First-time setup: installs deps, starts DB, runs migrations, starts both services
./start.sh     # Subsequent starts: starts DB and both services
```

### Frontend (run from `web/`)

```bash
pnpm dev          # Dev server with Turbopack
pnpm build        # Production build
pnpm lint         # ESLint on src/ and shared/
pnpm lint:fix     # Auto-fix lint issues
pnpm format       # Prettier format
pnpm format:check # Check formatting without writing
```

Requires Node 18+ and pnpm 8+.

### Backend (run from `BackendApi/`)

```bash
dotnet run                                    # Start API
dotnet ef migrations add <Name>               # Add a new migration
dotnet ef database update                     # Apply migrations
dotnet ef migrations remove                   # Remove last migration
```

### Database

```bash
# From BackendApi/
docker compose up -d    # Start PostgreSQL (port 5555)
docker compose down     # Stop PostgreSQL
```

## Architecture

### Frontend (`web/`)

- **`src/app/`** — Next.js App Router pages (login, register, docs, structure)
- **`src/components/`** — UI components: `forms/`, `layout/`, `ui/` (Radix UI primitives)
- **`shared/`** — Shared code used across the app:
  - `api/` — Axios clients for auth and user endpoints
  - `hooks/` — Custom React hooks (`useAuth`, `useLogin`, `useRegister`, `useLogout`, `useUser`)
  - `stores/` — Zustand auth store (`authStore`)
  - `types/` — TypeScript types and DTOs
  - `consts/` — Constants

**Path aliases:** `@/` → `src/`, `@shared` → `shared/`

**State management split:**
- Zustand (`authStore`) for client-side auth state (token expiry, user identity)
- TanStack Query for server state (data fetching, caching, invalidation)
- TanStack Form + Zod for form state and validation

**Token refresh:** The Axios client in `shared/api/` uses interceptors to detect 401 responses, queue pending requests, call `/auth/refresh`, and replay queued requests automatically.

### Backend (`BackendApi/`)

Layered architecture: **Controllers → Services → Repositories → EF Core DbContext**

- **`Configuration/`** — Extension methods for DI registration (keeps `Program.cs` clean)
- **`Controllers/`** — `AuthController`, `UserController`
- **`Services/`** — Business logic; `AuthService`, `JwtService`, `UserService`
- **`Repositories/`** — Data access layer over EF Core
- **`Entities/`** — Domain models (EF Core entities)
- **`Models/`** — DTOs: `*Rdto` (request/input), `*Sdto` (response/output)
- **`Migrations/`** — EF Core code-first migrations

**Service return convention:** Services return tuples `(bool success, T? response, string? error)` — controllers unpack these and map to HTTP responses.

**Auth tokens** are stored in HTTP-only cookies; access tokens expire in 15 minutes, refresh tokens in 7 days.
