import { callableFireFunction } from '@/utils/callableFireFunction'

// Voice processing interfaces
export interface VoiceProcessingRequest {
	audioData: string // Base64 encoded audio
	farmUuid: string
	userUuid: string
	audioFormat?: 'webm' | 'mp3' | 'wav'
	maxDuration?: number
}

export interface AnimalOperation {
	operation: 'create' | 'update'
	animalUuid?: string // Changed from animalId to animalUuid
	data: {
		animalId?: string
		name?: string
		healthStatus?: 'critical' | 'sick' | 'treatment' | 'unknown' | 'healthy'
		speciesUuid?: string
		breedUuid?: string
		gender?: 'male' | 'female'
		birthDate?: string
		weight?: number
		notes?: string
	}
}

export interface HealthRecordOperation {
	operation: 'create'
	animalUuid: string // Changed from animalId to animalUuid
	data: {
		symptoms?: string[]
		treatment?: string
		medication?: string
		dosage?: string
		veterinarian?: string
		notes?: string
		temperature?: number
		weight?: number
		followUpDate?: string
	}
}

export interface ProductionRecordOperation {
	operation: 'create'
	animalUuid: string // Changed from animalId to animalUuid
	data: {
		productionType: 'milk' | 'eggs' | 'breeding' | 'meat' | 'other'
		quantity: number
		unit?: string
		quality?: 'excellent' | 'good' | 'fair' | 'poor'
		notes?: string
		date?: string
	}
}

export interface TaskOperation {
	operation: 'create'
	data: {
		title: string
		description?: string
		type: 'feeding' | 'cleaning' | 'medical' | 'breeding' | 'maintenance' | 'other'
		priority?: 'low' | 'medium' | 'high' | 'urgent'
		dueDate?: string
		assignedTo?: string
		relatedAnimalUuid?: string // Changed from relatedAnimalId
		estimatedDuration?: number
	}
}

export interface RelationOperation {
	operation: 'create'
	data: {
		parentAnimalUuid: string // Changed from parentAnimalId
		childAnimalUuid: string // Changed from childAnimalId
		relationType: 'parent' | 'sibling' | 'offspring'
		notes?: string
	}
}

export interface CalendarEventOperation {
	operation: 'create'
	data: {
		title: string
		description?: string
		eventType: 'medical' | 'breeding' | 'feeding' | 'maintenance' | 'appointment' | 'reminder'
		startDate: string
		endDate?: string
		isAllDay?: boolean
		relatedAnimalUuid?: string // Changed from relatedAnimalId
		location?: string
		reminders?: number[]
	}
}

export interface VoiceProcessingResponse {
	success: boolean
	transcription?: string
	data?: {
		animals?: AnimalOperation[]
		health?: HealthRecordOperation[]
		production?: ProductionRecordOperation[]
		tasks?: TaskOperation[]
		relations?: RelationOperation[]
		calendar?: CalendarEventOperation[]
	}
	errors?: string[]
	warnings?: string[]
	unprocessed?: string[]
	processingTime?: number
	tokensUsed?: number
}

export interface ExecutionResult {
	type: 'animal' | 'health' | 'production' | 'task' | 'relation' | 'calendar'
	success: boolean
	id?: string
	error?: string
	operation?: string
}

/**
 * Process voice command with full AI analysis
 */
const processVoiceCommand = async (
	request: VoiceProcessingRequest
): Promise<VoiceProcessingResponse> => {
	const response = await callableFireFunction<{
		success: boolean
		data: VoiceProcessingResponse
	}>('voice', {
		operation: 'processVoiceCommand',
		...request,
	})

	return response.data
}

/**
 * Process voice command and execute operations automatically in backend
 */
const processAndExecuteVoiceCommand = async (
	request: VoiceProcessingRequest
): Promise<{
	success: boolean
	data: VoiceProcessingResponse & {
		execution: {
			success: boolean
			errors: string[]
			successCount: number
		}
	}
}> => {
	const response = await callableFireFunction<{
		success: boolean
		data: VoiceProcessingResponse & {
			execution: {
				success: boolean
				errors: string[]
				successCount: number
			}
		}
	}>('voice', {
		operation: 'processAndExecute',
		...request,
	})

	return response
}

/**
 * Transcribe audio only (for testing)
 */
const transcribeOnly = async (
	audioData: string,
	audioFormat = 'webm'
): Promise<{ transcription: string; processingTime: number }> => {
	const response = await callableFireFunction<{
		success: boolean
		data: { transcription: string; processingTime: number }
	}>('voice', {
		operation: 'transcribeOnly',
		audioData,
		audioFormat,
	})

	return response.data
}

/**
 * Execute parsed operations using existing services
 */
const executeOperations = async (
	results: VoiceProcessingResponse,
	farmUuid: string,
	userUuid: string
): Promise<ExecutionResult[]> => {
	const executionResults: ExecutionResult[] = []

	try {
		// Import services dynamically to avoid circular dependencies
		const { AnimalsService } = await import('@/services/animals')
		const { HealthRecordsService } = await import('@/services/healthRecords')
		const { ProductionRecordsService } = await import('@/services/productionRecords')
		const { TasksService } = await import('@/services/tasks')
		const { RelatedAnimalsService } = await import('@/services/relatedAnimals')
		const { CalendarService } = await import('@/services/calendar')

		// Execute animal operations
		if (results.data?.animals) {
			for (const op of results.data.animals) {
				try {
					if (op.operation === 'create') {
						const animal = {
							...op.data,
							farmUuid,
							status: true,
							healthStatus: op.data.healthStatus || 'unknown',
							// Add required fields with defaults
							speciesUuid: op.data.speciesUuid || '',
							breedUuid: op.data.breedUuid || '',
							gender: op.data.gender || 'Female',
							color: '',
							weight: op.data.weight || 0,
							origin: 'Voice Command',
						} as Animal

						const uuid = await AnimalsService.setAnimal(animal, userUuid, farmUuid)
						executionResults.push({
							type: 'animal',
							success: true,
							id: uuid,
							operation: 'create',
						})
					} else if (op.operation === 'update' && op.animalUuid) {
						// Get existing animal first
						const existingAnimal = await AnimalsService.getAnimal(op.animalUuid)
						// Fix gender capitalization
						const updatedAnimal = {
							...existingAnimal,
							...op.data,
							gender:
								op.data.gender === 'male'
									? 'Male'
									: op.data.gender === 'female'
										? 'Female'
										: existingAnimal.gender,
						}

						await AnimalsService.updateAnimal(updatedAnimal, userUuid)
						executionResults.push({
							type: 'animal',
							success: true,
							id: op.animalUuid,
							operation: 'update',
						})
					}
				} catch (error) {
					executionResults.push({
						type: 'animal',
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
						operation: op.operation,
					})
				}
			}
		}

		// Execute health operations
		if (results.data?.health) {
			for (const op of results.data.health) {
				try {
					const healthRecord = {
						uuid: '', // Will be auto-generated
						animalUuid: op.animalUuid,
						reason: op.data.symptoms?.join(', ') || 'Voice recorded health event',
						notes: op.data.notes || '',
						type: 'Medication' as const,
						reviewedBy: userUuid,
						createdBy: userUuid,
						date: new Date().toISOString(),
						status: true,
						weight: op.data.weight,
						temperature: op.data.temperature,
						medication: op.data.medication,
						dosage: op.data.dosage,
					}

					const result = await HealthRecordsService.setHealthRecord(
						healthRecord,
						userUuid,
						farmUuid
					)
					executionResults.push({
						type: 'health',
						success: true,
						id: result.uuid,
						operation: 'create',
					})
				} catch (error) {
					executionResults.push({
						type: 'health',
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
						operation: 'create',
					})
				}
			}
		}

		// Execute production operations
		if (results.data?.production) {
			for (const op of results.data.production) {
				try {
					const productionRecord = {
						uuid: '', // Will be auto-generated
						animalUuid: op.animalUuid,
						date: op.data.date || new Date().toISOString(),
						quantity: op.data.quantity,
						notes: `${op.data.productionType}: ${op.data.quantity} ${op.data.unit || 'units'}${op.data.notes ? ` - ${op.data.notes}` : ''}`,
						status: true,
					}

					const result = await ProductionRecordsService.setProductionRecord(
						productionRecord,
						userUuid,
						farmUuid
					)
					executionResults.push({
						type: 'production',
						success: true,
						id: result.uuid,
						operation: 'create',
					})
				} catch (error) {
					executionResults.push({
						type: 'production',
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
						operation: 'create',
					})
				}
			}
		}

		// Execute task operations
		if (results.data?.tasks) {
			for (const op of results.data.tasks) {
				try {
					const task = {
						uuid: '', // Will be auto-generated
						title: op.data.title,
						description: op.data.description || '',
						type: op.data.type,
						priority: (op.data.priority === 'urgent' ? 'high' : op.data.priority) || 'medium',
						status: 'todo' as const,
						dueDate: op.data.dueDate || new Date().toISOString(),
						assignedTo: op.data.assignedTo || userUuid,
						relatedAnimalUuid: op.data.relatedAnimalUuid,
						estimatedDuration: op.data.estimatedDuration,
						farmUuid,
						createdBy: userUuid,
						speciesUuid: '', // Add required field with default
					}

					const result = await TasksService.setTask(task, userUuid, farmUuid)
					executionResults.push({
						type: 'task',
						success: true,
						id: result.uuid,
						operation: 'create',
					})
				} catch (error) {
					executionResults.push({
						type: 'task',
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
						operation: 'create',
					})
				}
			}
		}

		// Execute relation operations
		if (results.data?.relations) {
			for (const op of results.data.relations) {
				try {
					const relation = {
						parent: {
							animalUuid: op.data.parentAnimalUuid,
							animalId: op.data.parentAnimalUuid,
							breed: '',
							relation: 'Father' as const,
						},
						child: {
							animalUuid: op.data.childAnimalUuid,
							animalId: op.data.childAnimalUuid,
							breed: '',
							relation: 'Son' as const,
						},
					}

					const result = await RelatedAnimalsService.setRelatedAnimal(relation, userUuid, farmUuid)
					executionResults.push({
						type: 'relation',
						success: true,
						id: result.uuid,
						operation: 'create',
					})
				} catch (error) {
					executionResults.push({
						type: 'relation',
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
						operation: 'create',
					})
				}
			}
		}

		// Execute calendar operations
		if (results.data?.calendar) {
			for (const op of results.data.calendar) {
				try {
					const calendarEvent = {
						title: op.data.title,
						description: op.data.description || '',
						date: op.data.startDate.split('T')[0], // Extract YYYY-MM-DD
						time: op.data.startDate.split('T')[1]?.substring(0, 5), // Extract HH:MM
						type: 'custom' as const,
						priority: 'medium' as const,
						status: 'pending' as const,
						relatedType: op.data.relatedAnimalUuid ? ('animal' as const) : undefined,
						relatedId: op.data.relatedAnimalUuid,
						isAutoGenerated: false,
					}

					const result = await CalendarService.createCalendarEvent(
						calendarEvent,
						farmUuid,
						userUuid
					)
					executionResults.push({
						type: 'calendar',
						success: true,
						id: result.uuid,
						operation: 'create',
					})
				} catch (error) {
					executionResults.push({
						type: 'calendar',
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
						operation: 'create',
					})
				}
			}
		}
	} catch (error) {
		console.error('Error executing operations:', error)
		executionResults.push({
			type: 'animal',
			success: false,
			error: error instanceof Error ? error.message : 'Unknown execution error',
		})
	}

	return executionResults
}

export const VoiceService = {
	processVoiceCommand,
	processAndExecuteVoiceCommand,
	transcribeOnly,
	executeOperations,
}
