# Project Structure & Organization

## Root Structure
```
├── src/                    # Source code
├── public/                 # Static assets
├── dist/                   # Build output
├── .kiro/                  # Kiro configuration
├── .firebase/              # Firebase deployment cache
└── node_modules/           # Dependencies
```

## Source Code Organization (`src/`)
```
src/
├── components/             # Reusable UI components
├── pages/                  # Route-level page components
├── hooks/                  # Custom React hooks
├── services/               # API and external service integrations
├── store/                  # Zustand state management
├── utils/                  # Utility functions and helpers
├── types/                  # TypeScript type definitions
├── config/                 # Configuration files
├── tests/                  # Test setup and utilities
├── App.tsx                 # Main application component
├── main.tsx                # Application entry point
├── i18n.ts                 # Internationalization setup
└── index.css               # Global styles
```

## Import Organization
Biome is configured to organize imports in this specific order:
1. External packages (React, libraries)
2. `@/config/**` - Configuration imports
3. `@/store/**` - State management
4. `@/utils/**` - Utilities
5. `@/services/**` - API services
6. `@/pages/**` - Page components
7. `@/components/**` - UI components
8. `@/hooks/**` - Custom hooks
9. `@/types/**` - Type definitions

## Naming Conventions
- **Files**: PascalCase for components (`Animal.page.tsx`, `AnimalForm.page.tsx`)
- **Directories**: camelCase (`components`, `services`)
- **Components**: PascalCase exports with descriptive names
- **Pages**: Include `.page.tsx` suffix for clarity
- **Types**: Include `.types.ts` suffix when dedicated type files

## Key Patterns
- **Lazy Loading**: All page components are lazy-loaded for performance
- **Private Routes**: Authentication wrapper for protected pages
- **Role-based Access**: Routes conditionally rendered based on user role
- **Modular Architecture**: Clear separation between UI, business logic, and data
- **Alias Usage**: Always use `@/` imports instead of relative paths

## Public Assets
```
public/
├── locales/                # Translation files (eng/, spa/)
├── assets/                 # Images and static files
└── vite.svg               # Favicon
```