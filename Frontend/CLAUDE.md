# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 3000
npm run build      # Production build
npm run lint       # ESLint check
npm run preview    # Preview production build

# E2E tests (Playwright)
npx playwright test                     # Run all tests
npx playwright test --project=customer  # Run specific project (auth | customer | provider | admin)
npx playwright test tests/foo.spec.ts   # Run single test file
```

## Environment

Copy `.env.example` to `.env`. Key variables:
- `VITE_API_BASE_URL` — backend URL (default: `http://localhost:8080`)
- `VITE_API_DEPLOY_URL` — production API URL

Path alias: `@/*` maps to `src/*`.

## Architecture

### Roles & Routing

Three distinct user roles — **admin**, **service provider** (hotel/tour), **customer** — each with their own layout and page tree under `src/pages/{Admin,ServiceProvider,User}/`.

All routes are defined in `src/routes.tsx` (lazy-loaded with `withSuspense`) and use protected route wrappers from `src/contexts/ProtectedRoutes.tsx`. Route constants, permission mappings, and breadcrumb labels live in `src/constants/routes.ts`. To add a new page: add the route constant there, add the lazy import + `<Route>` in `routes.tsx`, and add the permission entry if role-gating is needed.

### Authentication

`src/contexts/AuthContext.tsx` is the central auth provider. It supports:
- Real auth via backend JWT (HttpOnly cookies) + Google OAuth
- Mock users for development (`customer`, `hotelProvider`, `tourProvider`, `admin`, `pendingProvider`) — toggled via `mockConfig.ts`
- AWS Cognito OIDC via `react-oidc-context` (configured in `main.tsx`)

Use the `useAuth` hook from `src/hooks/useAuth.ts` to access the current user and auth actions anywhere in the app.

### State Management

Two layers:
1. **TanStack Query** — all server state (fetching, caching, mutations). Prefer this for API-backed data.
2. **Redux Toolkit** — thin client-only state: `destinationSlice` (filter UI state) and `serviceDetailSlice`. Store in `src/store/`.

Avoid adding Redux slices for data that belongs in React Query.

### API Layer

Two parallel layers exist (legacy migration in progress):
- `src/services/apiClient.ts` — large monolithic Axios client; older pages use this directly.
- `src/api/*.ts` — modular API files per domain (newer pattern). New features should add here.

`src/services/apiServiceClient.tsx` wraps Axios with auth headers for provider-specific calls.

OpenAPI-generated types live in `src/types/api.types.ts` — prefer these over hand-written interfaces when they exist.

### Real-time

`src/services/socketService.ts` manages STOMP over SockJS WebSocket connections for real-time chat and notifications. Connect/disconnect is handled by the auth lifecycle.

### UI Components

- `src/components/common/ui/` — Shadcn/Radix UI primitives (Button, Dialog, etc.)
- `src/components/common/layout/` — role-specific layouts (`AdminLayout`, `UserLayout`, `UserProfileLayout`)
- `src/components/common/feedback/` — `LoadingSpinner`, `AlertDialog`, `ConfirmContext` (global confirm dialog)

Tailwind CSS (v4 with Vite plugin) is the primary styling tool. SCSS is used for a few legacy component files. Custom Tailwind colors use CSS variables for dark mode.
