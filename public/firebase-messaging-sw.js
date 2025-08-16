// Firebase Messaging Service Worker - No conflicting with PWA SW
console.log('[FCM-SW] Starting Firebase Messaging Service Worker...')

// Variable para almacenar la configuración
let firebaseConfig = null

// Escuchar mensajes de configuración del main thread
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'FIREBASE_CONFIG') {
		firebaseConfig = event.data.config
		console.log('[FCM-SW] Firebase config received from main thread')
		
		// Reinicializar Firebase con la nueva configuración
		if (typeof firebase !== 'undefined' && firebaseConfig) {
			try {
				firebase.initializeApp(firebaseConfig)
				console.log('[FCM-SW] Firebase reinitialized with secure config')
			} catch (error) {
				console.warn('[FCM-SW] Firebase already initialized or error:', error)
			}
		}
	}
})

try {
	// Import Firebase scripts - usando versión más estable
	importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
	console.log('[FCM-SW] Firebase app script loaded')
	
	importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')
	console.log('[FCM-SW] Firebase messaging script loaded')

	// Firebase configuration - Se obtiene dinámicamente del servidor
	// No hardcodear las claves de API aquí por seguridad
	const defaultFirebaseConfig = {
		apiKey: 'PLACEHOLDER_API_KEY',
		authDomain: 'cattle-ea97b.firebaseapp.com',
		projectId: 'cattle-ea97b',
		storageBucket: 'cattle-ea97b.appspot.com',
		messagingSenderId: '643822251307',
		appId: '1:643822251307:web:4c4fd16441a4d71bd0696e',
	}

	// Initialize Firebase
	firebase.initializeApp(defaultFirebaseConfig)
	console.log('[FCM-SW] Firebase initialized with default config')

	// Get messaging instance
	const messaging = firebase.messaging()
	console.log('[FCM-SW] Messaging instance created')

	// Handle background messages
	messaging.onBackgroundMessage((payload) => {
		console.log('[FCM-SW] Received background message:', payload)

		const notificationTitle = payload.notification?.title || 'Nueva notificación'
		const notificationOptions = {
			body: payload.notification?.body || 'Tienes una nueva notificación',
			icon: '/pwa-192x192.png',
			badge: '/pwa-64x64.png',
			tag: 'farm-notification',
			requireInteraction: true,
			data: payload.data || {},
			actions: [
				{
					action: 'view',
					title: 'Ver',
				},
				{
					action: 'dismiss',
					title: 'Cerrar',
				},
			],
		}

		console.log('[FCM-SW] Showing notification:', notificationTitle, notificationOptions)
		return self.registration.showNotification(notificationTitle, notificationOptions)
	})

	console.log('[FCM-SW] Background message handler registered')

} catch (error) {
	console.error('[FCM-SW] Error during initialization:', error)
	// Don't re-throw to avoid breaking the SW registration
}

// Minimal Service Worker lifecycle events - no interfering with PWA
self.addEventListener('install', (event) => {
	console.log('[FCM-SW] Installing...')
	// Don't call skipWaiting to avoid conflicts
})

self.addEventListener('activate', (event) => {
	console.log('[FCM-SW] Activating...')
	// Don't claim clients to avoid conflicts with PWA SW
})

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
	console.log('[FCM-SW] Notification click received:', event)

	event.notification.close()

	if (event.action === 'dismiss') {
		return
	}

	// Focus or open the app window
	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			// If app is already open, focus it
			for (const client of clientList) {
				if (client.url.includes(self.location.origin) && 'focus' in client) {
					return client.focus()
				}
			}
			// If no window is open, open a new one
			if (clients.openWindow) {
				return clients.openWindow('/')
			}
		})
	)
})

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
	console.log('[FCM-SW] Notification closed:', event.notification.tag)
})

console.log('[FCM-SW] Service Worker setup complete')