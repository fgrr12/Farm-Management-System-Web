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
		// Get animals
		const animals = await AnimalsService.getAnimals(farmUuid)
		const totalAnimals = animals.length

		// Use the improved health overview to get accurate healthy count
		const healthOverview = await getHealthOverview(farmUuid)
		const healthyAnimals = healthOverview.healthy

		// Get tasks
		const tasks = await TasksService.getTasks({
			farmUuid,
			search: '',
			status: '',
			priority: '',
			speciesUuid: '',
		})
		const pendingTasks = tasks.filter((task) => task.status === 'todo').length

		// Get production records for current month
		const currentMonth = dayjs().month()
		const currentYear = dayjs().year()

		let monthlyProduction = 0
		for (const animal of animals) {
			const productionRecords = await ProductionRecordsService.getProductionRecords(animal.uuid)
			const monthlyRecords = productionRecords.filter((record) => {
				const recordDate = dayjs(record.date)
				return recordDate.month() === currentMonth && recordDate.year() === currentYear
			})
			monthlyProduction += monthlyRecords.reduce((sum, record) => sum + (record.quantity || 0), 0)
		}

		// Calculate percentage changes compared to previous month
		const previousMonth = dayjs().subtract(1, 'month')
		let previousMonthProduction = 0

		for (const animal of animals) {
			const productionRecords = await ProductionRecordsService.getProductionRecords(animal.uuid)
			const previousMonthRecords = productionRecords.filter((record) => {
				const recordDate = dayjs(record.date)
				return (
					recordDate.month() === previousMonth.month() && recordDate.year() === previousMonth.year()
				)
			})
			previousMonthProduction += previousMonthRecords.reduce(
				(sum, record) => sum + (record.quantity || 0),
				0
			)
		}

		const productionChange =
			previousMonthProduction > 0
				? Math.round(
						((monthlyProduction - previousMonthProduction) / previousMonthProduction) * 100
					)
				: undefined

		return {
			totalAnimals,
			healthyAnimals,
			pendingTasks,
			monthlyProduction,
			animalsChange: undefined, // Could be calculated if we track historical animal counts
			healthChange: undefined, // Could be calculated if we track historical health data
			tasksChange: undefined, // Could be calculated if we track historical task data
			productionChange,
		}
	} catch (error) {
		console.error('Error getting dashboard stats:', error)
		// Return empty data on error
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

		for (let month = 0; month < 12; month++) {
			const targetDate = dayjs().year(targetYear).month(month).startOf('month')
			const monthName = targetDate.format('MMM')
			let monthProduction = 0

			for (const animal of animals) {
				const productionRecords = await ProductionRecordsService.getProductionRecords(animal.uuid)
				const monthlyRecords = productionRecords.filter((record) => {
					const recordDate = dayjs(record.date)
					return recordDate.month() === month && recordDate.year() === targetYear
				})
				monthProduction += monthlyRecords.reduce((sum, record) => sum + (record.quantity || 0), 0)
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

		// Analyze each animal's health status
		for (const animal of animals) {
			if (!animal.status) {
				// Animal is inactive/dead - count as sick
				sick++
				continue
			}

			// Get recent health records for this animal
			const healthRecords = await HealthRecordsService.getHealthRecords(animal.uuid)

			if (healthRecords.length === 0) {
				// No health records - needs checkup
				checkupDue++
				continue
			}

			// Get the most recent health record
			const recentRecord = healthRecords[0] // Already sorted by date in service
			const recordDate = dayjs(recentRecord.date)
			const daysSinceRecord = dayjs().diff(recordDate, 'days')

			// Check if the record indicates a health problem
			const hasHealthIssue = checkForHealthIssue(recentRecord)

			// Determine health status based on recent records
			if (recentRecord.type === 'Medication' || recentRecord.type === 'Surgery') {
				// Animal is receiving medical treatment
				if (daysSinceRecord <= 30) {
					inTreatment++
				} else {
					healthy++ // Treatment completed
				}
			} else if (recentRecord.type === 'Pregnancy') {
				// Pregnant animals need special monitoring
				if (daysSinceRecord <= 280) {
					inTreatment++ // Needs monitoring during pregnancy
				} else {
					healthy++ // Post-pregnancy
				}
			} else if (recentRecord.type === 'Birth') {
				// Recent birth - needs monitoring
				if (daysSinceRecord <= 30) {
					inTreatment++ // Post-birth monitoring
				} else {
					healthy++
				}
			} else if (recentRecord.type === 'Checkup') {
				// Analyze checkup results
				if (hasHealthIssue) {
					// Checkup revealed health problems
					if (recentRecord.medication) {
						inTreatment++ // Has prescribed medication
					} else {
						sick++ // Health issue but no treatment yet
					}
				} else if (daysSinceRecord > 180) {
					checkupDue++ // Checkup too old
				} else {
					healthy++ // Recent clean checkup
				}
			} else if (recentRecord.type === 'Vaccination' || recentRecord.type === 'Deworming') {
				// Preventive care
				if (daysSinceRecord > 365) {
					checkupDue++ // Needs renewal
				} else {
					healthy++ // Up to date
				}
			} else if (recentRecord.type === 'Drying') {
				// Drying period for dairy animals
				if (daysSinceRecord <= 60) {
					inTreatment++ // In drying period
				} else {
					healthy++ // Drying completed
				}
			} else {
				// Fallback - check if needs general checkup
				if (daysSinceRecord > 90) {
					checkupDue++
				} else {
					healthy++
				}
			}
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
		const activities: RecentActivity[] = []
		const animals = await AnimalsService.getAnimals(farmUuid)

		// Get recent health records from all animals
		const recentHealthRecords: (HealthRecord & { animalId?: string })[] = []

		// Process animals in batches for better performance
		const batchSize = 10
		for (let i = 0; i < animals.length; i += batchSize) {
			const batch = animals.slice(i, i + batchSize)

			const batchPromises = batch.map(async (animal) => {
				const healthRecords = await HealthRecordsService.getHealthRecords(animal.uuid)
				return healthRecords.slice(0, 1).map((record) => ({
					...record,
					animalId: animal.animalId,
				}))
			})

			const batchResults = await Promise.all(batchPromises)
			recentHealthRecords.push(...batchResults.flat())
		}

		// Sort and get most recent health records
		recentHealthRecords
			.sort((a, b) => dayjs(b.createdAt || b.date).diff(dayjs(a.createdAt || a.date)))
			.slice(0, 4)
			.forEach((record) => {
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

				// Get translated health type
				const translatedType = i18n.t(`dashboard:activities.healthTypes.${record.type}`, {
					defaultValue: record.type,
				})

				activities.push({
					type: 'health_record',
					title: `${typeEmoji} ${translatedType}`,
					description: `${record.animalId || 'Unknown Animal'} - ${record.reason || i18n.t('dashboard:activities.descriptions.healthRecordUpdated')}`,
					time: formatRelativeTime(record.createdAt || record.date),
					user: i18n.t('dashboard:activities.descriptions.farmStaff'),
				})
			})

		// Get recent production records
		const recentProductionRecords: (ProductionRecord & { animalId?: string })[] = []

		for (let i = 0; i < Math.min(animals.length, 15); i++) {
			const animal = animals[i]
			const productionRecords = await ProductionRecordsService.getProductionRecords(animal.uuid)
			recentProductionRecords.push(
				...productionRecords.slice(0, 1).map((record) => ({
					...record,
					animalId: animal.animalId,
				}))
			)
		}

		recentProductionRecords
			.sort((a, b) => dayjs(b.createdAt || b.date).diff(dayjs(a.createdAt || a.date)))
			.slice(0, 3)
			.forEach((record) => {
				activities.push({
					type: 'production_record',
					title: `🥛 ${i18n.t('dashboard:activities.types.productionRecord')}`,
					description: `${record.animalId || 'Unknown Animal'} - ${record.quantity}L ${i18n.t('dashboard:activities.descriptions.productionRecorded')}`,
					time: formatRelativeTime(record.createdAt || record.date),
					user: i18n.t('dashboard:activities.descriptions.farmStaff'),
				})
			})

		// Get recent tasks (all statuses for better activity feed)
		const tasks = await TasksService.getTasks({
			farmUuid,
			search: '',
			status: '',
			priority: '',
			speciesUuid: '',
		})

		const recentTasks = tasks
			.sort((a, b) => dayjs(b.updatedAt || b.createdAt).diff(dayjs(a.updatedAt || a.createdAt)))
			.slice(0, 3)

		recentTasks.forEach((task) => {
			const statusEmojiMap: Record<string, string> = {
				PENDING: '⏳',
				IN_PROGRESS: '🔄',
				COMPLETED: '✅',
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

			activities.push({
				type: `task_${task.status}`,
				title: `${statusEmoji} ${statusText}`,
				description: task.title,
				time: formatRelativeTime(task.updatedAt || task.createdAt),
				user: i18n.t('dashboard:activities.descriptions.farmStaff'),
			})
		})

		// Sort all activities by most recent and return top 10
		return activities
			.sort((a, b) => {
				// Extract the actual date from the time string for proper sorting
				const timeA = a.time.includes('ago') ? dayjs().subtract(1, 'day') : dayjs()
				const timeB = b.time.includes('ago') ? dayjs().subtract(1, 'day') : dayjs()
				return timeB.diff(timeA)
			})
			.slice(0, 10)
	} catch (error) {
		console.error('Error getting recent activities:', error)
		return []
	}
}

export const DashboardService = {
	getDashboardStats,
	getProductionData,
	getAnimalDistribution,
	getHealthOverview,
	getTasksOverview,
	getRecentActivities,
}
