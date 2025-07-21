import { useTranslation } from 'react-i18next'

import { useOffline } from '@/hooks/system/useOffline'

export const OfflineIndicator = () => {
	const { isOffline, queueLength } = useOffline()
	const { t } = useTranslation('common')

	if (!isOffline && queueLength === 0) return null

	return (
		<div className="fixed bottom-4 right-4 z-50">
			{isOffline && (
				<div className="alert alert-warning shadow-lg mb-2" role="alert">
					<div className="flex items-center gap-2">
						<i className="i-material-symbols-wifi-off w-5! h-5!" />
						<span className="text-sm font-medium">{t('offline.noConnection')}</span>
					</div>
				</div>
			)}

			{queueLength > 0 && (
				<div className="alert alert-info shadow-lg" role="status">
					<div className="flex items-center gap-2">
						<i className="i-material-symbols-sync w-5! h-5! animate-spin" />
						<span className="text-sm font-medium">
							{t('offline.pendingOperations', { count: queueLength })}
						</span>
					</div>
				</div>
			)}
		</div>
	)
}
