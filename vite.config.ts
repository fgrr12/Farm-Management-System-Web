import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import * as path from 'node:path'
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
		environment: 'happy-dom',
		setupFiles: ['./src/tests/setup.ts'],
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
	},
	plugins: [unocss(), tailwindcss(), react()],
})
