# Tech Stack & Build System

## Core Technologies
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS 4 + DaisyUI + UnoCSS (for icons)
- **State Management**: Zustand
- **Routing**: React Router DOM v7
- **Backend**: Firebase (Auth, Firestore)
- **Animations**: GSAP with SplitText
- **Internationalization**: i18next + react-i18next
- **Testing**: Vitest + Testing Library
- **Code Quality**: Biome (linting + formatting)

## Key Libraries
- `@atlaskit/pragmatic-drag-and-drop` - Drag and drop functionality
- `@floating-ui/react` - Tooltips and popovers
- `react-day-picker` - Date selection
- `dayjs` - Date manipulation

## Build & Development Commands

### Development
```bash
pnpm dev          # Start dev server (local-develop mode)
pnpm prod         # Start dev server (production mode)
```

### Building
```bash
pnpm build:production  # Build for production
pnpm build:develop     # Build for development
pnpm preview          # Preview built app
```

### Testing
```bash
pnpm test         # Run tests with Vitest
```

### Code Quality
```bash
pnpm lint         # Lint and auto-fix with Biome
pnpm format       # Format code with Biome
pnpm lint:check   # Check linting without fixing
pnpm format:check # Check formatting without fixing
```

### Internationalization
```bash
pnpm i18n:scan    # Scan for translation keys
pnpm i18n:format  # Format translation files
pnpm i18n         # Run both scan and format
```

## Configuration Notes
- Uses `@` alias for `./src` imports
- Tab indentation (not spaces)
- Single quotes for strings
- 100 character line width
- ES modules throughout
- Strict TypeScript configuration