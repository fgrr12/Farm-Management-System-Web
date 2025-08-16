import { callableFireFunction } from '@/utils/callableFireFunction'

export const runAllReminders = async (farmUuid: string): Promise<void> => {
	try {
		await callableFireFunction('notifications', {
			operation: 'sendProductionSummary',
			farmUuid,
		})

		// You can add more reminder types here
		console.log('Reminders executed successfully for farm:', farmUuid)
	} catch (error) {
		console.error('Error running reminders:', error)
		throw error
	}
}

export const scheduleReminder = async (
	farmUuid: string,
	reminderType: string,
	scheduledTime: Date
): Promise<void> => {
	try {
		await callableFireFunction('notifications', {
			operation: 'scheduleNotificationDelivery',
			notificationData: {
				farmUuid,
				title: `Recordatorio: ${reminderType}`,
				message: `Es hora de ${reminderType}`,
				category: 'task',
				priority: 'medium',
			},
			options: {
				scheduledTime: scheduledTime.toISOString(),
			},
		})
	} catch (error) {
		console.error('Error scheduling reminder:', error)
		throw error
	}
}

export const reminderService = {
	runAllReminders,
	scheduleReminder,
}
