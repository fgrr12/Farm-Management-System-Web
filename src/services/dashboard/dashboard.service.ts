import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'
import 'dayjs/locale/en'

// Enable relative time plugin for dayjs
dayjs.extend(relativeTime)

import { AnimalsService } from '@/services/animals'
import { HealthRecordsService } from '@/services/healthRecords'
import { ProductionRecordsService } from '@/services/productionRecords'
import { SpeciesService } from '@/services/species'
import { TasksService } from '@/services/tasks'

import i18n from '@/i18n'

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

// Helper function to format relative time with translations
const formatRelativeTime = (date: string | Date | undefined): string => {
	if (!date) {
		return i18n.t('dashboard:common.timeAgo.justNow')
	}

	const currentLang = i18n.language

	// Set dayjs locale based on current language
	if (currentLang === 'spa') {
		dayjs.locale('es')
	} else {
		dayjs.locale('en')
	}

	return dayjs(date).fromNow()
}

const getDashboardStats = async (farmUuid: string): Promise<DashboardStats> => {
	try {
		// Get basic data in parallel for fast initial load
		const [animals, tasks] = await Promise.all([
			AnimalsService.getAnimals(farmUuid),
			TasksService.getTasks({
				farmUuid,
				search: '',
				status: '',
				priority: '',
				speciesUuid: '',
			}),
		])

		const totalAnimals = animals.length
		const pendingTasks = tasks.filter(
			(task) => task.status === 'todo' || task.status === 'in-progress'
		).length

		// Quick health calculation - just count active animals as healthy for initial load
		// The detailed health overview will be loaded separately in phase 2
		const healthyAnimals = animals.filter((animal) => animal.status).length

		// Simplified production calculation for faster initial load
		const currentMonth = dayjs().month()
		const currentYear = dayjs().year()
		let monthlyProduction = 0

		// Process only first 20 animals for quick stats
		const limitedAnimals = animals.slice(0, 20)
		const batchSize = 5

		for (let i = 0; i < limitedAnimals.length; i += batchSize) {
			const batch = limitedAnimals.slice(i, i + batchSize)

			const productionPromises = batch.map(async (animal) => {
				// Limit to last 30 records for current month only
				const productionRecords = await ProductionRecordsService.getProductionRecords(
					animal.uuid,
					30
				)

				const monthlyRecords = productionRecords.filter((record) => {
					const recordDate = dayjs(record.date)
					return recordDate.month() === currentMonth && recordDate.year() === currentYear
				})

				return monthlyRecords.reduce((sum, record) => sum + (record.quantity || 0), 0)
			})

			const batchResults = await Promise.all(productionPromises)
			monthlyProduction += batchResults.reduce((sum, value) => sum + value, 0)
		}

		return {
			totalAnimals,
			healthyAnimals,
			pendingTasks,
			monthlyProduction,
			animalsChange: undefined,
			healthChange: undefined,
			tasksChange: undefined,
			productionChange: undefined, // Will be calculated in detailed load
		}
	} catch (error) {
		console.error('Error getting dashboard stats:', error)
		return {
			totalAnimals: 0,
			healthyAnimals: 0,
			pendingTasks: 0,
			monthlyProduction: 0,
			animalsChange: undefined,
			healthChange: undefined,
			tasksChange: undefined,
			productionChange: undefined,
		}
	}
}

// Enhanced stats with production change calculation (for secondary load)
const getDashboardStatsDetailed = async (farmUuid: string): Promise<DashboardStats> => {
	try {
		const animals = await AnimalsService.getAnimals(farmUuid)
		const currentMonth = dayjs().month()
		const currentYear = dayjs().year()
		const previousMonth = dayjs().subtract(1, 'month')

		let monthlyProduction = 0
		let previousMonthProduction = 0

		// Process more animals for detailed calculation
		const limitedAnimals = animals.slice(0, 50)
		const batchSize = 10

		for (let i = 0; i < limitedAnimals.length; i += batchSize) {
			const batch = limitedAnimals.slice(i, i + batchSize)

			const productionPromises = batch.map(async (animal) => {
				const productionRecords = await ProductionRecordsService.getProductionRecords(
					animal.uuid,
					60
				)

				const monthlyRecords = productionRecords.filter((record) => {
					const recordDate = dayjs(record.date)
					return recordDate.month() === currentMonth && recordDate.year() === currentYear
				})

				const previousMonthRecords = productionRecords.filter((record) => {
					const recordDate = dayjs(record.date)
					return (
						recordDate.month() === previousMonth.month() &&
						recordDate.year() === previousMonth.year()
					)
				})

				return {
					monthly: monthlyRecords.reduce((sum, record) => sum + (record.quantity || 0), 0),
					previous: previousMonthRecords.reduce((sum, record) => sum + (record.quantity || 0), 0),
				}
			})

			const batchResults = await Promise.all(productionPromises)

			batchResults.forEach((result) => {
				monthlyProduction += result.monthly
				previousMonthProduction += result.previous
			})
		}

		const productionChange =
			previousMonthProduction > 0
				? Math.round(
						((monthlyProduction - previousMonthProduction) / previousMonthProduction) * 100
					)
				: undefined

		return {
			totalAnimals: animals.length,
			healthyAnimals: 0, // Will be updated by health overview
			pendingTasks: 0, // Will be updated by tasks overview
			monthlyProduction,
			animalsChange: undefined,
			healthChange: undefined,
			tasksChange: undefined,
			productionChange,
		}
	} catch (error) {
		console.error('Error getting detailed dashboard stats:', error)
		return {
			totalAnimals: 0,
			healthyAnimals: 0,
			pendingTasks: 0,
			monthlyProduction: 0,
			animalsChange: undefined,
			healthChange: undefined,
			tasksChange: undefined,
			productionChange: undefined,
		}
	}
}

const getProductionData = async (farmUuid: string, year?: number): Promise<ProductionData[]> => {
	try {
		const animals = await AnimalsService.getAnimals(farmUuid)
		const productionData: ProductionData[] = []

		// Get 12 months of data starting from January of the target year
		const targetYear = year || dayjs().year()

		// Limit to first 30 animals for performance
		const limitedAnimals = animals.slice(0, 30)

		for (let month = 0; month < 12; month++) {
			const targetDate = dayjs().year(targetYear).month(month).startOf('month')
			const monthName = targetDate.format('MMM')
			let monthProduction = 0

			// Process animals in batches
			const batchSize = 5
			for (let i = 0; i < limitedAnimals.length; i += batchSize) {
				const batch = limitedAnimals.slice(i, i + batchSize)

				const batchPromises = batch.map(async (animal) => {
					// Limit to last 365 records (should cover the year)
					const productionRecords = await ProductionRecordsService.getProductionRecords(
						animal.uuid,
						365
					)
					const monthlyRecords = productionRecords.filter((record) => {
						const recordDate = dayjs(record.date)
						return recordDate.month() === month && recordDate.year() === targetYear
					})
					return monthlyRecords.reduce((sum, record) => sum + (record.quantity || 0), 0)
				})

				const batchResults = await Promise.all(batchPromises)
				monthProduction += batchResults.reduce((sum, value) => sum + value, 0)
			}

			productionData.push({
				month: monthName,
				value: Math.round(monthProduction * 100) / 100, // Round to 2 decimal places
			})
		}

		return productionData
	} catch (error) {
		console.error('Error getting production data:', error)
		return []
	}
}

const getAnimalDistribution = async (farmUuid: string): Promise<AnimalDistribution[]> => {
	try {
		const animals = await AnimalsService.getAnimals(farmUuid)
		const species = await SpeciesService.getAllSpecies(farmUuid)

		const distribution: Record<string, number> = {}

		for (const animal of animals) {
			const animalSpecies = species.find((s) => s.uuid === animal.speciesUuid)
			const speciesName = animalSpecies?.name || 'Unknown'
			distribution[speciesName] = (distribution[speciesName] || 0) + 1
		}

		return Object.entries(distribution).map(([species, count]) => ({
			species,
			count,
		}))
	} catch (error) {
		console.error('Error getting animal distribution:', error)
		return []
	}
}

// Helper function to detect health issues in records
const checkForHealthIssue = (record: HealthRecord): boolean => {
	// Check reason field for health problems
	const reason = record.reason?.toLowerCase() || ''
	const notes = record.notes?.toLowerCase() || ''

	// Keywords that indicate health problems
	const healthIssueKeywords = [
		'problema',
		'enfermo',
		'enfermedad',
		'dolor',
		'infección',
		'lesión',
		'herida',
		'cojera',
		'fiebre',
		'diarrea',
		'tos',
		'respiratorio',
		'corazón',
		'cardíaco',
		'hígado',
		'riñón',
		'digestivo',
		'mastitis',
		'problem',
		'sick',
		'disease',
		'pain',
		'infection',
		'injury',
		'wound',
		'lameness',
		'fever',
		'diarrhea',
		'cough',
		'respiratory',
		'heart',
		'cardiac',
		'liver',
		'kidney',
		'digestive',
		'illness',
	]

	// Check if reason or notes contain health issue keywords
	const hasKeywords = healthIssueKeywords.some(
		(keyword) => reason.includes(keyword) || notes.includes(keyword)
	)

	// Check if medication is prescribed (indicates treatment needed)
	const hasMedication = Boolean(record.medication && record.medication.trim())

	// Check for abnormal temperature (normal range: 38-39°C for cattle)
	const hasAbnormalTemp = Boolean(
		record.temperature && (record.temperature < 37.5 || record.temperature > 39.5)
	)

	return hasKeywords || hasMedication || hasAbnormalTemp
}

const getHealthOverview = async (farmUuid: string): Promise<HealthOverview> => {
	try {
		const animals = await AnimalsService.getAnimals(farmUuid)

		// Initialize counters
		let healthy = 0
		let sick = 0
		let inTreatment = 0
		let checkupDue = 0

		// Process animals in batches for better performance
		const batchSize = 10
		const limitedAnimals = animals.slice(0, 100) // Limit to first 100 animals for performance

		for (let i = 0; i < limitedAnimals.length; i += batchSize) {
			const batch = limitedAnimals.slice(i, i + batchSize)

			// Process batch in parallel
			const batchPromises = batch.map(async (animal) => {
				if (!animal.status) {
					return { sick: 1, healthy: 0, inTreatment: 0, checkupDue: 0 }
				}

				// Get only the most recent health record for performance
				const healthRecords = await HealthRecordsService.getHealthRecords(animal.uuid, 1)

				if (healthRecords.length === 0) {
					return { sick: 0, healthy: 0, inTreatment: 0, checkupDue: 1 }
				}

				const recentRecord = healthRecords[0]
				const recordDate = dayjs(recentRecord.date)
				const daysSinceRecord = dayjs().diff(recordDate, 'days')

				// Simplified health status logic for better performance
				const hasHealthIssue = checkForHealthIssue(recentRecord)

				// Quick categorization based on record type and age
				if (recentRecord.type === 'Medication' || recentRecord.type === 'Surgery') {
					return daysSinceRecord <= 30
						? { sick: 0, healthy: 0, inTreatment: 1, checkupDue: 0 }
						: { sick: 0, healthy: 1, inTreatment: 0, checkupDue: 0 }
				}

				if (recentRecord.type === 'Checkup') {
					if (hasHealthIssue) {
						return recentRecord.medication
							? { sick: 0, healthy: 0, inTreatment: 1, checkupDue: 0 }
							: { sick: 1, healthy: 0, inTreatment: 0, checkupDue: 0 }
					}
					return daysSinceRecord > 180
						? { sick: 0, healthy: 0, inTreatment: 0, checkupDue: 1 }
						: { sick: 0, healthy: 1, inTreatment: 0, checkupDue: 0 }
				}

				// Default categorization for other types
				if (daysSinceRecord > 180) {
					return { sick: 0, healthy: 0, inTreatment: 0, checkupDue: 1 }
				}

				return { sick: 0, healthy: 1, inTreatment: 0, checkupDue: 0 }
			})

			// Wait for batch to complete and aggregate results
			const batchResults = await Promise.all(batchPromises)

			batchResults.forEach((result) => {
				healthy += result.healthy
				sick += result.sick
				inTreatment += result.inTreatment
				checkupDue += result.checkupDue
			})
		}

		return {
			healthy,
			sick,
			inTreatment,
			checkupDue,
		}
	} catch (error) {
		console.error('Error getting health overview:', error)
		return {
			healthy: 0,
			sick: 0,
			inTreatment: 0,
			checkupDue: 0,
		}
	}
}

const getTasksOverview = async (farmUuid: string): Promise<TasksOverview> => {
	try {
		const tasks = await TasksService.getTasks({
			farmUuid,
			search: '',
			status: '',
			priority: '',
			speciesUuid: '',
		})

		const pending = tasks.filter((task) => task.status === 'todo').length
		const inProgress = tasks.filter((task) => task.status === 'in-progress').length
		const completed = tasks.filter((task) => task.status === 'done').length

		return {
			pending,
			inProgress,
			completed,
		}
	} catch (error) {
		console.error('Error getting tasks overview:', error)
		return {
			pending: 0,
			inProgress: 0,
			completed: 0,
		}
	}
}

const getRecentActivities = async (farmUuid: string): Promise<RecentActivity[]> => {
	try {
		const animals = await AnimalsService.getAnimals(farmUuid)

		// Limit to first 15 animals for better performance
		const limitedAnimals = animals.slice(0, 15)

		// Get recent health records in parallel batches
		const healthRecordsPromise = (async () => {
			const batchSize = 5
			const recentHealthRecords: (HealthRecord & { animalId?: string })[] = []

			for (let i = 0; i < limitedAnimals.length; i += batchSize) {
				const batch = limitedAnimals.slice(i, i + batchSize)

				const batchPromises = batch.map(async (animal) => {
					const healthRecords = await HealthRecordsService.getHealthRecords(animal.uuid, 1)
					return healthRecords.map((record) => ({
						...record,
						animalId: animal.animalId,
					}))
				})

				const batchResults = await Promise.all(batchPromises)
				recentHealthRecords.push(...batchResults.flat())
			}

			return recentHealthRecords
				.sort((a, b) => dayjs(b.createdAt || b.date).diff(dayjs(a.createdAt || a.date)))
				.slice(0, 3) // Reduced from 4 to 3
		})()

		// Get recent production records in parallel
		const productionRecordsPromise = (async () => {
			const recentProductionRecords: (ProductionRecord & { animalId?: string })[] = []

			// Process only first 8 animals for production records
			const productionAnimals = limitedAnimals.slice(0, 8)

			const productionPromises = productionAnimals.map(async (animal) => {
				const productionRecords = await ProductionRecordsService.getProductionRecords(
					animal.uuid,
					1
				)
				return productionRecords.map((record) => ({
					...record,
					animalId: animal.animalId,
				}))
			})

			const results = await Promise.all(productionPromises)
			recentProductionRecords.push(...results.flat())

			return recentProductionRecords
				.sort((a, b) => dayjs(b.createdAt || b.date).diff(dayjs(a.createdAt || a.date)))
				.slice(0, 2) // Reduced from 3 to 2
		})()

		// Get recent tasks
		const tasksPromise = TasksService.getTasks({
			farmUuid,
			search: '',
			status: '',
			priority: '',
			speciesUuid: '',
		}).then(
			(tasks) =>
				tasks
					.sort((a, b) => dayjs(b.updatedAt || b.createdAt).diff(dayjs(a.updatedAt || a.createdAt)))
					.slice(0, 2) // Reduced from 3 to 2
		)

		// Wait for all data in parallel
		const [healthRecords, productionRecords, recentTasks] = await Promise.all([
			healthRecordsPromise,
			productionRecordsPromise,
			tasksPromise,
		])

		// Create activities with raw dates for proper sorting
		const activitiesWithDates: (RecentActivity & { rawDate: string })[] = []

		// Process health records
		healthRecords.forEach((record) => {
			const typeEmojiMap: Record<string, string> = {
				Checkup: '🩺',
				Vaccination: '💉',
				Medication: '💊',
				Surgery: '🏥',
				Pregnancy: '🤱',
				Birth: '🐄',
				Deworming: '🪱',
				Drying: '🥛',
			}
			const typeEmoji = typeEmojiMap[record.type] || '📋'

			const translatedType = i18n.t(`dashboard:activities.healthTypes.${record.type}`, {
				defaultValue: record.type,
			})

			activitiesWithDates.push({
				type: 'health_record',
				title: `${typeEmoji} ${translatedType}`,
				description: `${record.animalId || 'Unknown Animal'} - ${record.reason || i18n.t('dashboard:activities.descriptions.healthRecordUpdated')}`,
				time: formatRelativeTime(record.createdAt || record.date),
				user: i18n.t('dashboard:activities.descriptions.farmStaff'),
				rawDate: record.createdAt || record.date || dayjs().toISOString(),
			})
		})

		// Process production records
		productionRecords.forEach((record) => {
			activitiesWithDates.push({
				type: 'production_record',
				title: `🥛 ${i18n.t('dashboard:activities.types.productionRecord')}`,
				description: `${record.animalId || 'Unknown Animal'} - ${record.quantity}L ${i18n.t('dashboard:activities.descriptions.productionRecorded')}`,
				time: formatRelativeTime(record.createdAt || record.date),
				user: i18n.t('dashboard:activities.descriptions.farmStaff'),
				rawDate: record.createdAt || record.date || dayjs().toISOString(),
			})
		})

		// Process tasks
		recentTasks.forEach((task) => {
			const statusEmojiMap: Record<string, string> = {
				todo: '⏳',
				'in-progress': '🔄',
				done: '✅',
				archived: '📦',
			}
			const statusEmoji = statusEmojiMap[task.status] || '📋'

			const statusTextMap: Record<string, string> = {
				todo: 'taskCreated',
				'in-progress': 'taskStarted',
				done: 'taskCompleted',
				archived: 'taskArchived',
			}
			const statusKey = statusTextMap[task.status] || 'taskUpdated'
			const statusText = i18n.t(`dashboard:activities.types.${statusKey}`)

			activitiesWithDates.push({
				type: `task_${task.status}`,
				title: `${statusEmoji} ${statusText}`,
				description: task.title,
				time: formatRelativeTime(task.updatedAt || task.createdAt),
				user: i18n.t('dashboard:activities.descriptions.farmStaff'),
				rawDate: task.updatedAt || task.createdAt || dayjs().toISOString(),
			})
		})

		// Sort by actual dates (most recent first) and return top 8
		return activitiesWithDates
			.sort((a, b) => dayjs(b.rawDate).diff(dayjs(a.rawDate)))
			.slice(0, 8)
			.map(({ rawDate, ...activity }) => activity) // Remove rawDate from final result
	} catch (error) {
		console.error('Error getting recent activities:', error)
		return []
	}
}

// Fast initial load - only essential data
const getDashboardQuickStats = async (farmUuid: string): Promise<Partial<DashboardStats>> => {
	try {
		// Get only the most basic data for instant loading
		const [animals, tasks] = await Promise.all([
			AnimalsService.getAnimals(farmUuid),
			TasksService.getTasks({
				farmUuid,
				search: '',
				status: '',
				priority: '',
				speciesUuid: '',
			}),
		])

		return {
			totalAnimals: animals.length,
			healthyAnimals: animals.filter((animal) => animal.status).length, // Simple active count
			pendingTasks: tasks.filter((task) => task.status === 'todo' || task.status === 'in-progress')
				.length,
			monthlyProduction: 0, // Will be loaded in phase 2
		}
	} catch (error) {
		console.error('Error getting quick dashboard stats:', error)
		return {
			totalAnimals: 0,
			healthyAnimals: 0,
			pendingTasks: 0,
			monthlyProduction: 0,
		}
	}
}

// Progressive loading phases
const loadDashboardPhase2 = async (farmUuid: string) => {
	// Load production data and health overview in parallel
	const [productionStats, healthOverview, tasksOverview] = await Promise.all([
		getDashboardStatsDetailed(farmUuid),
		getHealthOverview(farmUuid),
		getTasksOverview(farmUuid),
	])

	return {
		productionStats,
		healthOverview,
		tasksOverview,
	}
}

const loadDashboardPhase3 = async (farmUuid: string, year?: number) => {
	// Load charts and distribution data
	const [productionData, animalDistribution, recentActivities] = await Promise.all([
		getProductionData(farmUuid, year),
		getAnimalDistribution(farmUuid),
		getRecentActivities(farmUuid),
	])

	return {
		productionData,
		animalDistribution,
		recentActivities,
	}
}

export const DashboardService = {
	// Original methods for backward compatibility
	getDashboardStats,
	getDashboardStatsDetailed,
	getProductionData,
	getAnimalDistribution,
	getHealthOverview,
	getTasksOverview,
	getRecentActivities,

	// New progressive loading methods
	getDashboardQuickStats,
	loadDashboardPhase2,
	loadDashboardPhase3,
}
