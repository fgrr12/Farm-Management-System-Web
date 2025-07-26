import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'
import 'dayjs/locale/en'

dayjs.extend(relativeTime)

import { AnimalsService } from '@/services/animals'
import { HealthRecordsService } from '@/services/healthRecords'
import { ProductionRecordsService } from '@/services/productionRecords'
import { SpeciesService } from '@/services/species'
import { TasksService } from '@/services/tasks'

import i18n from '@/i18n'

interface DynamicLimits {
	animals: number | null
	healthRecords: number
	productionRecords: number
	tasks: number
	activities: number
	batchSize: number
}

const getOptimalLimits = (animalCount: number): DynamicLimits => {
	if (animalCount < 100) {
		return {
			animals: null,
			healthRecords: 10,
			productionRecords: 10,
			tasks: 20,
			activities: 20,
			batchSize: 10,
		}
	}

	if (animalCount < 500) {
		return {
			animals: 200,
			healthRecords: 8,
			productionRecords: 8,
			tasks: 15,
			activities: 15,
			batchSize: 8,
		}
	}

	return {
		animals: 100,
		healthRecords: 5,
		productionRecords: 5,
		tasks: 10,
		activities: 10,
		batchSize: 5,
	}
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

const formatRelativeTime = (date: string | Date | undefined): string => {
	if (!date) {
		return i18n.t('dashboard:common.timeAgo.justNow')
	}

	const currentLang = i18n.language
	if (currentLang === 'spa') {
		dayjs.locale('es')
	} else {
		dayjs.locale('en')
	}

	return dayjs(date).fromNow()
}

const getDashboardStats = async (farmUuid: string): Promise<DashboardStats> => {
	try {
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

		const limits = getOptimalLimits(animals.length)
		const totalAnimals = animals.length
		const pendingTasks = tasks.filter(
			(task) => task.status === 'todo' || task.status === 'in-progress'
		).length
		const healthyAnimals = animals.filter((animal) => animal.status).length

		const currentMonth = dayjs().month()
		const currentYear = dayjs().year()
		let monthlyProduction = 0

		const animalsToProcess = limits.animals ? animals.slice(0, limits.animals) : animals

		for (let i = 0; i < animalsToProcess.length; i += limits.batchSize) {
			const batch = animalsToProcess.slice(i, i + limits.batchSize)

			const productionPromises = batch.map(async (animal) => {
				const productionRecords = await ProductionRecordsService.getProductionRecords(
					animal.uuid,
					limits.productionRecords
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
			productionChange: undefined,
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

const getDashboardStatsDetailed = async (farmUuid: string): Promise<DashboardStats> => {
	try {
		const animals = await AnimalsService.getAnimals(farmUuid)
		const currentMonth = dayjs().month()
		const currentYear = dayjs().year()
		const previousMonth = dayjs().subtract(1, 'month')

		let monthlyProduction = 0
		let previousMonthProduction = 0

		const batchSize = 10

		for (let i = 0; i < animals.length; i += batchSize) {
			const batch = animals.slice(i, i + batchSize)

			const productionPromises = batch.map(async (animal) => {
				const productionRecords = await ProductionRecordsService.getProductionRecords(animal.uuid)

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
			healthyAnimals: 0,
			pendingTasks: 0,
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
		const limits = getOptimalLimits(animals.length)
		const animalsToProcess = limits.animals ? animals.slice(0, limits.animals) : animals
		const productionData: ProductionData[] = []
		const targetYear = year || dayjs().year()

		for (let month = 0; month < 12; month++) {
			const targetDate = dayjs().year(targetYear).month(month).startOf('month')
			const monthName = targetDate.format('MMM')
			let monthProduction = 0

			for (let i = 0; i < animalsToProcess.length; i += limits.batchSize) {
				const batch = animalsToProcess.slice(i, i + limits.batchSize)

				const batchPromises = batch.map(async (animal) => {
					const productionRecords = await ProductionRecordsService.getProductionRecords(
						animal.uuid,
						limits.productionRecords * 3
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
				value: Math.round(monthProduction * 100) / 100,
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

const checkForHealthIssue = (record: HealthRecord): boolean => {
	const reason = record.reason?.toLowerCase() || ''
	const notes = record.notes?.toLowerCase() || ''

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

	const hasKeywords = healthIssueKeywords.some(
		(keyword) => reason.includes(keyword) || notes.includes(keyword)
	)

	const hasMedication = Boolean(record.medication && record.medication.trim())

	const hasAbnormalTemp = Boolean(
		record.temperature && (record.temperature < 37.5 || record.temperature > 39.5)
	)

	return hasKeywords || hasMedication || hasAbnormalTemp
}

const getHealthOverview = async (farmUuid: string): Promise<HealthOverview> => {
	try {
		const animals = await AnimalsService.getAnimals(farmUuid)
		const limits = getOptimalLimits(animals.length)
		const animalsToProcess = limits.animals ? animals.slice(0, limits.animals) : animals

		let healthy = 0
		let sick = 0
		let inTreatment = 0
		let checkupDue = 0

		for (let i = 0; i < animalsToProcess.length; i += limits.batchSize) {
			const batch = animalsToProcess.slice(i, i + limits.batchSize)

			const batchPromises = batch.map(async (animal) => {
				if (!animal.status) {
					return { sick: 1, healthy: 0, inTreatment: 0, checkupDue: 0 }
				}

				const healthRecords = await HealthRecordsService.getHealthRecords(
					animal.uuid,
					limits.healthRecords
				)

				if (healthRecords.length === 0) {
					return { sick: 0, healthy: 0, inTreatment: 0, checkupDue: 1 }
				}

				const recentRecord = healthRecords[0]
				const recordDate = dayjs(recentRecord.date)
				const daysSinceRecord = dayjs().diff(recordDate, 'days')
				const hasHealthIssue = checkForHealthIssue(recentRecord)

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

				if (daysSinceRecord > 180) {
					return { sick: 0, healthy: 0, inTreatment: 0, checkupDue: 1 }
				}

				return { sick: 0, healthy: 1, inTreatment: 0, checkupDue: 0 }
			})

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
		const limits = getOptimalLimits(animals.length)
		const animalsToProcess = limits.animals ? animals.slice(0, limits.animals) : animals

		const healthRecordsPromise = (async () => {
			const recentHealthRecords: (HealthRecord & { animalId?: string })[] = []

			for (let i = 0; i < animalsToProcess.length; i += limits.batchSize) {
				const batch = animalsToProcess.slice(i, i + limits.batchSize)

				const batchPromises = batch.map(async (animal) => {
					const healthRecords = await HealthRecordsService.getHealthRecords(
						animal.uuid,
						limits.healthRecords
					)
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
				.slice(0, Math.floor(limits.activities * 0.4))
		})()

		const productionRecordsPromise = (async () => {
			const recentProductionRecords: (ProductionRecord & { animalId?: string })[] = []

			for (let i = 0; i < animalsToProcess.length; i += limits.batchSize) {
				const batch = animalsToProcess.slice(i, i + limits.batchSize)

				const batchPromises = batch.map(async (animal) => {
					const productionRecords = await ProductionRecordsService.getProductionRecords(
						animal.uuid,
						limits.productionRecords
					)
					return productionRecords.map((record) => ({
						...record,
						animalId: animal.animalId,
					}))
				})

				const batchResults = await Promise.all(batchPromises)
				recentProductionRecords.push(...batchResults.flat())
			}

			return recentProductionRecords
				.sort((a, b) => dayjs(b.createdAt || b.date).diff(dayjs(a.createdAt || a.date)))
				.slice(0, Math.floor(limits.activities * 0.4))
		})()

		const tasksPromise = TasksService.getTasks({
			farmUuid,
			search: '',
			status: '',
			priority: '',
			speciesUuid: '',
		}).then((tasks) =>
			tasks
				.sort((a, b) => dayjs(b.updatedAt || b.createdAt).diff(dayjs(a.updatedAt || a.createdAt)))
				.slice(0, Math.floor(limits.activities * 0.2))
		)

		const [healthRecords, productionRecords, recentTasks] = await Promise.all([
			healthRecordsPromise,
			productionRecordsPromise,
			tasksPromise,
		])

		const activitiesWithDates: (RecentActivity & { rawDate: string })[] = []

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

		return activitiesWithDates
			.sort((a, b) => dayjs(b.rawDate).diff(dayjs(a.rawDate)))
			.slice(0, 20)
			.map(({ rawDate, ...activity }) => activity)
	} catch (error) {
		console.error('Error getting recent activities:', error)
		return []
	}
}

const getDashboardQuickStats = async (farmUuid: string): Promise<Partial<DashboardStats>> => {
	try {
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
			healthyAnimals: animals.filter((animal) => animal.status).length,
			pendingTasks: tasks.filter((task) => task.status === 'todo' || task.status === 'in-progress')
				.length,
			monthlyProduction: 0,
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

const loadDashboardPhase2 = async (farmUuid: string) => {
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
	getDashboardStats,
	getDashboardStatsDetailed,
	getProductionData,
	getAnimalDistribution,
	getHealthOverview,
	getTasksOverview,
	getRecentActivities,
	getDashboardQuickStats,
	loadDashboardPhase2,
	loadDashboardPhase3,
}
