<script>
	import { app } from '$lib/core/app.svelte'
	import { onMount } from 'svelte'
	import { uninstallPWA } from '$lib/core/pwa-service'

	let userId = $state('NA')

	onMount(() => {
		const user = localStorage.getItem('user')
		if (user) {
			userId = JSON.parse(user).id
		}
	})
</script>

{#if !app.state.debugPanelVisible}
	<button
		class="fixed bg-base/50 z-10 border opacity-75 bottom-1 right-1 h-[2em] w-[5em] p-2 rounded flex items-center justify-center"
		onclick={() => (app.state.debugPanelVisible = true)}
	>
		Debug
	</button>
{:else}
	<div
		class="grid grid-cols-2 fixed right-1 bottom-1 gap-1 p-3 backdrop-blur-lg z-10 border-base border rounded-md opacity-90"
	>
		<div>Authenticated</div>
		<div>
			{app.state.isAuthenticated}
		</div>
		<div>User Id</div>
		<div>
			{userId}
		</div>
		<div>&nbsp;</div>
		<div>
			<button class="border p-1 rounded-sm" onclick={() => uninstallPWA()}>Reset</button>
		</div>
	</div>
{/if}
