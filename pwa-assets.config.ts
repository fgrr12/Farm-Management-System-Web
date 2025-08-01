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
				background: 'transparent',
				fit: 'cover',
			},
		},
		apple: {
			sizes: [180],
			padding: 0,
			resizeOptions: {
				background: 'transparent',
				fit: 'cover',
			},
		},
	},
	images: ['public/logo.png'],
})
