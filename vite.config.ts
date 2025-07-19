import * as path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import unocss from 'unocss/vite'
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
	plugins: [unocss(), tailwindcss(), react()],
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
