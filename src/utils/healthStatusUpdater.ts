import { AnimalsService } from '@/services/animals'

/**
 * Updates an animal's health status based on health records or manual override
 */
export const updateAnimalHealthStatus = async (
	animalUuid: string,
	newHealthRecord?: HealthRecord,
	manualStatus?: HealthStatus
): Promise<HealthStatus> => {
	if (manualStatus) {
		// If set manually, use that value
		await AnimalsService.updateAnimalFields(animalUuid, { healthStatus: manualStatus })
		return manualStatus
	}

	// Get the animal with its health records
	const animal = await AnimalsService.getAnimal(animalUuid)
	const healthRecords = animal.healthRecords || []

	// Calculate new status based on records and animal status
	const newStatus = calculateHealthStatusFromRecords(healthRecords, newHealthRecord, animal)

	// Update in database
	await AnimalsService.updateAnimalFields(animalUuid, { healthStatus: newStatus })

	return newStatus
}

/**
 * Calculates health status based on health records and animal status
 */
export const calculateHealthStatusFromRecords = (
	existingRecords: HealthRecord[],
	newRecord?: HealthRecord,
	animal?: Partial<Animal>
): HealthStatus => {
	// Check if animal is sold or dead first
	if (animal?.soldDate) {
		return 'unknown' // Sold animals don't have active health status
	}

	if (animal?.deathDate) {
		return 'unknown' // Dead animals don't have active health status
	}

	const allRecords = newRecord ? [...existingRecords, newRecord] : existingRecords

	if (allRecords.length === 0) return 'unknown'

	// Sort by most recent date
	const sortedRecords = allRecords
		.filter((record) => record.status) // Only active records
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

	if (sortedRecords.length === 0) return 'unknown'

	const latestRecord = sortedRecords[0]
	const daysSince = Math.floor(
		(Date.now() - new Date(latestRecord.date).getTime()) / (1000 * 60 * 60 * 24)
	)

	return determineHealthStatusFromRecord(latestRecord, daysSince, sortedRecords)
}

/**
 * Checks for health issues in a health record
 */
const checkForHealthIssuesInRecord = (record: HealthRecord): boolean => {
	const reason = record.reason?.toLowerCase() || ''
	const notes = record.notes?.toLowerCase() || ''

	// Keywords that indicate health issues (Spanish and English)
	const healthIssueKeywords = [
		// Spanish
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
		'anormal',
		'síntoma',
		'malestar',
		'debilidad',
		'pérdida',
		'sangre',
		// English
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
		'abnormal',
		'symptom',
		'discomfort',
		'weakness',
		'loss',
		'blood',
	]

	// Check for keywords in reason or notes
	const hasKeywords = healthIssueKeywords.some(
		(keyword) => reason.includes(keyword) || notes.includes(keyword)
	)

	// Check for medication (indicates treatment needed)
	const hasMedication = Boolean(record.medication && record.medication.trim())

	// Check for abnormal temperature
	const hasAbnormalTemp = Boolean(
		record.temperature && (record.temperature < 37.5 || record.temperature > 39.5)
	)

	// Check for abnormal weight (significant loss could indicate issues)
	// This would need historical comparison, but for now we skip it

	return hasKeywords || hasMedication || hasAbnormalTemp
}

/**
 * Determines health status from the latest health record
 */
const determineHealthStatusFromRecord = (
	latestRecord: HealthRecord,
	daysSince: number,
	_allRecords: HealthRecord[]
): HealthStatus => {
	// Critical conditions (highest priority)
	if (latestRecord.type === 'Surgery' && daysSince <= 7) {
		return 'critical'
	}

	// Check for abnormal temperature (critical if very high/low)
	if (latestRecord.temperature) {
		const temp = latestRecord.temperature
		if (temp > 41.0 || temp < 36.0) {
			return 'critical'
		}
		if (temp > 39.5 || temp < 37.5) {
			return 'sick'
		}
	}

	// Treatment status (active medication or recent surgery)
	if (latestRecord.medication && daysSince <= 30) {
		return 'treatment'
	}

	if (latestRecord.type === 'Medication' && daysSince <= 14) {
		return 'treatment'
	}

	if (latestRecord.type === 'Surgery' && daysSince <= 30) {
		return 'treatment'
	}

	// Check for recent illness indicators
	if (latestRecord.type === 'Medication' && daysSince <= 7) {
		return 'sick'
	}

	// Healthy indicators
	if (latestRecord.type === 'Checkup' && daysSince <= 90) {
		// Check multiple indicators for health issues
		const hasIssues = checkForHealthIssuesInRecord(latestRecord)

		if (hasIssues) {
			// If medication is prescribed, it's treatment
			return latestRecord.medication ? 'treatment' : 'sick'
		}

		return 'healthy'
	}

	if (latestRecord.type === 'Vaccination' && daysSince <= 180) {
		return 'healthy'
	}

	// If no recent records (over 6 months)
	if (daysSince > 180) {
		return 'unknown'
	}

	// Default to healthy if recent record with no issues
	return 'healthy'
}

/**
 * Gets the last health check date from health records
 */
export const getLastHealthCheckDate = (healthRecords?: HealthRecord[]): string | undefined => {
	if (!healthRecords?.length) return undefined

	const checkups = healthRecords
		.filter((record) => record.type === 'Checkup' && record.status)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

	return checkups[0]?.date
}

/**
 * Checks if animal has active health issues
 */
export const hasActiveHealthIssues = (healthRecords?: HealthRecord[]): boolean => {
	if (!healthRecords?.length) return false

	const recentRecords = healthRecords
		.filter((record) => record.status)
		.filter((record) => {
			const daysSince = Math.floor(
				(Date.now() - new Date(record.date).getTime()) / (1000 * 60 * 60 * 24)
			)
			return daysSince <= 30 // Last 30 days
		})

	return recentRecords.some(
		(record) =>
			record.medication ||
			record.type === 'Surgery' ||
			record.type === 'Medication' ||
			(record.temperature && (record.temperature > 39.5 || record.temperature < 37.5))
	)
}

/**
 * Migration function for existing animals without health status
 */
export const migrateExistingAnimalsHealthStatus = async (): Promise<void> => {
	try {
		const animals = await AnimalsService.getAllAnimals()

		for (const animal of animals) {
			if (!animal.healthStatus || animal.healthStatus === 'unknown') {
				const calculatedStatus = calculateHealthStatusFromRecords(
					animal.healthRecords || [],
					undefined,
					animal
				)
				await AnimalsService.updateAnimalFields(animal.uuid, {
					healthStatus: calculatedStatus,
				})
			}
		}
	} catch (error) {
		console.error('Failed to migrate existing animals health status:', error)
		throw error
	}
}
