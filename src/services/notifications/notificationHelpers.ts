import { NotificationService } from './notificationService'

export async function onAnimalCreated(animal: Animal): Promise<void> {
	try {
		await NotificationService.createGeneralNotification(
			animal.farmUuid,
			'Nuevo animal registrado',
			`Se ha registrado un nuevo animal: ${animal.animalId}`,
			'success'
		)
	} catch (error) {
		console.error('Error creating animal notification:', error)
	}
}

export async function onHealthRecordCreated(
	healthRecord: HealthRecord,
	animal: Animal
): Promise<void> {
	try {
		const title = healthRecord.reason
			? `Nuevo registro: ${healthRecord.reason}`
			: 'Nuevo registro de salud'

		const message = `Se ha registrado un nuevo evento de salud para ${animal.animalId}${
			healthRecord.notes ? `. Notas: ${healthRecord.notes}` : ''
		}`

		await NotificationService.createHealthNotification(
			animal.farmUuid,
			animal.uuid,
			title,
			message,
			'info'
		)

		if (healthRecord.medication && healthRecord.frequency) {
			await NotificationService.createMedicationNotification(
				animal.farmUuid,
				animal.uuid,
				healthRecord.medication,
				healthRecord.dosage || 'Según prescripción',
				new Date()
			)
		}
	} catch (error) {
		console.error('Error creating health record notification:', error)
	}
}

export async function onTaskCreated(task: Task): Promise<void> {
	try {
		const title = 'Nueva tarea asignada'
		const message = `Se ha creado la tarea: ${task.title}`
		const actionUrl = `/tasks/${task.uuid}`

		await NotificationService.createTaskNotification(
			task.farmUuid,
			title,
			message,
			'info',
			actionUrl
		)
	} catch (error) {
		console.error('Error creating task notification:', error)
	}
}

export async function onTaskOverdue(task: Task): Promise<void> {
	try {
		const title = 'Tarea vencida'
		const message = `La tarea "${task.title}" está vencida y requiere atención`
		const actionUrl = `/tasks/${task.uuid}`

		await NotificationService.createTaskNotification(
			task.farmUuid,
			title,
			message,
			'error',
			actionUrl
		)
	} catch (error) {
		console.error('Error creating overdue task notification:', error)
	}
}

export async function onTaskCompleted(task: Task): Promise<void> {
	try {
		const title = 'Tarea completada'
		const message = `Se ha completado la tarea: ${task.title}`

		await NotificationService.createTaskNotification(task.farmUuid, title, message, 'success')
	} catch (error) {
		console.error('Error creating task completion notification:', error)
	}
}

export async function onMedicationReminder(
	healthRecord: HealthRecord,
	animal: Animal
): Promise<void> {
	try {
		await NotificationService.createMedicationNotification(
			animal.farmUuid,
			animal.uuid,
			healthRecord.medication || 'Medicación',
			healthRecord.dosage || 'Según prescripción',
			new Date()
		)
	} catch (error) {
		console.error('Error creating medication reminder:', error)
	}
}

export async function onVaccinationReminder(
	healthRecord: HealthRecord,
	animal: Animal
): Promise<void> {
	try {
		const title = 'Recordatorio de vacunación'
		const vaccineName = healthRecord.medication || 'Vacuna'
		const message = `${animal.animalId} necesita la vacuna ${vaccineName} próximamente`

		await NotificationService.createHealthNotification(
			animal.farmUuid,
			animal.uuid,
			title,
			message,
			'warning'
		)
	} catch (error) {
		console.error('Error creating vaccination reminder:', error)
	}
}

/**
 * Generar notificación de alerta de salud crítica
 */
export async function onCriticalHealthAlert(
	animal: Animal,
	condition: string,
	severity: 'warning' | 'error' = 'warning'
): Promise<void> {
	try {
		const title = severity === 'error' ? 'Alerta crítica de salud' : 'Alerta de salud'
		const message = `${animal.animalId} presenta: ${condition}. Se requiere atención ${
			severity === 'error' ? 'inmediata' : 'veterinaria'
		}.`

		await NotificationService.createHealthNotification(
			animal.farmUuid,
			animal.uuid,
			title,
			message,
			severity
		)
	} catch (error) {
		console.error('Error creating health alert:', error)
	}
}

export async function onBirthDue(animal: Animal, expectedDate: Date): Promise<void> {
	try {
		const title = 'Parto próximo'
		const daysUntil = Math.ceil((expectedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

		let message: string
		if (daysUntil <= 0) {
			message = `${animal.animalId} debería haber parido. Verificar estado.`
		} else if (daysUntil <= 3) {
			message = `${animal.animalId} dará a luz en aproximadamente ${daysUntil} día(s). Preparar área de parto.`
		} else {
			message = `${animal.animalId} dará a luz en aproximadamente ${daysUntil} días.`
		}

		const type: NotificationData['type'] =
			daysUntil <= 0 ? 'error' : daysUntil <= 3 ? 'warning' : 'info'

		await NotificationService.createHealthNotification(
			animal.farmUuid,
			animal.uuid,
			title,
			message,
			type
		)
	} catch (error) {
		console.error('Error creating birth due notification:', error)
	}
}

export async function onVaccinationDue(
	animal: Animal,
	vaccineName: string,
	dueDate: Date
): Promise<void> {
	try {
		const title = 'Vacunación pendiente'
		const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

		let message: string
		let type: NotificationData['type']

		if (daysUntil <= 0) {
			message = `La vacuna ${vaccineName} para ${animal.animalId} está vencida.`
			type = 'error'
		} else if (daysUntil <= 7) {
			message = `${animal.animalId} necesita la vacuna ${vaccineName} en ${daysUntil} día(s).`
			type = 'warning'
		} else {
			message = `${animal.animalId} necesita la vacuna ${vaccineName} en ${daysUntil} días.`
			type = 'info'
		}

		await NotificationService.createHealthNotification(
			animal.farmUuid,
			animal.uuid,
			title,
			message,
			type
		)
	} catch (error) {
		console.error('Error creating vaccination due notification:', error)
	}
}

export async function onSystemNotification(
	farmUuid: string,
	title: string,
	message: string,
	type: NotificationData['type'] = 'info'
): Promise<void> {
	try {
		await NotificationService.createGeneralNotification(farmUuid, title, message, type)
	} catch (error) {
		console.error('Error creating system notification:', error)
	}
}

export async function cleanupOldNotifications(farmUuid: string): Promise<number> {
	try {
		return await NotificationService.cleanupOldNotifications(farmUuid)
	} catch (error) {
		console.error('Error cleaning up notifications:', error)
		return 0
	}
}

export async function createTestNotifications(farmUuid: string): Promise<void> {
	try {
		const now = new Date()

		await NotificationService.createMedicationNotification(
			farmUuid,
			'test-animal-1',
			'Antibióticos',
			'10ml cada 12 horas',
			now
		)

		await new Promise((resolve) => setTimeout(resolve, 100))

		await NotificationService.createHealthNotification(
			farmUuid,
			'test-animal-2',
			'Chequeo veterinario completado',
			'Revisión rutinaria completada. Todo en orden.',
			'success'
		)

		await new Promise((resolve) => setTimeout(resolve, 100))

		await NotificationService.createTaskNotification(
			farmUuid,
			'Nueva tarea asignada',
			'Se ha asignado la tarea: Limpiar establos del sector A',
			'info',
			'/tasks'
		)

		await new Promise((resolve) => setTimeout(resolve, 100))

		await NotificationService.createGeneralNotification(
			farmUuid,
			'Sistema actualizado',
			'El sistema se ha actualizado con nuevas funcionalidades.',
			'info'
		)
	} catch (error) {
		console.error('Error creating test notifications:', error)
	}
}

export const NotificationHelpers = {
	onAnimalCreated,
	onHealthRecordCreated,
	onTaskCreated,
	onTaskOverdue,
	onTaskCompleted,
	onMedicationReminder,
	onVaccinationReminder,
	onCriticalHealthAlert,
	onBirthDue,
	onVaccinationDue,
	onSystemNotification,
	cleanupOldNotifications,
	createTestNotifications,
}
