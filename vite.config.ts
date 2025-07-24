import * as path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import unocss from 'unocss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	root: './',
	publicDir: './public',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/tests/setup.ts'],
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
	},
	plugins: [
		unocss(),
		tailwindcss(),
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
			manifest: {
				name: 'Cattle - Farm Management',
				short_name: 'Cattle',
				description: 'Complete farm management application for livestock operations',
				theme_color: '#10b981',
				background_color: '#ffffff',
				display: 'standalone',
				orientation: 'portrait',
				scope: '/',
				start_url: '/',
				categories: ['productivity', 'business'],
				lang: 'en',
				icons: [
					{
						src: 'pwa-64x64.png',
						sizes: '64x64',
						type: 'image/png',
					},
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: 'maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
				skipWaiting: true,
				clientsClaim: true,
			},
			devOptions: {
				enabled: true,
			},
		}),
	],
	build: {
		target: 'esnext',
		minify: 'terser',
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// React ecosystem
					if (id.includes('react') || id.includes('react-dom')) {
						return 'react-vendor'
					}
					// Firebase
					if (id.includes('firebase')) {
						return 'firebase-vendor'
					}
					// GSAP animations
					if (id.includes('gsap')) {
						return 'gsap-vendor'
					}
					// i18n
					if (id.includes('i18next') || id.includes('react-i18next')) {
						return 'i18n-vendor'
					}
					// UI libraries
					if (id.includes('floating-ui') || id.includes('pragmatic-drag-and-drop')) {
						return 'ui-vendor'
					}
					// Date libraries
					if (id.includes('dayjs') || id.includes('react-day-picker')) {
						return 'date-vendor'
					}
					// Router
					if (id.includes('react-router')) {
						return 'router-vendor'
					}
					// State management
					if (id.includes('zustand')) {
						return 'state-vendor'
					}
					// Node modules general
					if (id.includes('node_modules')) {
						return 'vendor'
					}
				},
				chunkFileNames: 'assets/[name]-[hash].js',
				entryFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash].[ext]',
			},
		},
		chunkSizeWarningLimit: 1000,
		sourcemap: false,
	},
})
