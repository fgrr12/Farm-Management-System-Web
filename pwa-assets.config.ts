import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
	headLinkOptions: {
		preset: '2023',
	},
	preset: {
		...minimal2023Preset,
		maskable: {
			sizes: [512],
			padding: 0,
			resizeOptions: {
				background: '#054F41',
			},
		},
		apple: {
			sizes: [180],
			padding: 0,
			resizeOptions: {
				background: '#054F41',
			},
		},
	},
	images: ['public/logo.png'],
})
