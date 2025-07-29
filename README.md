# Cattle - Farm Management System

A comprehensive livestock farm management application built with React, TypeScript, and Firebase. Designed to help farmers efficiently track animals, manage employees, schedule tasks, and maintain detailed health and production records.

## Features

### 🐄 Animal Management
- Individual animal profiles with detailed records
- Health tracking and medical history
- Production record monitoring
- Related animals and breeding information
- Custom species configuration

### 👥 Employee Management
- Role-based access control (Owner, Admin, Employee)
- Staff management and permissions
- Multi-user collaboration

### 📋 Task Management
- Farm task scheduling and tracking
- Assignment and progress monitoring
- Priority and deadline management

### 🌍 Multi-language Support
- English and Spanish localization
- Automatic language detection
- Easy language switching

### 🎤 Voice Recording
- Voice notes for field data entry
- Mobile-friendly audio capture
- Hands-free operation support

### 📱 Progressive Web App (PWA)
- Fully responsive design optimized for mobile field use
- Offline-capable with service worker support
- Installable on mobile devices and desktop
- Touch-friendly interfaces with drag-and-drop functionality
- Enhanced UI with GSAP animations and smooth transitions

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS 4 + DaisyUI + UnoCSS (for icons)
- **State Management**: Zustand
- **Backend**: Firebase (Authentication + Firestore + Storage)
- **PWA**: Vite PWA Plugin with Workbox for offline support
- **Animations**: GSAP with advanced micro-interactions and UI enhancements
- **Testing**: Vitest + Testing Library (275 tests, 100% passing)
- **Code Quality**: Biome (ESLint + Prettier replacement)
- **Internationalization**: i18next + react-i18next
- **Package Management**: PNPM with workspace configuration

## Quality Metrics

- ✅ **Tests**: 275/275 passing (100% success rate)
- ✅ **Linting**: 0 errors, clean codebase with Biome
- ✅ **Build**: No warnings or errors
- ✅ **TypeScript**: Strict mode, fully typed
- ✅ **Performance**: Optimized with intelligent code splitting
- ✅ **PWA**: Lighthouse score optimized for mobile
- ✅ **Accessibility**: WCAG compliant components
- ✅ **UI/UX**: Enhanced with GSAP animations and improved component reliability

## Getting Started

### Prerequisites
- Node.js 18+ 
- PNPM (recommended package manager)
- Firebase project with Authentication, Firestore, and Storage enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cattle
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Firebase configuration.

4. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Development Commands

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
pnpm test         # Run tests with Vitest (watch mode)
pnpm test --run   # Run all tests once
```

**Current Status**: ✅ 275/275 tests passing (100% success rate)

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

## Project Structure

```
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route-level page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and external service integrations
│   ├── store/             # Zustand state management
│   ├── utils/             # Utility functions and helpers
│   ├── types/             # TypeScript type definitions
│   ├── config/            # Configuration files
│   └── tests/             # Test setup and utilities
├── public/                # Static assets (PWA icons, locales)
├── dist/                  # Production build output
├── dev-dist/              # Development PWA files (auto-generated)
├── .kiro/                 # Kiro configuration and steering
└── pnpm-workspace.yaml    # PNPM workspace configuration
```

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Enable Storage for file uploads
5. Add your Firebase config to `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Deployment

The project is configured for Firebase Hosting with separate environments:

```bash
# Build and deploy to development
pnpm build:develop
firebase deploy --only hosting:develop

# Build and deploy to production  
pnpm build:production
firebase deploy --only hosting:production
```

## Contributing

1. Follow the established code style (tabs, single quotes, 100-char lines)
2. Use the `@/` import alias for all internal imports
3. Add translations for new text content in both English and Spanish
4. Write comprehensive tests for new features (maintain 100% coverage)
5. Ensure responsive design works on mobile devices
6. Run pre-commit checks:
   ```bash
   pnpm lint:check   # Verify linting
   pnpm format:check # Verify formatting
   pnpm test --run   # Run all tests
   pnpm build:develop # Verify build works
   ```

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
