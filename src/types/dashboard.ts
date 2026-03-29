export interface DynamicLimits {
	animals: number | null
	healthRecords: number
	productionRecords: number
	tasks: number
	activities: number
	batchSize: number
}

export interface DashboardStats {
	totalAnimals: number
	healthyAnimals: number
	pendingTasks: number
	monthlyProduction: number
	animalsChange?: number
	healthChange?: number
	tasksChange?: number
	productionChange?: number
}

export interface ProductionData {
	month: string
	value: number
}

export interface AnimalDistribution {
	species: string
	count: number
}

export interface HealthOverview {
	healthy: number
	sick: number
	inTreatment: number
	checkupDue: number
}

export interface TasksOverview {
	pending: number
	inProgress: number
	completed: number
}

export interface RecentActivity {
	type: string
	title: string
	description: string
	time: string
	user: string
}

export interface DashboardPhase2Data {
	productionStats: DashboardStats
	healthOverview: HealthOverview
	tasksOverview: TasksOverview
}

export interface DashboardPhase3Data {
	productionData: ProductionData[]
	animalDistribution: AnimalDistribution[]
	recentActivities: RecentActivity[]
}
