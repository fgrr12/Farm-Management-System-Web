import { isSupported as checkFCMSupport, getMessaging, getToken } from 'firebase/messaging'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useUserStore } from '@/store/useUserStore'

import { NotificationsService } from '@/services/notifications'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || ''

export const useFCMToken = () => {
	const [token, setToken] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [permission, setPermission] = useState<NotificationPermission>('default')
	const [isFCMSupported, setIsFCMSupported] = useState<boolean>(false)
	const [isTokenRegistered, setIsTokenRegistered] = useState(false)

	// Refs to prevent multiple registrations
	const registrationInProgress = useRef(false)
	const registeredTokenRef = useRef<string | null>(null)
	const currentUserRef = useRef<string | null>(null)

	const { user } = useUserStore()

	// Check if FCM is supported
	useEffect(() => {
		const checkSupport = async () => {
			try {
				const supported = await checkFCMSupport()
				setIsFCMSupported(supported)
			} catch (err) {
				console.warn('FCM is not supported in this environment:', err)
				setIsFCMSupported(false)
			}
		}
		checkSupport()
	}, [])

	// Check notification permission status
	useEffect(() => {
		if ('Notification' in window) {
			setPermission(Notification.permission)
		}
	}, [])

	// Request notification permission
	const requestPermission = useCallback(async (): Promise<boolean> => {
		if (!isFCMSupported || !('Notification' in window)) {
			setError('Las notificaciones no están soportadas en este navegador')
			return false
		}

		try {
			const permission = await Notification.requestPermission()
			setPermission(permission)

			if (permission === 'granted') {
				setError(null)
				return true
			}
			setError('Permisos de notificación denegados')
			return false
		} catch (err) {
			console.error('Error requesting notification permission:', err)
			setError('Error al solicitar permisos de notificación')
			return false
		}
	}, [isFCMSupported])

	// Get FCM token
	const getFCMToken = useCallback(async (): Promise<string | null> => {
		if (!isFCMSupported || permission !== 'granted') {
			return null
		}

		try {
			setLoading(true)
			setError(null)

			// Verificar si ya hay un service worker registrado para FCM
			if ('serviceWorker' in navigator) {
				const registrations = await navigator.serviceWorker.getRegistrations()
				const fcmSWExists = registrations.some(
					(reg) =>
						reg.scope.includes('firebase-cloud-messaging-push-scope') ||
						reg.scope.includes('firebase-messaging-sw') ||
						reg.active?.scriptURL.includes('firebase-messaging-sw.js')
				)

				if (!fcmSWExists) {
					try {
						await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
							scope: '/firebase-messaging-sw/',
							updateViaCache: 'none',
						})

						// Esperar a que esté listo antes de continuar
						await navigator.serviceWorker.ready
					} catch (swError) {
						console.warn('Failed to register FCM service worker:', swError)
						// Continuar sin service worker para notificaciones foreground
					}
				}
			}

			const messaging = getMessaging()
			const currentToken = await getToken(messaging, {
				vapidKey: VAPID_KEY,
			})

			if (currentToken) {
				setToken(currentToken)
				return currentToken
			}
			console.warn('No registration token available.')
			setError('No se pudo obtener el token de registro')
			return null
		} catch (err) {
			console.error('Error getting FCM token:', err)
			setError('Error al obtener el token FCM')
			return null
		} finally {
			setLoading(false)
		}
	}, [isFCMSupported, permission])

	// Register device token with backend
	const registerDeviceToken = useCallback(async (): Promise<boolean> => {
		if (!token || !user) {
			return false
		}

		// Prevent multiple registrations of the same token for the same user
		if (
			registrationInProgress.current ||
			(registeredTokenRef.current === token && currentUserRef.current === user.uuid)
		) {
			return true // Already registered or in progress
		}

		try {
			registrationInProgress.current = true
			setLoading(true)
			setError(null)

			// Detect device type and user agent
			const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
			const userAgent = navigator.userAgent

			await NotificationsService.registerDeviceToken({
				token,
				deviceType,
				userAgent,
			})

			// Mark as registered
			registeredTokenRef.current = token
			currentUserRef.current = user.uuid
			setIsTokenRegistered(true)

			return true
		} catch (err) {
			console.error('Error registering device token:', err)
			setError('Error al registrar el token del dispositivo')
			return false
		} finally {
			registrationInProgress.current = false
			setLoading(false)
		}
	}, [token, user])

	// Remove device token from backend
	const removeDeviceToken = useCallback(async (): Promise<boolean> => {
		if (!token) {
			return false
		}

		try {
			setLoading(true)
			setError(null)

			await NotificationsService.removeDeviceToken(token)
			setToken(null)

			return true
		} catch (err) {
			console.error('Error removing device token:', err)
			setError('Error al eliminar el token del dispositivo')
			return false
		} finally {
			setLoading(false)
		}
	}, [token])

	// Initialize FCM token on mount and when permission changes
	useEffect(() => {
		if (permission === 'granted' && isFCMSupported) {
			getFCMToken()
		}
	}, [permission, isFCMSupported, getFCMToken])

	// Auto-register token when obtained and user is logged in
	useEffect(() => {
		if (token && user && permission === 'granted') {
			registerDeviceToken()
		}
	}, [token, user, permission, registerDeviceToken])

	// Reset registration state when user changes
	useEffect(() => {
		if (user?.uuid !== currentUserRef.current) {
			registeredTokenRef.current = null
			currentUserRef.current = null
			setIsTokenRegistered(false)
		}
	}, [user?.uuid])

	// Setup foreground message listener - handled by NotificationToast component
	// useEffect(() => {
	// 	if (!isFCMSupported || permission !== 'granted') {
	// 		return
	// 	}
	// 	// Message handling moved to NotificationToast component
	// }, [isFCMSupported, permission])	// Cleanup token on unmount
	useEffect(() => {
		return () => {
			// Don't remove token on unmount as it should persist across sessions
		}
	}, [])

	return {
		token,
		loading,
		error,
		permission,
		isSupported: isFCMSupported,
		requestPermission,
		getFCMToken,
		registerDeviceToken,
		removeDeviceToken,
		hasPermission: permission === 'granted',
		isTokenRegistered,
	}
}
