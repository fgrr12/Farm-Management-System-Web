import react from '@vitejs/plugin-react'
import * as path from 'path'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	root: './',
	publicDir: './public',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	plugins: [unocss(), react()],
})
