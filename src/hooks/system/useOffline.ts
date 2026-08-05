import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppStore } from '@/store/useAppStore'
import { useOfflineQueueStore } from '@/store/useOfflineQueueStore'

import { flushOfflineQueue } from '@/utils/offlineQueue'
import { flushVoiceQueue } from '@/utils/voiceQueue'

/**
 * Tracks connectivity and drives the offline queue: whenever the browser comes back online (or
 * this hook mounts already online with pending items — e.g. the app was reopened after being
 * closed while offline), it replays whatever forms/voice commands got queued while offline.
 * `flushOfflineQueue` guards against concurrent flushes itself, so it's safe for multiple
 * components (this hook can be mounted more than once) to call `sync` around the same time.
 */
export const useOffline = () => {
	const [isOffline, setIsOffline] = useState(!navigator.onLine)
	const queueLength = useOfflineQueueStore((state) => state.queue.length)
	const queryClient = useQueryClient()
	const { setToastData } = useAppStore()
	const { t } = useTranslation('common')

	const sync = useCallback(() => {
		const notify = (message: string, type: 'success' | 'error') => setToastData({ message, type })
		flushOfflineQueue(queryClient, notify, t)
		flushVoiceQueue(notify, t)
	}, [queryClient, setToastData, t])

	useEffect(() => {
		const handleOnline = () => {
			setIsOffline(false)
			sync()
		}
		const handleOffline = () => setIsOffline(true)

		window.addEventListener('online', handleOnline)
		window.addEventListener('offline', handleOffline)

		if (navigator.onLine) sync()

		return () => {
			window.removeEventListener('online', handleOnline)
			window.removeEventListener('offline', handleOffline)
		}
	}, [sync])

	return {
		isOffline,
		queueLength,
	}
}
