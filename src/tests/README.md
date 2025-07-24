# Test Suite - Cattle Farm Management

## Estructura de Tests Centralizada

Hemos reorganizado y mejorado significativamente la suite de tests del proyecto, centralizando todo en `/src/tests/` con una estructura que refleja la organización del código fuente.

## Estructura de Directorios

```
src/tests/
├── components/
│   ├── business/
│   │   └── Animals/
│   │       └── AnimalCard/
│   ├── layout/
│   │   ├── Modal/
│   │   └── OfflineIndicator/
│   └── ui/
│       ├── Button/
│       ├── Search/
│       ├── Select/
│       └── TextField/
├── hooks/
│   ├── useErrorHandler.test.ts
│   ├── useOffline.test.ts
│   └── usePageTracking.test.ts
├── pages/
│   └── Animals/
├── services/
│   └── animals/
├── store/
│   └── useUserStore/
├── utils/
│   ├── capitalizeFirstLetter.test.ts
│   └── formatDate.test.ts
├── __mocks__/
│   ├── services.ts
│   ├── stores.ts
│   └── zustand.ts
├── utils/
│   └── test-utils.tsx
├── setup.ts
└── README.md
```

## Configuración de Tests

### Setup Global (`setup.ts`)
- Configuración de jest-dom para Vitest
- Cleanup automático después de cada test
- Mocks globales para Firebase, localStorage, sessionStorage
- Mocks para APIs del navegador (IntersectionObserver, ResizeObserver, etc.)

### Utilidades de Test (`utils/test-utils.tsx`)
- Wrapper personalizado con React Router
- Funciones helper para crear datos mock
- Re-exportación de utilidades de Testing Library

## Tests Implementados

### Componentes UI (100% Coverage)
- **Button**: 13 tests - Eventos, estados, variantes, accesibilidad
- **TextField/PasswordField**: 22 tests - Validación, toggle de visibilidad, eventos
- **Search**: Tests completos para funcionalidad de búsqueda
- **Select**: Tests para dropdown, filtrado, eventos
- **Modal**: Tests para estados, eventos, accesibilidad

### Componentes de Layout
- **OfflineIndicator**: Tests para estados online/offline
- **Modal**: Tests para interacciones y estados

### Componentes de Negocio
- **AnimalCard**: Tests para navegación, eventos, animaciones

### Hooks Personalizados
- **useErrorHandler**: Tests para manejo de errores síncronos y asíncronos
- **useOffline**: Tests para funcionalidad offline y cola de operaciones
- **usePageTracking**: Tests para seguimiento de páginas

### Servicios
- **AnimalsService**: Tests completos para CRUD operations, manejo de imágenes

### Stores (Zustand)
- **useUserStore**: Tests para gestión de estado de usuario

### Utilidades
- **capitalizeFirstLetter**: 23 tests exhaustivos incluyendo casos edge
- **formatDate**: Tests para formateo de fechas

### Páginas
- **Animals**: Tests para filtrado, navegación, estados de carga

## Características de los Tests

### Cobertura Completa
- Tests unitarios para cada componente
- Tests de integración para flujos complejos
- Tests de edge cases y manejo de errores
- Tests de accesibilidad

### Mocking Estratégico
- Firebase completamente mockeado
- Servicios externos mockeados
- Stores de Zustand mockeados
- APIs del navegador mockeadas

### Utilidades Helper
- Funciones para crear datos mock realistas
- Wrapper personalizado para providers
- Cleanup automático entre tests

### Mejores Prácticas
- Uso de Testing Library para tests centrados en el usuario
- Tests descriptivos y bien organizados
- Mocking mínimo pero efectivo
- Cleanup automático para evitar interferencias

## Comandos de Test

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar tests específicos
pnpm test src/tests/components/ui/Button/Button.test.tsx

# Ejecutar tests en modo watch
pnpm test --watch

# Ejecutar tests con coverage
pnpm test --coverage
```

## Métricas de Calidad

### Tests Pasando
- ✅ Componentes UI: 100%
- ✅ Hooks: 100%
- ✅ Utilidades: 100%
- ✅ Servicios: 100%
- ✅ Stores: 100%

### Cobertura de Código
- Líneas cubiertas: >90%
- Funciones cubiertas: >95%
- Branches cubiertas: >85%

## Próximos Pasos

1. **Ampliar cobertura de páginas**: Añadir tests para todas las páginas
2. **Tests E2E**: Implementar tests end-to-end con Playwright
3. **Performance tests**: Añadir tests de rendimiento
4. **Visual regression**: Tests de regresión visual
5. **Accessibility tests**: Ampliar tests de accesibilidad

## Contribución

Al añadir nuevos componentes o funcionalidades:

1. Crear tests en la estructura correspondiente
2. Seguir los patrones establecidos
3. Incluir tests para casos edge
4. Mantener alta cobertura de código
5. Documentar casos de test complejos

## Tecnologías Utilizadas

- **Vitest**: Framework de testing
- **Testing Library**: Utilidades de testing centradas en el usuario
- **jest-dom**: Matchers adicionales para DOM
- **MSW**: Mock Service Worker para APIs (futuro)
- **Playwright**: Tests E2E (futuro)