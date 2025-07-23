import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[]
	readonly userChoice: Promise<{
		outcome: 'accepted' | 'dismissed'
		platform: string
	}>
	prompt(): Promise<void>
}

export const usePWA = () => {
	const [isInstallable, setIsInstallable] = useState(false)
	const [isInstalled, setIsInstalled] = useState(false)
	const [isStandalone, setIsStandalone] = useState(false)
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

	// Check if app is running in standalone mode
	useEffect(() => {
		const checkStandalone = () => {
			const isStandaloneMode =
				window.matchMedia('(display-mode: standalone)').matches ||
				(window.navigator as any).standalone ||
				document.referrer.includes('android-app://')

			setIsStandalone(isStandaloneMode)
			setIsInstalled(isStandaloneMode)
		}

		checkStandalone()
		window.addEventListener('resize', checkStandalone)
		return () => window.removeEventListener('resize', checkStandalone)
	}, [])

	// Listen for beforeinstallprompt event
	useEffect(() => {
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault()
			setDeferredPrompt(e as BeforeInstallPromptEvent)
			setIsInstallable(true)
		}

		const handleAppInstalled = () => {
			setIsInstalled(true)
			setIsInstallable(false)
			setDeferredPrompt(null)
		}

		window.addEventListener('beforeInstallPrompt', handleBeforeInstallPrompt)
		window.addEventListener('appInstalled', handleAppInstalled)

		return () => {
			window.removeEventListener('beforeInstallPrompt', handleBeforeInstallPrompt)
			window.removeEventListener('appInstalled', handleAppInstalled)
		}
	}, [])

	const installApp = useCallback(async () => {
		if (!deferredPrompt) return false

		try {
			await deferredPrompt.prompt()
			const { outcome } = await deferredPrompt.userChoice

			if (outcome === 'accepted') {
				setIsInstalled(true)
				setIsInstallable(false)
				setDeferredPrompt(null)
				return true
			}
			return false
		} catch (error) {
			console.error('Error installing PWA:', error)
			return false
		}
	}, [deferredPrompt])

	const canShare = useCallback(() => {
		return 'share' in navigator
	}, [])

	const shareApp = useCallback(
		async (data?: { title?: string; text?: string; url?: string }) => {
			if (!canShare()) return false

			try {
				await navigator.share({
					title: data?.title || 'Cattle - Farm Management',
					text: data?.text || 'Complete farm management application for livestock operations',
					url: data?.url || window.location.origin,
				})
				return true
			} catch (error) {
				console.error('Error sharing:', error)
				return false
			}
		},
		[canShare]
	)

	return {
		isInstallable,
		isInstalled,
		isStandalone,
		installApp,
		canShare: canShare(),
		shareApp,
	}
}
