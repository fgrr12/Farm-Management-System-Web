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
		rollupOptions: {
			output: {
				manualChunks: {
					react: ['react', 'react-dom'],
					firebase: ['firebase/app', 'firebase/firestore'],
					i18n: ['i18next', 'react-i18next'],
				},
			},
		},
	},
})
