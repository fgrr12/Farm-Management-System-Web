import dayjs from 'dayjs'

import { AnimalsService } from '@/services/animals'
import { HealthRecordsService } from '@/services/healthRecords'
import { TasksService } from '@/services/tasks'

import { onMedicationReminder, onTaskOverdue, onVaccinationReminder } from './notificationHelpers'

export async function checkMedicationReminders(farmUuid: string): Promise<void> {
	try {
		const animals = await AnimalsService.getAnimals(farmUuid)
		const now = dayjs()

		for (const animal of animals) {
			try {
				const healthRecords = await HealthRecordsService.getHealthRecords(animal.uuid)

				const activeMedications = healthRecords.filter(
					(record) => record.medication && record.frequency && record.status === true
				)

				for (const medication of activeMedications) {
					if (medication.medication && medication.frequency) {
						const nextDose = calculateNextDose(medication.date, medication.frequency)

						if (nextDose.isBefore(now) || nextDose.isSame(now, 'hour')) {
							await onMedicationReminder(medication, animal)
						}
					}
				}
			} catch (error) {
				console.warn(`Failed to check medication reminders for animal ${animal.animalId}:`, error)
			}
		}
	} catch (error) {
		console.error('Failed to check medication reminders:', error)
	}
}

export async function checkVaccinationReminders(farmUuid: string): Promise<void> {
	try {
		const animals = await AnimalsService.getAnimals(farmUuid)
		const now = dayjs()
		const reminderWindow = now.add(7, 'days') // Recordar 7 días antes

		for (const animal of animals) {
			try {
				const healthRecords = await HealthRecordsService.getHealthRecords(animal.uuid)

				// Buscar vacunaciones con fechas de refuerzo
				const vaccinations = healthRecords.filter(
					(record) => record.type === 'Vaccination' && record.medication
				)

				for (const vaccination of vaccinations) {
					// Simular próxima vacunación basada en la fecha del registro
					const lastVaccination = dayjs(vaccination.date)
					const nextVaccination = lastVaccination.add(1, 'year') // Asumir vacunación anual

					// Si la vacunación está dentro de la ventana de recordatorio
					if (nextVaccination.isBefore(reminderWindow) && nextVaccination.isAfter(now)) {
						await onVaccinationReminder(vaccination, animal)
					}
				}
			} catch (error) {
				console.warn(`Failed to check vaccination reminders for animal ${animal.animalId}:`, error)
			}
		}
	} catch (error) {
		console.error('Failed to check vaccination reminders:', error)
	}
}

export async function checkTaskReminders(farmUuid: string): Promise<void> {
	try {
		const tasks = await TasksService.getTasks({
			farmUuid,
			speciesUuid: '',
			priority: '',
			search: '',
			status: '',
		})
		// const now = dayjs()

		const overdueTasks = tasks.filter(
			(task) => task.status !== 'done' //&& task.dueDate && dayjs(task.dueDate).isBefore(now, 'day')
		)

		for (const task of overdueTasks) {
			try {
				await onTaskOverdue(task)
			} catch (error) {
				console.warn(`Failed to create overdue task notification for task ${task.uuid}:`, error)
			}
		}
	} catch (error) {
		console.error('Failed to check task reminders:', error)
	}
}

function calculateNextDose(startDate: string, frequency: string): dayjs.Dayjs {
	const start = dayjs(startDate)
	const now = dayjs()

	const frequencyLower = frequency.toLowerCase()

	if (frequencyLower.includes('day')) {
		const timesMatch = frequencyLower.match(/(\d+)\s*times?\s*per\s*day/)
		if (timesMatch) {
			const timesPerDay = Number.parseInt(timesMatch[1])
			const hoursInterval = 24 / timesPerDay

			const hoursSinceStart = now.diff(start, 'hours')
			const dosesCompleted = Math.floor(hoursSinceStart / hoursInterval)

			return start.add((dosesCompleted + 1) * hoursInterval, 'hours')
		}

		if (frequencyLower.includes('once')) {
			return start.add(1, 'day')
		}
	}

	if (frequencyLower.includes('week')) {
		return start.add(1, 'week')
	}

	if (frequencyLower.includes('month')) {
		return start.add(1, 'month')
	}

	return start.add(1, 'day')
}

export async function runAllReminders(farmUuid: string): Promise<void> {
	console.log('Running automatic reminders for farm:', farmUuid)

	await Promise.allSettled([
		checkMedicationReminders(farmUuid),
		checkVaccinationReminders(farmUuid),
		checkTaskReminders(farmUuid),
	])

	console.log('Automatic reminders completed')
}

export const ReminderService = {
	checkMedicationReminders,
	checkVaccinationReminders,
	checkTaskReminders,
	runAllReminders,
}
