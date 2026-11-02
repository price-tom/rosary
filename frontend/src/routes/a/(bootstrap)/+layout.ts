import { app } from '$lib/core/app.svelte'
import type { LayoutLoad } from './$types'

export const prerender = false

// SvelteKit runs this as soon as this file is imported, without waiting for the page's modules.
export const load: LayoutLoad = async () => {
	await app.initialize()
}
