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

/** One entry in the farm-wide activity feed (see ActivityFeed page) — kept mostly raw so the
 *  frontend can translate and format it the same way it already does for the underlying record types. */
export interface FarmActivityItem {
	id: string
	kind: 'health' | 'production' | 'task'
	date: string
	animalUuid?: string
	animalId?: string
	userUuid?: string
	healthType?: string
	reason?: string
	quantity?: number
	title?: string
	taskStatus?: string
}
