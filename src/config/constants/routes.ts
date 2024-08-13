export enum AppRoutes {
	// Auth
	LOGIN = '/login',
	CHANGE_PASSWORD = '/change-password',

	// Animals
	ANIMALS = '/animals',
	ANIMAL = '/animals/:animalUuid',
	ADD_ANIMAL = '/animals/add-animal',
	EDIT_ANIMAL = '/animals/:animalUuid/edit-animal',
	ADD_HEALTH_RECORD = '/animals/:animalUuid/add-health-record',
	EDIT_HEALTH_RECORD = '/animals/:animalUuid/edit-health-record/:healthRecordUuid',
	ADD_PRODUCTION_RECORD = '/animals/:animalUuid/add-production-record',
	EDIT_PRODUCTION_RECORD = '/animals/:animalUuid/edit-production-record/:productionRecordUuid',
	RELATED_ANIMALS = '/animals/:animalUuid/related-animals',

	// Employees
	EMPLOYEES = '/employees',
	ADD_EMPLOYEE = '/employees/add-employee',
	EDIT_EMPLOYEE = '/employees/:employeeUuid/edit-employee',

	// My Account
	MY_ACCOUNT = '/my-account',

	// Billing Card
	BILLING_CARD = '/billing-card',
}
