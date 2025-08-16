import { useEffect, useRef } from 'react'

import { useFarmStore } from '@/store/useFarmStore'

import { runAllReminders } from '@/services/notifications/reminderService.js'

export function useReminderScheduler() {
	const { farm } = useFarmStore()
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		if (!farm?.uuid) return

		runAllReminders(farm.uuid).catch((error: unknown) => {
			console.error('Failed to run initial reminders:', error)
		})

		intervalRef.current = setInterval(
			() => {
				runAllReminders(farm.uuid).catch((error: unknown) => {
					console.error('Failed to run scheduled reminders:', error)
				})
			},
			30 * 60 * 1000
		)

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
		}
	}, [farm?.uuid])

	const runRemindersNow = async () => {
		if (!farm?.uuid) return

		try {
			await runAllReminders(farm.uuid)
		} catch (error) {
			console.error('Failed to run manual reminders:', error)
		}
	}

	return {
		runRemindersNow,
	}
}
