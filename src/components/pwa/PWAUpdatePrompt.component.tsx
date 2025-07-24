import { useRegisterSW } from 'virtual:pwa-register/react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'

export const PWAUpdatePrompt = () => {
	const { t } = useTranslation(['common'])
	const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

	const {
		offlineReady: [offlineReady, setOfflineReady],
		needRefresh: [, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegistered(r: ServiceWorkerRegistration | undefined) {
			console.log('SW Registered: ', r)
		},
		onRegisterError(error: any) {
			console.log('SW registration error', error)
		},
		onOfflineReady() {
			console.log('App ready to work offline')
		},
		onNeedRefresh() {
			console.log('New content available, please refresh')
			setShowUpdatePrompt(true)
		},
	})

	const close = useCallback(() => {
		setOfflineReady(false)
		setNeedRefresh(false)
		setShowUpdatePrompt(false)
	}, [setOfflineReady, setNeedRefresh])

	const handleUpdate = useCallback(() => {
		updateServiceWorker(true)
		setShowUpdatePrompt(false)
	}, [updateServiceWorker])

	useEffect(() => {
		if (offlineReady) {
			console.log('App is ready to work offline')
		}
	}, [offlineReady])

	if (!showUpdatePrompt && !offlineReady) return null

	return (
		<div className="fixed bottom-4 right-4 z-50 max-w-sm">
			{showUpdatePrompt && (
				<div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0">
							<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
								<i className="i-material-symbols-refresh text-blue-600 w-5! h-5!" />
							</div>
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="text-sm font-medium text-gray-900">
								{t('pwa.updateAvailable.title')}
							</h3>
							<p className="text-sm text-gray-500 mt-1">{t('pwa.updateAvailable.message')}</p>
							<div className="flex gap-2 mt-3">
								<Button
									onClick={handleUpdate}
									className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
								>
									{t('pwa.updateAvailable.update')}
								</Button>
								<Button
									onClick={close}
									className="text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 text-sm px-3 py-1"
								>
									{t('pwa.updateAvailable.later')}
								</Button>
							</div>
						</div>
						<button
							type="button"
							onClick={close}
							className="flex-shrink-0 text-gray-400 hover:text-gray-600"
						>
							<i className="i-material-symbols-close w-5! h-5!" />
						</button>
					</div>
				</div>
			)}

			{offlineReady && !showUpdatePrompt && (
				<div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4">
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0">
							<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
								<i className="i-material-symbols-check text-green-600 w-5! h-5!" />
							</div>
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="text-sm font-medium text-green-900">{t('pwa.offlineReady.title')}</h3>
							<p className="text-sm text-green-700 mt-1">{t('pwa.offlineReady.message')}</p>
						</div>
						<button
							type="button"
							onClick={close}
							className="flex-shrink-0 text-green-400 hover:text-green-600"
						>
							<i className="i-material-symbols-close w-5! h-5!" />
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
