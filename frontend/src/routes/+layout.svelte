<script lang="ts">
	import { dev } from '$app/environment'
	import { removeBootSplash } from '$lib/core/boot-splash'
	import { onMount } from 'svelte'

	import '../app.css'
	import DebugPanel from './DebugPanel.svelte'

	let { children } = $props()

	// Routes outside (bootstrap) have nothing to wait for; that layout has already started its fade.
	onMount(removeBootSplash)
</script>

{@render children()}

{#if dev}
	<DebugPanel />
{/if}
