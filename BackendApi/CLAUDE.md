# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

Layered architecture: **Controllers → Services → Repositories → EF Core**

- `Controllers/` — HTTP layer only. Unpack service results, map to `ApiResponse<T>`, return HTTP status.
- `Services/` — All business logic lives here.
- `Repositories/` — Data access via generic `Repository<T>`. Each entity gets its own typed repo (e.g. `UserRepository`).
- `Entities/` — EF Core models. Guid PKs, `CreatedAt`/`UpdatedAt` timestamps.
- `Models/` — DTOs for API surface. Never expose entities directly.
- `Configuration/` — DI registration split into extension methods. `Program.cs` just calls them.
- `Data/` — `ApplicationDbContext` with model configuration in `OnModelCreating`.

## Key Conventions

**DTO naming:**
- `*Rdto` — incoming request data (e.g. `LoginRdto`, `UpdateUserRdto`)
- `*Sdto` — outgoing response data (e.g. `AuthSdto`, `UserSdto`)

**All endpoints return `ApiResponse<T>`:**
```csharp
public class ApiResponse<T> {
    public bool Success { get; set; }
    public ApiResponseStatusCode StatusCode { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public DateTime Timestamp { get; set; }
}
```

**Service return convention** — services return tuples, never throw to controllers:
```csharp
(bool success, T? response, string? error)
```
Controllers unpack and map to the appropriate `ApiResponse<T>`.

**Authentication:**
- `ClientType` enum (`Web` / `Mobile`) on every auth request determines token delivery:
  - `Web`: tokens in httpOnly cookies, only `expiresAt` in response body
  - `Mobile`: full tokens in response body
- Extend `BaseAuthenticatedController` for any authenticated endpoint — use `GetUserId()` to extract the current user's Guid from claims.

**Repository pattern:**
- `Repository<T>` calls `SaveChangesAsync()` immediately on every write — no unit-of-work pattern.
- Add entity-specific query methods to the typed repo (e.g. `GetByEmailAsync` on `UserRepository`).

**Adding a new feature checklist:**
1. Add entity to `Entities/`, register `DbSet` in `ApplicationDbContext`, add model config in `OnModelCreating`
2. Run `dotnet ef migrations add <Name>` and `dotnet ef database update`
3. Add `*Rdto`/`*Sdto` to `Models/`
4. Create typed repository in `Repositories/`, register in `DependencyInjectionConfiguration`
5. Create service with interface in `Services/`, register in `DependencyInjectionConfiguration`
6. Add controller extending `ControllerBase` (or `BaseAuthenticatedController` if auth required)

**JSON:** All responses use camelCase (configured globally). Enums serialize as strings.

**CORS:** Allows `localhost:3000–3006` with credentials. Add new origins in `CorsConfiguration.cs`.
