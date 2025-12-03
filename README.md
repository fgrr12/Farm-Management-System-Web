# Farm Management System - Web Application

A comprehensive Progressive Web Application for livestock farm management built with React 19, TypeScript, and Firebase. Designed to help farmers efficiently track animals, manage employees, schedule tasks, and maintain detailed health and production records with multi-environment support and advanced voice capabilities.

## Features

### 🐄 Animal Management
- Individual animal profiles with comprehensive health tracking
- Medical records with treatment history and prescriptions
- Production monitoring (milk, eggs, weight, breeding cycles)
- Species and breed management with custom configurations
- Related animals tracking and genealogy mapping
- Photo management with Firebase Storage integration

### 👥 Team Management
- Role-based access control (Owner, Admin, Employee)
- Multi-user collaboration with real-time updates
- Permission management and farm-based data isolation
- Employee scheduling and task assignments

### 📋 Task & Calendar Management
- Task creation, assignment, and progress tracking
- Automated notifications for upcoming tasks and deadlines
- Recurring task templates for routine farm operations
- Priority management and deadline tracking

### 🌍 Multi-language Support
- Full internationalization with i18next
- English and Spanish localization (300+ translation keys)
- Automatic language detection and easy switching
- Context-aware translations for agricultural terminology

### 🎤 Advanced Voice Integration
- AI-powered voice commands with OpenAI Threads API
- Voice-to-text data entry for field operations
- Natural language processing for animal health updates
- Hands-free operation support for mobile field use
- Voice notes and audio recording capabilities

### 📱 Progressive Web App (PWA)
- Fully responsive design optimized for mobile field use
- Offline-capable with intelligent service worker caching
- Installable on mobile devices and desktop platforms
- Touch-friendly interfaces with drag-and-drop functionality
- Enhanced UI with GSAP animations and smooth micro-interactions
- Push notifications for critical farm alerts

### 🏗️ Layout & Design System
- **PageContainer**: Unified wrapper handling responsive padding, max-widths, and background gradients.
- **PageHeader**: Standardized header with breadcrumbs, actions, and statistics.
- **FormLayout**: Consistent 3-column layout for complex forms with sidebar navigation.
- **Skeleton Loaders**: Polished loading states for cards, tables, and forms.

### 🔧 Multi-Environment Support
- **Local Development**: Emulator-based development environment
- **Development**: Staging environment for testing (cattle-ea97b)
- **Production**: Live production environment (my-farm-8161d)
- Automatic environment detection and configuration switching

## Tech Stack

- **Frontend**: React 19 + TypeScript 5.9+ + Vite 6
- **Styling**: TailwindCSS 4 + DaisyUI + UnoCSS (for icons)
- **State Management**: Zustand for efficient state management
- **Backend**: Firebase 12.1.0 (Authentication + Firestore + Storage + Functions)
- **PWA**: Vite PWA Plugin with Workbox for offline support
- **Animations**: GSAP 3.12+ with advanced micro-interactions and UI enhancements
- **Testing**: Vitest + Testing Library (67 tests, 100% passing rate)
- **Code Quality**: Biome 2.2+ (ESLint + Prettier replacement)
- **Internationalization**: i18next + react-i18next with 300+ keys
- **Package Management**: PNPM with workspace configuration

## Quality Metrics

- ✅ **Tests**: 67/67 passing (100% success rate)
- ✅ **Linting**: 0 errors, clean codebase with Biome 2.2+
- ✅ **Build**: No warnings or errors across all environments
- ✅ **TypeScript**: Strict mode, fully typed with 5.9+ features
- ✅ **Performance**: Optimized with intelligent code splitting and lazy loading
- ✅ **PWA**: Lighthouse score optimized for mobile field operations
- ✅ **Accessibility**: WCAG compliant components with proper ARIA labels
- ✅ **UI/UX**: Enhanced with GSAP animations and improved component reliability
- ✅ **Security**: Firebase security rules with farm-based data isolation
- ✅ **Offline**: Full offline capabilities with intelligent sync strategies

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- PNPM (recommended package manager for workspaces)
- Firebase CLI installed globally (`npm install -g firebase-tools`)
- Firebase projects configured for multi-environment setup

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd farm-management-system/web
```

2. Install dependencies using PNPM:
```bash
pnpm install
```

3. Set up environment variables:
   Create the appropriate environment file based on your target environment:
   - `.env.local-develop` for local development with emulators
   - `.env.develop` for staging environment
   - `.env.production` for production environment

4. Start the development server:
```bash
# Local development with emulators
pnpm dev

# Development environment (staging)
pnpm dev:develop

# Production environment mode
pnpm prod
```

The application will be available at `http://localhost:5173`

### Firebase Emulator Setup (Local Development)

1. Install Firebase CLI and login:
```bash
npm install -g firebase-tools
firebase login
```

2. Start the emulator suite (from the API directory):
```bash
cd ../api/functions
pnpm emulators:develop
```

3. The emulators will be available at:
   - **Firestore**: `http://localhost:8080`
   - **Authentication**: `http://localhost:9099`
   - **Functions**: `http://localhost:5001`
   - **Storage**: `http://localhost:9199`
   - **Emulator UI**: `http://localhost:4000`

## Development Commands

### Development Servers
```bash
pnpm dev              # Local development (emulators, default)
pnpm dev:develop      # Development environment (staging)
pnpm prod             # Production environment mode
```

### Building & Preview
```bash
pnpm build:production  # Build for production environment
pnpm build:develop     # Build for development environment
pnpm preview          # Preview built app locally
```

### Testing & Quality
```bash
pnpm test         # Run tests with Vitest (watch mode)
pnpm test --run   # Run all tests once (CI mode)
pnpm test:coverage # Run tests with coverage report
```

**Current Status**: ✅ 67/67 tests passing (100% success rate)

### Code Quality & Formatting
```bash
pnpm lint         # Lint and auto-fix with Biome
pnpm format       # Format code with Biome
pnpm lint:check   # Check linting without fixing
pnpm format:check # Check formatting without fixing
```

### Internationalization
```bash
pnpm i18n:scan    # Scan for new translation keys
pnpm i18n:format  # Format translation files
pnpm i18n         # Run both scan and format operations
```

### PWA & Build Tools
```bash
pnpm build:pwa    # Generate PWA assets and manifest
pnpm analyze      # Analyze bundle size and dependencies
```

## Project Structure

```
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   │   ├── business/       # Domain-specific components (animals, tasks)
│   │   ├── layout/         # Layout and navigation components
│   │   ├── notifications/  # Notification system components
│   │   ├── pwa/           # PWA-specific components
│   │   └── ui/            # Generic UI components (buttons, forms)
│   ├── pages/             # Route-level page components (.page.tsx)
│   ├── hooks/             # Custom React hooks
│   │   ├── calendar/      # Calendar and scheduling hooks
│   │   ├── dashboard/     # Dashboard data hooks
│   │   ├── forms/         # Form management hooks
│   │   ├── notifications/ # Notification system hooks
│   │   ├── pwa/          # PWA and offline hooks
│   │   ├── system/       # System and auth hooks
│   │   ├── ui/           # UI interaction hooks
│   │   └── voice/        # Voice recording and AI hooks
│   ├── services/          # API and external service integrations
│   │   ├── animals/       # Animal management services
│   │   ├── auth/          # Authentication services
│   │   ├── calendar/      # Calendar and task services
│   │   ├── dashboard/     # Dashboard data services
│   │   └── voice/         # Voice and AI services
│   ├── store/             # Zustand state management
│   │   ├── useAppStore/   # Main application state
│   │   ├── useAuthStore/  # Authentication state
│   │   └── useVoiceStore/ # Voice interaction state
│   ├── types/             # TypeScript type definitions
│   │   ├── animal.d.ts    # Animal-related types
│   │   ├── auth.d.ts      # Authentication types
│   │   ├── calendar.d.ts  # Calendar and task types
│   │   └── voice.d.ts     # Voice interaction types
│   ├── schemas/           # Zod validation schemas
│   ├── utils/             # Utility functions and helpers
│   ├── config/            # Configuration files
│   │   ├── constants/     # Application constants
│   │   ├── environment.ts # Environment configuration
│   │   ├── firebaseConfig.ts # Firebase setup and config
│   │   └── persistence/   # Data persistence configuration
│   └── tests/             # Test setup and utilities
├── public/                # Static assets
│   ├── assets/           # Images and media files
│   │   ├── billing/      # Billing and invoice assets
│   │   └── default-imgs/ # Default placeholder images
│   ├── locales/          # Translation files
│   │   ├── eng/         # English translations
│   │   └── spa/         # Spanish translations
│   └── [PWA assets]     # PWA icons and manifest files
├── dev-dist/             # Development PWA files (auto-generated)
├── dist/                 # Production build output
├── docs/                 # Project documentation
├── scripts/              # Build and utility scripts
└── pnpm-workspace.yaml   # PNPM workspace configuration
```

## Deployment

The project is configured for Firebase Hosting with multi-environment deployment support:

### Environment-Specific Deployment

```bash
# Development/Staging Environment
pnpm build:develop
firebase deploy --only hosting:develop --project develop

# Production Environment  
pnpm build:production
firebase deploy --only hosting:production --project production
```

### Automated Deployment Pipeline

```bash
# Complete development deployment (build + deploy)
pnpm deploy:develop

# Complete production deployment (build + deploy)
pnpm deploy:production
```

### Manual Deployment Steps

1. **Build the application**:
   ```bash
   pnpm build:production  # or pnpm build:develop
   ```

2. **Deploy to Firebase Hosting**:
   ```bash
   firebase deploy --only hosting --project <project-alias>
   ```

3. **Deploy with functions (if needed)**:
   ```bash
   firebase deploy --project <project-alias>
   ```

### Deployment Environments

- **Development**: `https://cattle-ea97b.web.app`
- **Production**: `https://my-farm-8161d.web.app`

### Pre-deployment Checklist

- [ ] All tests passing (`pnpm test --run`)
- [ ] Build successful for target environment
- [ ] Environment variables configured correctly
- [ ] Firebase project configured and accessible
- [ ] PWA assets generated and optimized
- [ ] Translation files updated and formatted

## Contributing

1. **Code Style**: Follow the established conventions
   - Tabs for indentation (not spaces)
   - Single quotes for strings  
   - 100-character line limit
   - Import organization with Biome

2. **Architecture**: Maintain clean separation of concerns
   - Use `@/` alias for all internal imports
   - Page components must use `.page.tsx` suffix
   - Business logic belongs in `services/` and `store/`
   - All API interactions through service layer

3. **Internationalization**: Support bilingual interface
   - Add translations for all new text (English & Spanish)
   - Use translation keys, never hardcoded text
   - Run `pnpm i18n` to scan and format translations

4. **Testing**: Maintain comprehensive test coverage
   - Write tests for new features and components
   - Target 100% test pass rate (currently 67/67)
   - Use Vitest + Testing Library patterns

5. **Responsive Design**: Mobile-first development
   - Test on mobile devices and different screen sizes
   - Use Tailwind breakpoints consistently
   - Ensure touch-friendly interfaces

6. **PWA Compliance**: Maintain offline capabilities
   - Test offline functionality
   - Verify service worker updates
   - Optimize for mobile installation

### Pre-commit Checklist
```bash
pnpm lint:check     # ✅ No linting errors
pnpm format:check   # ✅ Code properly formatted  
pnpm test --run     # ✅ All tests passing
pnpm build:develop  # ✅ Build successful
pnpm i18n          # ✅ Translations updated
```

### Development Workflow

1. **Feature Development**:
   - Create feature branch from `main`
   - Develop with local emulators (`pnpm dev`)
   - Write comprehensive tests
   - Add translations for new UI text

2. **Testing & Quality**:
   - Test locally with emulators
   - Run full test suite
   - Verify responsive design
   - Test PWA offline functionality

3. **Staging Deployment**:
   - Deploy to development environment
   - Test with real Firebase services
   - Verify multi-user scenarios
   - Validate voice AI features

4. **Production Release**:
   - Code review and approval
   - Deploy to production environment
   - Monitor performance and errors
   - User acceptance testing

## Development Workflow

### Pre-commit Checklist
- [ ] All tests passing (`pnpm test --run`)
- [ ] No linting errors (`pnpm lint:check`)
- [ ] Code properly formatted (`pnpm format:check`)
- [ ] Build successful (`pnpm build:develop`)
- [ ] New features have comprehensive tests
- [ ] Translations added for new text (English + Spanish)
- [ ] Responsive design tested on mobile devices
- [ ] PWA functionality works offline

## Code Style

- **Indentation**: Tabs (not spaces)
- **Quotes**: Single quotes for strings
- **Line Length**: 100 characters maximum
- **Import Order**: Automatically organized by Biome in specific groups
- **Components**: PascalCase with descriptive names
- **Files**: Use `.page.tsx` suffix for page components
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Testing**: Comprehensive coverage with Vitest and Testing Library

## License

**All Rights Reserved** - This project is publicly visible for portfolio and demonstration purposes only.

### Usage Terms:
- ✅ **Viewing and learning** from the code is permitted
- ✅ **Forking for personal study** is allowed
- ❌ **Commercial use** requires explicit written permission
- ❌ **Redistribution** without attribution is prohibited
- ❌ **Copying substantial portions** without permission is not allowed

### Attribution Required:
If you use any part of this code, you must:
- Credit the original author
- Link back to this repository
- Clearly state what portions were derived from this work

**Contact**: For commercial licensing or usage permissions, please reach out through GitHub issues or repository contact information.

© 2025 - All rights reserved. This software is the intellectual property of the repository owner.
