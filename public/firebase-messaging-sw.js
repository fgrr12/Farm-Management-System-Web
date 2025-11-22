// Firebase Cloud Messaging Service Worker
// This file is automatically loaded by Firebase when using getToken()

// Firebase configuration storage
let firebaseConfig = null
let isFirebaseInitialized = false

// Import Firebase scripts
try {
	importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
	importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')
	console.log('[FCM-SW] Firebase scripts loaded')
} catch (error) {
	console.error('[FCM-SW] Error loading Firebase scripts:', error)
}

// Initialize Firebase
function initializeFirebase(config) {
	if (isFirebaseInitialized || !config) {
		console.log('[FCM-SW] Firebase already initialized or no config')
		return
	}

	try {
		if (typeof firebase === 'undefined') {
			console.error('[FCM-SW] Firebase not available')
			return
		}

		firebase.initializeApp(config)
		const messaging = firebase.messaging()
		
		messaging.onBackgroundMessage((payload) => {
			console.log('[FCM-SW] Background message received:', payload)
			
			const notificationTitle = payload.notification?.title || 'Nueva notificación'
			const notificationOptions = {
				body: payload.notification?.body || 'Tienes una nueva notificación',
				icon: '/pwa-192x192.png',
				badge: '/pwa-64x64.png',
				data: payload.data || {}
			}

			return self.registration.showNotification(notificationTitle, notificationOptions)
		})
		
		isFirebaseInitialized = true
		console.log('[FCM-SW] Firebase initialized successfully')
		
	} catch (error) {
		console.error('[FCM-SW] Error initializing Firebase:', error)
	}
}

// Listen for messages from main thread
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'FIREBASE_CONFIG') {
		console.log('[FCM-SW] Received Firebase configuration')
		firebaseConfig = event.data.config
		initializeFirebase(firebaseConfig)
	}
})

// Handle push events
self.addEventListener('push', (event) => {
	console.log('[FCM-SW] Push event received')
	
	if (!event.data) {
		return
	}

	try {
		const payload = event.data.json()
		const notificationTitle = payload.notification?.title || 'Nueva notificación'
		const notificationOptions = {
			body: payload.notification?.body || 'Tienes una nueva notificación',
			icon: '/pwa-192x192.png',
			badge: '/pwa-64x64.png',
			data: payload.data || {}
		}

		event.waitUntil(
			self.registration.showNotification(notificationTitle, notificationOptions)
		)
	} catch (error) {
		console.error('[FCM-SW] Error handling push:', error)
	}
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
	console.log('[FCM-SW] Notification clicked')
	event.notification.close()

	if (event.action === 'dismiss') {
		return
	}

	event.waitUntil(
		clients.matchAll({ type: 'window' })
			.then((clientList) => {
				for (const client of clientList) {
					if (client.url.includes(self.location.origin) && 'focus' in client) {
						return client.focus()
					}
				}
				if (clients.openWindow) {
					return clients.openWindow('/')
				}
			})
	)
})

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
	console.log('[FCM-SW] Push subscription changed')
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
	console.log('[FCM-SW] Notification closed')
})

// Service Worker lifecycle
self.addEventListener('install', (event) => {
	console.log('[FCM-SW] Service Worker installing')
	self.skipWaiting()
})

self.addEventListener('activate', (event) => {
	console.log('[FCM-SW] Service Worker activating')
	event.waitUntil(clients.claim())
})

console.log('[FCM-SW] Firebase Messaging Service Worker ready')
