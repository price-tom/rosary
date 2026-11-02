<script lang="ts">
	import { fadeOutBootSplash } from '$lib/core/boot-splash'
	import { onMount } from 'svelte'

	let { children } = $props()

	onMount(fadeOutBootSplash)
</script>

{@render children()}
