import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
	headLinkOptions: {
		preset: '2023',
	},
	preset: {
		...minimal2023Preset,
		maskable: {
			sizes: [512],
			padding: 0.3,
			resizeOptions: {
				background: '#10b981',
			},
		},
		apple: {
			sizes: [180],
			padding: 0.3,
			resizeOptions: {
				background: '#10b981',
			},
		},
	},
	images: ['public/logo.png'],
})
