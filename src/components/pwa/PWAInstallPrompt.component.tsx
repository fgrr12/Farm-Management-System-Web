import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'

import { usePWA } from '@/hooks/pwa/usePWA'

export const PWAInstallPrompt = () => {
	const { t } = useTranslation(['common'])
	const { isInstallable, installApp, canShare, shareApp } = usePWA()
	const [showPrompt, setShowPrompt] = useState(true)
	const [isInstalling, setIsInstalling] = useState(false)

	const handleInstall = useCallback(async () => {
		setIsInstalling(true)
		try {
			const success = await installApp()
			if (success) {
				setShowPrompt(false)
			}
		} finally {
			setIsInstalling(false)
		}
	}, [installApp])

	const handleShare = useCallback(async () => {
		await shareApp()
	}, [shareApp])

	const handleDismiss = useCallback(() => {
		setShowPrompt(false)
		sessionStorage.setItem('pwa-install-dismissed', 'true')
	}, [])

	if (!isInstallable || !showPrompt || sessionStorage.getItem('pwa-install-dismissed') === 'true') {
		return null
	}

	return (
		<div className="fixed bottom-4 left-4 z-50 max-w-sm">
			<div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
				<div className="flex items-start gap-3">
					<div className="shrink-0">
						<div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
							<i className="i-material-symbols-smartphone text-emerald-600 w-5! h-5!" />
						</div>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-sm font-medium text-gray-900">{t('pwa.install.title')}</h3>
						<p className="text-sm text-gray-500 mt-1">{t('pwa.install.message')}</p>
						<div className="flex gap-2 mt-3">
							<Button
								onClick={handleInstall}
								disabled={isInstalling}
								className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1"
							>
								{isInstalling ? t('pwa.install.installing') : t('pwa.install.install')}
							</Button>
							{canShare && (
								<ActionButton
									icon="i-material-symbols-share"
									onClick={handleShare}
									title={t('pwa.install.share')}
									className="text-sm px-2 py-1"
								/>
							)}
							<Button
								onClick={handleDismiss}
								className="text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 text-sm px-3 py-1"
							>
								{t('pwa.install.dismiss')}
							</Button>
						</div>
					</div>
					<button
						type="button"
						onClick={handleDismiss}
						className="shrink-0 text-gray-400 hover:text-gray-600"
					>
						<i className="i-material-symbols-close w-5! h-5!" />
					</button>
				</div>
			</div>
		</div>
	)
}
