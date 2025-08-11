# Copilot Instructions for Farm Management System Web

As a react expert developer working on the Farm Management System Web project, you will be using the following guidelines and best practices.

## Project Overview
- **Type**: React 19 + TypeScript + Vite PWA for livestock farm management
- **State**: Zustand
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Styling**: TailwindCSS 4, DaisyUI, UnoCSS (icons)
- **Testing**: Vitest + Testing Library
- **i18n**: i18next (English/Spanish)
- **Build Tool**: PNPM

## Architecture & Patterns
- **src/components/**: Reusable UI, organized by domain (business, layout, ui, pwa)
- **src/pages/**: Route-level page components, use `.page.tsx` suffix
- **src/services/**: All API and Firebase logic, one folder per domain (e.g., animals, employees)
- **src/store/**: Zustand stores, one per domain
- **src/types/**: All TypeScript types, one file per domain/entity
- **src/utils/**: Utility functions, helpers
- **src/config/**: Environment, Firebase config, constants
- **src/hooks/**: Custom React hooks, grouped by feature
- **src/schemas/**: Zod schemas for validation
- **src/tests/**: Test setup, mocks, utilities
- **public/locales/**: i18n translation files (eng, spa)
- **dev-dist/**: Auto-generated PWA files (do not edit)

## Key Conventions
- **Tabs** for indentation, **single quotes** for strings, **100-char line limit**
- Use `@/` alias for all internal imports
- Page components: PascalCase, `.page.tsx` suffix
- Add translations for all new text (English & Spanish)
- Responsive/mobile-first design (Tailwind breakpoints)
- All business logic in `services/` and `store/`, not in components
- Use Zod schemas for all data validation
- Organize imports with Biome

## Developer Workflows
- **Dev server**: `pnpm dev` (local), `pnpm prod` (production mode)
- **Build**: `pnpm build:production` or `pnpm build:develop`
- **Preview**: `pnpm preview`
- **Test**: `pnpm test` (watch), `pnpm test --run` (all)
- **Lint/Format**: `pnpm lint`, `pnpm format`, `pnpm lint:check`, `pnpm format:check`
- **i18n**: `pnpm i18n:scan`, `pnpm i18n:format`, `pnpm i18n`
- **Deploy**: `firebase deploy --only hosting:develop|production`

## Integration Points
- **Firebase**: All backend logic in `src/services/`, config in `src/config/firebaseConfig.ts`
- **PWA**: Service worker in `dev-dist/sw.js`, config in `pwa-assets.config.ts`
- **i18n**: Config in `src/i18n.ts`, translations in `public/locales/`
- **Testing**: Setup in `src/tests/setup.ts`, mocks in `src/tests/__mocks__/`

## Examples
- Add a new animal: update `src/services/animals/`, `src/store/useAppStore/`, `src/types/animal.d.ts`, and translations
- Add a new page: create `src/pages/NewPage/NewPage.page.tsx`, add route, update i18n

## Pre-commit Checklist
- All tests pass (`pnpm test --run`)
- No lint errors (`pnpm lint:check`)
- Code formatted (`pnpm format:check`)
- Build succeeds (`pnpm build:develop`)
- Translations updated (English & Spanish)
- Responsive/mobile tested
- PWA works offline

## Reference
- See `README.md` for full setup, deployment, and code style details.
- For Firebase config, see `.env.example` and `src/config/firebaseConfig.ts`.
