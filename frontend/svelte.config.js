import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const outDir = 'build'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: outDir,
			assets: outDir,
			fallback: 'index.html',
			precompress: false
		}),
		serviceWorker: {
			register: false
		}
	},
	vitePlugin: {
		inspector: true
	},
	preprocess: vitePreprocess()
}

export default config
