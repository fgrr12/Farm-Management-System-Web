import { useTranslation } from 'react-i18next'

import { useOffline } from '@/hooks/system/useOffline'

export const OfflineIndicator = () => {
	const { isOffline, queueLength } = useOffline()
	const { t } = useTranslation('common')

	if (!isOffline && queueLength === 0) return null

	return (
		<div className="fixed bottom-4 right-4 z-50">
			{isOffline && (
				<div
					className="alert alert-warning shadow-lg dark:shadow-xl mb-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200"
					role="alert"
				>
					<div className="flex items-center gap-2">
						<i className="i-material-symbols-wifi-off w-5! h-5! text-yellow-600 dark:text-yellow-400" />
						<span className="text-sm font-medium">{t('offline.noConnection')}</span>
					</div>
				</div>
			)}

			{queueLength > 0 && (
				<div
					className="alert alert-info shadow-lg dark:shadow-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200"
					role="status"
				>
					<div className="flex items-center gap-2">
						<i className="i-material-symbols-sync w-5! h-5! animate-spin text-blue-600 dark:text-blue-400" />
						<span className="text-sm font-medium">
							{t('offline.pendingOperations', { count: queueLength })}
						</span>
					</div>
				</div>
			)}
		</div>
	)
}
