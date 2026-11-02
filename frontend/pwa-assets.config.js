import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
	headLinkOptions: {
		preset: '2023'
	},
	preset: {
		...minimal2023Preset,
		// Override the maskable icon to ensure proper padding
		maskable: {
			sizes: [512],
			padding: 0.1
		},
		// Apple touch icons
		apple: {
			sizes: [180],
			padding: 0
		}
	},
	images: ['static/logo.svg']
})
