# Farm Management System Web - AI Agent Instructions

## Architecture Overview

React 19 + TypeScript + Vite PWA for livestock farm management. Uses Zustand for client state, React Query for server state, Firebase (Auth, Firestore, Storage, Functions) as backend, and TailwindCSS 4 + DaisyUI 5 for styling. All business logic lives in `services/` and `store/`, not in components.

### Core Patterns

1. **Service → Store → Hook → Component** data flow:
   - `services/` — Firebase callable wrappers (all use `callableFireFunction` with `operation` routing)
   - `store/` — Zustand stores for client state (4 stores)
   - `hooks/queries/` — React Query hooks for server state caching
   - `hooks/forms/` — React Hook Form + Zod validation hooks (11 form hooks)
   - `components/` — UI components organized by domain

2. **Callable Function Pattern** — All API calls go through:
   ```typescript
   callableFireFunction<TResponse, TRequest>('functionName', { operation: 'operationName', ...params })
   ```
   This wrapper injects the user's language for server-side i18n.

3. **Form Pattern** — Every form uses:
   ```typescript
   const { register, handleSubmit, control } = useForm<Schema>({ resolver: zodResolver(schema) })
   ```

## Project Structure

```
src/
├── App.tsx                           # Routes, auth flow, GSAP registration, layout
├── main.tsx                          # React root, QueryClient, Router, i18n
├── i18n.ts                           # i18next config (Backend + LanguageDetector)
├── sw.ts                             # Service worker (Workbox injectManifest)
├── index.css                         # TailwindCSS 4 entry + DaisyUI plugin + custom utilities
├── components/
│   ├── business/                     # Domain components (Animal, Dashboard, Tasks, etc.)
│   ├── layout/                       # Shared layout (Navbar, Sidebar, Modal, Loading, etc.)
│   ├── notifications/                # FCM token, notification manager, toast
│   ├── pwa/                          # Install/update prompts
│   └── ui/                           # Reusable UI (Button, TextField, Select, EmptyState, etc.)
├── config/
│   ├── environment.ts                # VITE_* env vars
│   ├── firebaseConfig.ts             # Firebase SDK init + emulator connections
│   ├── constants/routes.ts           # AppRoutes enum
│   └── persistence/                  # React Query persistence config
├── hooks/
│   ├── dashboard/                    # useDashboardConfig, useDashboardData, useProductionData
│   ├── forms/                        # 11 form hooks (useAnimalForm, useBreedForm, etc.)
│   ├── notifications/                # useFCMToken, useNotifications
│   ├── pwa/                          # usePWA
│   ├── queries/                      # React Query hooks (useAnimals, useTasks, etc.)
│   ├── system/                       # useEnvironment, useModal, useOffline, useTheme
│   ├── ui/                           # useIsMobile, useBackRoute, useSEO, usePreloadRoutes
│   └── voice/                        # useVoiceRecorder
├── pages/                            # Route-level page components (*.page.tsx)
├── schemas/                          # Zod schemas for form validation
├── services/                         # Firebase service layer (one folder per domain)
├── store/                            # Zustand stores (app, user, farm, notification)
├── types/                            # TypeScript type definitions (one per entity)
├── utils/                            # Shared utilities (PrivateRoute, SEO, helpers)
└── tests/                            # Test setup, mocks
```

## Routes (22 routes)

| Path | Page | Auth | Restriction |
|---|---|---|---|
| `/` | → `/dashboard` | — | — |
| `/login` | LoginForm | No | — |
| `/change-password` | — | Yes | — |
| `/dashboard` | Dashboard | Yes | — |
| `/animals` | Animals | Yes | — |
| `/animals/:animalUuid` | Animal | Public | — |
| `/animals/add-animal` | AnimalForm | Yes | — |
| `/animals/:animalUuid/edit-animal` | AnimalForm | Yes | — |
| `/animals/:animalUuid/add-health-record` | HealthRecordForm | Yes | — |
| `/animals/:animalUuid/edit-health-record/:healthRecordUuid` | HealthRecordForm | Yes | — |
| `/animals/:animalUuid/add-production-record` | ProductionRecordForm | Yes | — |
| `/animals/:animalUuid/edit-production-record/:productionRecordUuid` | ProductionRecordForm | Yes | — |
| `/animals/:animalUuid/related-animals` | RelatedAnimalsForm | Yes | — |
| `/employees` | Employees | Yes | owner, admin |
| `/employees/add-employee` | EmployeeForm | Yes | owner, admin |
| `/employees/:employeeUuid/edit-employee` | EmployeeForm | Yes | owner, admin |
| `/my-account` | MyAccount | Yes | — |
| `/my-species` | MySpecies | Yes | — |
| `/tasks` | Tasks (Kanban) | Yes | — |
| `/tasks/add-task` | TaskForm | Yes | — |
| `/calendar` | Calendar | Yes | — |
| `/tax-details` | TaxDetails | Yes | owner, admin |
| `/voice` | Voice | Yes | — |

## Zustand Stores (4 stores)

### useAppStore — UI state (in-memory)
`loading`, `toastData`, `defaultModalData`, `headerTitle`

### useUserStore — User session (persisted to sessionStorage)
`user: User | null`, `setUser`

### useFarmStore — Farm bulk data (persisted to sessionStorage)
`farm`, `taxDetails`, `species[]`, `breeds[]`, `loadFarmData(farmUuid, role)`, `loadFarmDataPublic(farmUuid)`

### useNotificationStore — Notifications (in-memory)
`notifications[]`, `unreadCount`, `loading`, `error`

## Services (14 services)

All use `callableFireFunction` pattern with `operation` routing:

| Service | Key Methods |
|---|---|
| `AnimalsService` | getAnimals, getAnimal, setAnimal, updateAnimal, updateAnimalStatus, loadAnimalWithDetails |
| `BreedsService` | createBreed, updateBreed, deleteBreed, deleteBreedsBySpeciesUuid |
| `CalendarService` | getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent |
| `DashboardService` | getDashboardStats, loadDashboardPhase2, loadDashboardPhase3 |
| `EmployeesService` | getEmployees, getEmployee, setEmployee, updateEmployee, deleteEmployee |
| `FarmsService` | updateFarm, createFarm, loadFarmBulkData, loadFarmBulkDataPublic |
| `HealthRecordsService` | getHealthRecords, setHealthRecord, updateHealthRecord |
| `NotificationsService` | markNotificationAsRead, registerDeviceToken, subscribeToNotificationsRealTime |
| `ProductionRecordsService` | getProductionRecords, setProductionRecord, updateProductionRecord |
| `RelatedAnimalsService` | getRelatedAnimals, setRelatedAnimal, deleteRelatedAnimal |
| `SpeciesService` | upsertSpecies, deleteSpecies |
| `TasksService` | getTasks, setTask, updateTask, deleteTask, updateTaskStatus, getTaskStatistics |
| `TaxDetailsService` | setTaxDetails, updateTaxDetails |
| `UserService` | loginWithEmailAndPassword, loginWithGoogle, getUser, updateUser, logout |
| `VoiceService` | processVoiceCommand, processAndExecuteVoiceCommand, transcribeOnly |

## Form Hooks (11 hooks in `hooks/forms/`)

All use `react-hook-form` + `@hookform/resolvers/zod` + Zod 4 schemas:
`useAnimalForm`, `useBreedForm`, `useCalendarEventForm`, `useEmployeeForm`, `useFarmForm`, `useHealthRecordForm`, `useProductionRecordForm`, `useSpeciesForm`, `useTaskForm`, `useTaxDetailsForm`, `useUserForm`

## React Query Hooks (`hooks/queries/`)

Server state caching with TanStack React Query 5 + persistence:
`useAnimals`, `useCalendarEvents`, `useDashboard`, `useEmployees`, `useHealthRecords`, `useNotifications`, `useProductionRecords`, `useRelatedAnimals`, `useTasks`

## Key Types

```typescript
type Role = 'employee' | 'owner' | 'admin'
type Gender = 'Male' | 'Female' | ''
type HealthStatus = 'healthy' | 'sick' | 'treatment' | 'unknown' | 'critical' | 'withdrawal'
type HealthRecordType = '' | 'Checkup' | 'Vaccination' | 'Medication' | 'Surgery' | 'Pregnancy' | 'Deworming' | 'Birth' | 'Drying' | 'HoofCare' | 'Castration' | 'Dehorning'
type TaskStatus = 'todo' | 'in-progress' | 'done' | 'archived' | 'overdue'
type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
type LiquidUnit = 'L' | 'Gal'
type WeightUnit = 'Kg' | 'P'
type TemperatureUnit = '°C' | '°F'
type FarmLanguage = 'eng' | 'spa'
```

## Key Conventions

- **Tabs** for indentation, **single quotes** for strings, **100-char line limit**
- Use `@/` alias for all internal imports (maps to `src/`)
- Page components: PascalCase, `.page.tsx` suffix
- Add translations for all new text (English & Spanish, 27 namespaces)
- Responsive/mobile-first design (Tailwind breakpoints)
- Organize imports with Biome
- Type definitions in `src/types/` (one `.d.ts` per entity, ambient declarations)
- Zod schemas in `src/schemas/` (one per entity, using Zod 4 syntax)

## Styling

- **TailwindCSS 4** — CSS-first config via `@import "tailwindcss"` in `index.css`
- **DaisyUI 5** — Component library via `@plugin "daisyui"` in `index.css`
- **UnoCSS** — Icons only (via `unocss/vite` plugin)
- **Dark mode** — `@variant dark` with `data-theme="dark"` attribute
- **Custom utilities** — Defined in `@layer utilities` in `index.css` (animations, scrollbar hiding, 3D flip)

## i18n

- **i18next** + **react-i18next** with HTTP backend and browser language detection
- Default language: `spa` (Spanish)
- Languages: `eng` (English), `spa` (Spanish)
- 27 translation namespaces per language in `public/locales/{lang}/`
- Access: `const { t } = useTranslation('namespace')`
- Scanner: `pnpm i18n:scan` to detect new keys

## PWA

- **Strategy**: `injectManifest` with custom service worker (`src/sw.ts`)
- **Workbox**: precaching + routing via `workbox-precaching` and `workbox-routing`
- **Prompt**: Auto-update with `PWAUpdatePrompt` component
- **Install**: `PWAInstallPrompt` for manual install
- **Assets**: Generated via `@vite-pwa/assets-generator`

## Firebase Config

- Two Firebase app instances: main (`app`) + `signUpApp` (for creating users without signing out current user)
- Emulator connections for local dev (Auth:9099, Firestore:8080, Functions, Storage:9199)
- FCM messaging initialized only in supported browsers
- Exports: `auth`, `signUpAuth`, `firestore`, `functions`, `messaging`, `storage`

## Auth Flow

1. `onAuthStateChanged` fires on app mount
2. Fetch user via `UserService.getUser(uid)`
3. Set user in `useUserStore`
4. If not admin, load farm bulk data via `useFarmStore.loadFarmData(farmUuid, role)`
5. Set i18n language from user preferences
6. `PrivateRoute` wrapper checks auth + role restrictions

## Build & Deployment

```bash
pnpm dev              # Dev server (develop mode)
pnpm local            # Dev server (local-develop with emulators)
pnpm build:develop    # tsc + vite build (develop)
pnpm build:production # tsc + vite build (production)
pnpm test             # Vitest (watch mode)
pnpm test --run       # Vitest (single run)
pnpm lint             # Biome check + auto-fix
pnpm lint:check       # Biome check (CI)
pnpm format           # Biome format + write
pnpm format:check     # Biome format check (CI)
pnpm i18n             # Scan + format translations
```

## Build Config (vite.config.ts)

- **Bundler**: Vite 8 (Rolldown)
- **React**: `@vitejs/plugin-react-swc`
- **CSS**: `@tailwindcss/vite` + `unocss/vite`
- **PWA**: `vite-plugin-pwa` (injectManifest strategy)
- **Code splitting**: Manual chunks (react-vendor, firebase-vendor, gsap-vendor, i18n-vendor, ui-vendor, date-vendor, router-vendor, state-vendor)
- **Path alias**: `@/` → `src/`

## Tech Stack

- Runtime: React 19, TypeScript 6
- Build: Vite 8, pnpm
- State: Zustand 5 (client), TanStack React Query 5 (server)
- Forms: React Hook Form 7, @hookform/resolvers, Zod 4
- Routing: react-router-dom 7
- Styling: TailwindCSS 4, DaisyUI 5, UnoCSS (icons), clsx, tailwind-merge
- Animation: GSAP 3, @gsap/react
- i18n: i18next 26, react-i18next 17, i18next-http-backend, i18next-browser-languagedetector
- Firebase: firebase 12 (Auth, Firestore, Functions, Storage, Messaging)
- Date: dayjs, react-day-picker 9
- Drag & Drop: @atlaskit/pragmatic-drag-and-drop
- Floating UI: @floating-ui/react
- Testing: Vitest 4, @testing-library/react, jsdom 29
- Linting: Biome 2.4
- PWA: vite-plugin-pwa, workbox 7
