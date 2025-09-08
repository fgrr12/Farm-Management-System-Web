// Custom Service Worker with PWA + Firebase Messaging
/// <reference types="vite/client" />
/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare const self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: any
}

// PWA Configuration
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Navigation route for SPA
const navigationRoute = new NavigationRoute(createHandlerBoundToURL('index.html'), {
	allowlist: [/^\/$/],
})
registerRoute(navigationRoute)

// Claim clients immediately
clientsClaim()

// Firebase Messaging Integration
let isFirebaseInitialized = false
let firebaseConfig: any = null

// Initialize Firebase safely (no import, will be passed by main thread)
function initializeFirebaseMessaging(config: any) {
	try {
		if (!isFirebaseInitialized && config) {
			firebaseConfig = config
			isFirebaseInitialized = true
			console.log('[SW] Firebase config received and ready')
		}
	} catch (error) {
		console.error('[SW] Error initializing Firebase:', error)
	}
}

// Listen for messages from main thread
self.addEventListener('message', (event) => {
	if (event.data?.type === 'FIREBASE_CONFIG') {
		initializeFirebaseMessaging(event.data.config)
	} else if (event.data?.type === 'SKIP_WAITING') {
		self.skipWaiting()
	}
})

// Push event handler
self.addEventListener('push', (event) => {
	console.log('[SW] Push event received:', event)

	if (!event.data) {
		console.log('[SW] No data in push event')
		return
	}

	try {
		const payload = event.data.json()
		console.log('[SW] Push payload:', payload)

		const notificationTitle = payload.notification?.title || 'Nueva notificación'
		const notificationOptions = {
			body: payload.notification?.body || 'Tienes una nueva notificación',
			icon: payload.notification?.icon || '/pwa-192x192.png',
			badge: payload.notification?.badge || '/pwa-64x64.png',
			tag: payload.notification?.tag || 'farm-notification',
			data: payload.data || {},
			requireInteraction: true,
			actions: [
				{
					action: 'view',
					title: 'Ver',
					icon: '/pwa-64x64.png',
				},
				{
					action: 'close',
					title: 'Cerrar',
				},
			],
		}

		event.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions))
	} catch (error) {
		console.error('[SW] Error handling push event:', error)

		// Fallback notification
		event.waitUntil(
			self.registration.showNotification('Nueva notificación', {
				body: 'Tienes una nueva notificación',
				icon: '/pwa-192x192.png',
				tag: 'farm-notification-fallback',
			})
		)
	}
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
	console.log('[SW] Notification click received:', event)

	event.notification.close()

	if (event.action === 'close') {
		return
	}

	// Open or focus the app
	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			// Try to focus existing window
			for (const client of clientList) {
				if (client.url.includes(self.location.origin) && 'focus' in client) {
					return client.focus()
				}
			}

			// Open new window if none exists
			if (self.clients.openWindow) {
				return self.clients.openWindow('/')
			}
		})
	)
})

// Background message handler (when app is closed)
self.addEventListener('message', (event) => {
	if (event.data?.type === 'BACKGROUND_MESSAGE') {
		console.log('[SW] Background message received:', event.data.payload)

		const { title, body, data } = event.data.payload

		self.registration.showNotification(title || 'Nueva notificación', {
			body: body || 'Tienes una nueva notificación',
			icon: '/pwa-192x192.png',
			badge: '/pwa-64x64.png',
			data: data || {},
			tag: 'background-message',
			requireInteraction: true,
		})
	}
})

// Install event
self.addEventListener('install', () => {
	console.log('[SW] Service Worker installed')
	self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
	console.log('[SW] Service Worker activated')
	event.waitUntil(self.clients.claim())
})
function initializeFirebase(config: any) {
	if (isFirebaseInitialized) {
		console.log('[SW] Firebase already initialized, skipping...')
		return
	}

	if (!config || !config.projectId || !config.apiKey || !config.messagingSenderId) {
		console.error('[SW] Invalid Firebase configuration')
		return
	}

	try {
		// Import Firebase scripts dynamically
		self.importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
		self.importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

		// Check if Firebase is available
		if (typeof (self as any).firebase === 'undefined') {
			console.error('[SW] Firebase not available')
			return
		}
		// Initialize Firebase app
		;(self as any).firebase.initializeApp(config)
		const messaging = (self as any).firebase.messaging()

		// Set up background message handler
		messaging.onBackgroundMessage((payload: any) => {
			console.log('[SW] Background message received:', payload)

			const notificationTitle = payload.notification?.title || 'Nueva notificación'
			const notificationOptions = {
				body: payload.notification?.body || 'Tienes una nueva notificación',
				icon: '/pwa-192x192.png',
				badge: '/pwa-64x64.png',
				tag: 'farm-notification',
				data: payload.data || {},
			}

			return self.registration.showNotification(notificationTitle, notificationOptions)
		})

		isFirebaseInitialized = true
		console.log('[SW] Firebase initialized successfully')
	} catch (error) {
		console.error('[SW] Error initializing Firebase:', error)
	}
}

// Listen for configuration from main thread
self.addEventListener('message', (event: ExtendableMessageEvent) => {
	if (event.data && event.data.type === 'FIREBASE_CONFIG') {
		console.log('[SW] Received Firebase configuration')
		firebaseConfig = event.data.config
		initializeFirebase(firebaseConfig)
	}

	// Handle skipWaiting message
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting()
	}
})

// Handle push events (required at script evaluation)
self.addEventListener('push', (event: PushEvent) => {
	console.log('[SW] Push event received')

	if (!event.data) {
		console.log('[SW] No push data')
		return
	}

	try {
		const payload = event.data.json()
		console.log('[SW] Push payload:', payload)

		const notificationTitle = payload.notification?.title || 'Nueva notificación'
		const notificationOptions = {
			body: payload.notification?.body || 'Tienes una nueva notificación',
			icon: '/pwa-192x192.png',
			badge: '/pwa-64x64.png',
			tag: 'farm-notification',
			requireInteraction: true,
			data: payload.data || {},
			actions: [
				{ action: 'view', title: 'Ver' },
				{ action: 'dismiss', title: 'Cerrar' },
			],
		}

		event.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions))
	} catch (error) {
		console.error('[SW] Error handling push:', error)
	}
})

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (_event: Event) => {
	console.log('[SW] Push subscription changed')
	// Handle subscription renewal if needed
})

// Handle notification clicks
self.addEventListener('notificationclick', (event: NotificationEvent) => {
	console.log('[SW] Notification clicked:', event.action)

	event.notification.close()

	if (event.action === 'dismiss') {
		return
	}

	// Open or focus the app
	event.waitUntil(
		self.clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((clientList: readonly WindowClient[]) => {
				// Try to focus existing window
				for (const client of clientList) {
					if (client.url.includes(self.location.origin) && 'focus' in client) {
						return client.focus()
					}
				}
				// Open new window if none exists
				if (self.clients.openWindow) {
					return self.clients.openWindow('/')
				}
			})
	)
})

// Handle notification close
self.addEventListener('notificationclose', (event: NotificationEvent) => {
	console.log('[SW] Notification closed:', event.notification.tag)
})

console.log('[SW] Custom Service Worker loaded')
