import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.js'],
		include: [
			'src/**/*.{test,spec}.{js,ts,svelte}',
			'src/**/*.test.svelte.ts',
			'examples/**/*.{test,spec}.{js,ts,svelte}'
		]
	},
	resolve: {
		alias: {
			$lib: '/src/lib'
		},
		conditions: process.env.VITEST ? ['browser'] : undefined
	}
})
