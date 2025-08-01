// Dashboard optimization types - Global types for dashboard functionality

interface DynamicLimits {
	animals: number | null
	healthRecords: number
	productionRecords: number
	tasks: number
	activities: number
	batchSize: number
}

interface DashboardStats {
	totalAnimals: number
	healthyAnimals: number
	pendingTasks: number
	monthlyProduction: number
	animalsChange?: number
	healthChange?: number
	tasksChange?: number
	productionChange?: number
}

interface ProductionData {
	month: string
	value: number
}

interface AnimalDistribution {
	species: string
	count: number
}

interface HealthOverview {
	healthy: number
	sick: number
	inTreatment: number
	checkupDue: number
}

interface TasksOverview {
	pending: number
	inProgress: number
	completed: number
}

interface RecentActivity {
	type: string
	title: string
	description: string
	time: string
	user: string
}

interface DashboardPhase2Data {
	productionStats: DashboardStats
	healthOverview: HealthOverview
	tasksOverview: TasksOverview
}

interface DashboardPhase3Data {
	productionData: ProductionData[]
	animalDistribution: AnimalDistribution[]
	recentActivities: RecentActivity[]
}
