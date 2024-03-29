export enum AppRoutes {
	DASHBOARD = '/',
	LOGIN = '/login',
	REGISTER = '/register',
	CHANGE_PASSWORD = '/change-password',
}

export enum HomeRoutes {
	INCOMES = '/incomes',
	EXPENSES = '/expenses',
	PROFILE = '/profile/:uuid',
	SETTINGS = '/profile/:uuid/settings',
}
