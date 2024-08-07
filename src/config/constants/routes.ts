export enum AppRoutes {
	LOGIN = '/login',
	REGISTER = '/register',
	CHANGE_PASSWORD = '/change-password',

	ANIMALS = '/animals',
	ANIMAL = '/animals/:animalUuid',
	ADD_ANIMAL = '/add-animal',
	EDIT_ANIMAL = '/edit-animal/:animalUuid',
	ADD_HEALTH_RECORD = '/add-health-record/:animalUuid',
	EDIT_HEALTH_RECORD = '/edit-health-record/:animalUuid/:healthRecordUuid',
	ADD_PRODUCTION_RECORD = '/add-production-record/:animalUuid',
	EDIT_PRODUCTION_RECORD = '/edit-production-record/:animalUuid/:productionRecordUuid',
	RELATED_ANIMALS = '/related-animals/:animalUuid',

	// Billing Card
	BILLING_CARD = '/billing-card',
}
