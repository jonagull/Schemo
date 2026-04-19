# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

- `src/app/` — Next.js App Router pages. Pages are thin wrappers; logic lives in hooks.
- `src/components/` — UI components: `forms/`, `layout/`, `ui/` (shadcn primitives), `AppShell.tsx`, `AppSidebar.tsx`, `Header.tsx`
- `shared/` — Everything reusable across the app:
  - `api/` — Axios clients (`client.ts` handles token refresh, `auth.ts`/`user.ts` are endpoint wrappers)
  - `hooks/` — React Query hooks (`useAuth.ts` contains all auth hooks)
  - `stores/` — Zustand stores (`authStore.ts`)
  - `types/` — TypeScript types mirroring backend DTOs

**Path aliases:** `@/` → `src/`, `@shared` → `shared/`

## Key Conventions

**Types mirror backend DTOs:**
- `*Sdto` — data received from server (read-only shape)
- `*Rdto` — data sent to server (request shape)

**API functions** in `shared/api/` always return `ResponseData<T>` (`T | undefined | null`). Never throw — handle nulls at the call site.

**Hooks pattern:**
- Mutations (`useLogin`, `useRegister`, `useLogout`) use `useMutation`, update `authStore` on success, then redirect
- Queries (`useUser`) use `useQuery` with `enabled: isAuthenticated` — never fetch unauthenticated
- `useAuthCheck` runs on an interval (30s) to check token expiry via `authStore.checkTokenExpiry()`

**Auth state:**
- Zustand `authStore` owns: `user`, `isAuthenticated`, `isLoading`, `expiresAt`
- Persisted to `localStorage` under key `'auth-storage'`
- `AuthInitializer` (in `providers.tsx`) rehydrates and validates on mount
- Token expiry check uses a 60-second buffer

**Token refresh** is handled entirely in `shared/api/client.ts` via Axios interceptors — on 401, requests are queued, `/auth/refresh` is called, then queued requests are replayed. Auth endpoints are excluded from retry.

**Components:**
- `Button` uses CVA with variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- `ContentWrapper` has size variants: `sm`, `md`, `lg`, `xl`, `full`
- Form validation uses Zod schemas defined alongside the form component (e.g. `registerSchema.ts`)
- `LabeledInput` is the standard form field component (handles label + error display)

## Layout / Shell

`AppShell` (client component in `src/components/AppShell.tsx`) is the root layout switcher:
- While `isLoading` is true (auth state not yet resolved): renders nothing
- When `isAuthenticated`: renders `SidebarProvider` + `AppSidebar` + `SidebarInset` around children
- When not authenticated: renders `Header` + children

Add new nav items to `AppSidebar.tsx` — the `navItems` array at the top of the file.

New shadcn components: `npx shadcn add <component>` from the `web/` directory.

## QueryClient Config

Defined in `src/app/providers.tsx` — default `staleTime` is 60 seconds. Override per-query as needed.
