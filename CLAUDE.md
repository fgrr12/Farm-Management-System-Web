# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (workspace config in `pnpm-workspace.yaml`). Node >=22, pnpm >=10.

```bash
pnpm install          # install deps

# Dev servers (mode selects .env.<mode> file)
pnpm local            # vite --mode local-develop (Firebase emulators)
pnpm dev              # vite --mode develop (staging Firebase project)
pnpm prod             # vite --mode production (prod Firebase project)

# Build (runs tsc typecheck, then vite build)
pnpm build:develop
pnpm build:production
pnpm preview          # preview a built app

# Tests (Vitest)
pnpm test             # watch mode
pnpm test -- --run    # run once (CI)
pnpm test -- --run src/pages/Animals/Animals.page.test.tsx   # single file
pnpm test -- --run -t "test name"                            # single test by name

# Lint / format (Biome)
pnpm lint             # check + auto-fix
pnpm lint:check       # check only (CI)
pnpm format           # format + write
pnpm format:check     # format check only (CI)

# i18n
pnpm i18n:scan        # scan source for new translation keys (i18next-scanner)
pnpm i18n:format      # format public/locales with biome
pnpm i18n             # scan + format

pnpm pwa:generate     # regenerate PWA icon assets
```

To run the Firebase emulator suite that `pnpm local` expects (Auth :9099, Firestore :8080, Functions :5001, Storage :9199, UI :4000), run `pnpm emulators:develop` from `../API/functions` (sibling repo) first.

Environment files: `.env.local-develop`, `.env.develop`, `.env.production` (see `.env.example`). Do not invent `pnpm` scripts beyond what's in `package.json` — this repo's README documents several scripts (`dev:develop`, `test:coverage`, `build:pwa`, `analyze`, `deploy:*`) that do not currently exist; treat `package.json` as the source of truth.

## Architecture

React 19 + TypeScript + Vite 8 (Rolldown) PWA. Firebase (Auth, Firestore, Storage, Functions, FCM) is the only backend — there is no REST API of its own, everything goes through Firebase Cloud Functions.

**Data flow is unidirectional and layered:** `pages/` → `hooks/` → `services/` → Firebase. Components never call Firebase directly; business logic lives in `services/` and `store/`, not in components or pages.

- **`services/`** (one folder per domain, e.g. `services/animals/`) — every call goes through the `callableFireFunction<TResponse, TRequest>('functionName', { operation: 'operationName', ...params })` wrapper, which injects the user's language for server-side i18n. All Cloud Functions are invoked by name + `operation` string, not by separate HTTP endpoints.
- **`store/`** — 4 Zustand stores: `useAppStore` (in-memory UI state: loading, toast, modal, header title), `useUserStore` (session, persisted to sessionStorage), `useFarmStore` (farm/taxDetails/species/breeds bulk data, persisted to sessionStorage, loaded via `loadFarmData`/`loadFarmDataPublic`), `useNotificationStore` (in-memory).
- **`hooks/queries/`** — TanStack React Query hooks wrapping services for server-state caching/persistence.
- **`hooks/forms/`** — one hook per entity (`useAnimalForm`, `useTaxDetailsForm`, etc.), all built on `react-hook-form` + `@hookform/resolvers/zod` against a schema in `src/schemas/`.
- **`components/business/`** vs **`components/ui/`** — domain components (Animal, Dashboard, Tasks, MyAccount, RelatedAnimals...) vs generic/reusable ones (Button, TextField, Select...). `components/layout/` holds shell pieces (Navbar, Sidebar, Modal, DatePicker, SEO). `components/pwa/` and `components/notifications/` are self-contained subsystems (install/update prompts; FCM token + toast).
- **`pages/`** — route-level components, always suffixed `.page.tsx`, routed via `AppRoutes` enum in `src/config/constants/routes.ts`. Auth/role gating is done by a `PrivateRoute` wrapper (some routes are `owner`/`admin`-restricted, e.g. `/employees`, `/tax-details`; the public animal profile at `/animals/:animalUuid` is reachable without auth).
- **`types/`** — one ambient `.d.ts` per entity; **`schemas/`** — one Zod 4 schema per entity, paired 1:1 with the form hooks.

**Auth flow:** `onAuthStateChanged` fires on mount → `UserService.getUser(uid)` → `useUserStore.setUser` → if not admin, `useFarmStore.loadFarmData(farmUuid, role)` → i18n language set from user prefs → `PrivateRoute` enforces auth + role.

**Firebase config** (`src/config/firebaseConfig.ts`): two app instances — `app` (main) and `signUpApp` (creates new users without signing the current user out). Emulator connections wire up automatically in local-develop mode. FCM messaging only initializes in supporting browsers.

**PWA:** `injectManifest` strategy with a hand-written service worker at `src/sw.ts` (Workbox precaching/routing), auto-update via `PWAUpdatePrompt`, manual install via `PWAInstallPrompt`.

**Bundling:** manual Rolldown chunks in `vite.config.ts` split by vendor (react, firebase, gsap, i18n, ui, date, router, state) — when adding a new heavy dependency, consider whether it needs its own `manualChunks` bucket.

**Styling:** TailwindCSS 4 (CSS-first config, `@import "tailwindcss"` in `src/index.css`) + DaisyUI 5 (`@plugin "daisyui"`) for components, UnoCSS for icons only. Dark mode via `@variant dark` + `data-theme="dark"`. Custom utilities (animations, scrollbar hiding, 3D flip-card `perspective`/`transform-style-3d`/`backface-hidden`/`rotate-y-180`/`backface-back`) live in `@layer utilities` in `index.css`.

**3D transforms must be driven by these classes, never by React inline styles.** React does not emit `-webkit-` prefixes, so an inline `transformStyle: 'preserve-3d'` or `backfaceVisibility: 'hidden'` silently does nothing on mobile Safari — and an inline `transform` also overrides the class, taking the prefixed version with it. When `preserve-3d` fails to apply, the container flattens, `backface-visibility` stops having any effect (there is no 3D context left), and both faces of a flip card render on top of each other as an unreadable overlap. Use `transform-style-3d` on the rotating container, `backface-hidden` on both faces, and `backface-back` on the reverse face; `backface-hidden` also pins each face to its own compositing layer, which mobile Safari needs when a face contains `filter`/`opacity` descendants (e.g. `blur-2xl` decorations) that would otherwise flatten the context.

**i18n:** i18next + react-i18next, default language `spa`, namespaces per-feature under `public/locales/{eng,spa}/`. Never hardcode user-facing text; add keys to both languages and run `pnpm i18n:scan`.

## Conventions

- Tabs for indentation, single quotes, 100-char line limit, imports organized by Biome.
- `@/` path alias maps to `src/`.
- Page components: PascalCase, `.page.tsx` suffix.
