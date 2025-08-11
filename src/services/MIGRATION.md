# Services Migration to Firebase Functions

This document outlines the migration of web services from direct Firestore access to using Firebase Cloud Functions.

## Overview

All services have been updated to use the new consolidated Firebase Functions instead of direct Firestore queries. This provides better security, data validation, and centralized business logic.

## Migration Pattern

### Before (Direct Firestore)
```typescript
const getAnimals = async (farmUuid: string): Promise<Animal[]> => {
  const queryBase = query(
    collection(firestore, 'animals'),
    where('farmUuid', '==', farmUuid)
  )
  const animalsDocs = await getDocs(queryBase)
  return animalsDocs.docs.map(doc => doc.data()) as Animal[]
}
```

### After (Firebase Functions)
```typescript
const getAnimals = async (farmUuid: string): Promise<Animal[]> => {
  const response = await callableFireFunction<{ success: boolean; data: Animal[]; count: number }>('animals', {
    operation: 'getAnimalsByFarm',
    farmUuid,
  })
  return response.data
}
```

## Updated Services

### Core Services
1. **AnimalsService** - Animal management operations
2. **FarmsService** - Farm management operations
3. **SpeciesService** - Species management operations
4. **BreedsService** - Breed management operations
5. **TasksService** - Task management operations
6. **HealthRecordsService** - Health record management
7. **ProductionRecordsService** - Production record management
8. **EmployeesService** - Employee management
9. **UserService** - User profile and authentication
10. **DashboardService** - Dashboard statistics and metrics
11. **BillingCardsService** - Billing card management
12. **RelatedAnimalsService** - Animal relationship management

### New Services
1. **CalendarService** - Calendar and event management
2. **NotificationsService** - Notification management

## Function Operations

Each service now uses operations that correspond to the Firebase Functions:

### Animals Service
- `getAnimalsByFarm` - Get all animals for a farm
- `getAnimalByUuid` - Get specific animal
- `getAnimalsBySpeciesUuid` - Get animals by species
- `upsertAnimal` - Create or update animal
- `updateAnimalStatus` - Update animal status

### Farms Service
- `getAllFarms` - Get all farms
- `getFarmByUuid` - Get specific farm
- `upsertFarm` - Create or update farm
- `updateFarmStatus` - Update farm status

### Tasks Service
- `getTasks` - Get tasks with filters
- `getTaskStatistics` - Get task statistics
- `upsertTask` - Create or update task
- `deleteTask` - Delete task

### Health Records Service
- `getHealthRecords` - Get health records for animal
- `getHealthRecordByUuid` - Get specific health record
- `upsertHealthRecord` - Create or update health record
- `updateHealthRecordStatus` - Update health record status

### Production Records Service
- `getProductionRecords` - Get production records
- `getProductionRecordByUuid` - Get specific production record
- `getProductionRecordsByDateRange` - Get records by date range
- `getProductionSummary` - Get production summary
- `upsertProductionRecord` - Create or update production record
- `updateProductionRecordStatus` - Update production record status

## Benefits

1. **Security** - All database operations go through authenticated functions
2. **Validation** - Data validation happens on the server side
3. **Business Logic** - Centralized business rules and logic
4. **Performance** - Optimized queries and data processing
5. **Consistency** - Standardized response format across all operations
6. **Scalability** - Better resource management and scaling
7. **Monitoring** - Centralized logging and error handling

## Response Format

All functions return a consistent response format:

```typescript
{
  success: boolean
  data: T | T[]
  count?: number // For array responses
}
```

## Error Handling

Functions use Firebase HttpsError for consistent error handling:

```typescript
try {
  const response = await callableFireFunction('functionName', params)
  return response.data
} catch (error) {
  // Handle Firebase function errors
  console.error('Function error:', error)
  throw error
}
```

## Migration Checklist

- [x] Update AnimalsService
- [x] Update FarmsService  
- [x] Update SpeciesService
- [x] Update BreedsService
- [x] Update TasksService
- [x] Update HealthRecordsService
- [x] Update ProductionRecordsService
- [x] Update EmployeesService
- [x] Update UserService (partial - auth remains local)
- [x] Update DashboardService
- [x] Update BillingCardsService
- [x] Update RelatedAnimalsService
- [x] Create CalendarService
- [x] Create NotificationsService
- [x] Create services index file
- [x] Update service types
- [x] Create migration documentation

## Next Steps

1. Test all service operations with the new functions
2. Update any components using the old service methods
3. Remove unused Firestore imports
4. Update service tests to mock the new function calls
5. Deploy and monitor for any issues

## Notes

- Some services like UserService still use Firebase Auth directly for authentication
- Real-time listeners for RelatedAnimalsService still use Firestore snapshots
- All new operations require user authentication and proper permissions
- Each operation includes the userUuid for audit trails and permissions
