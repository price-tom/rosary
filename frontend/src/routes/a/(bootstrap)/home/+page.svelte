<script lang="ts">
	import Modal from '$lib/components/Modal.svelte'
	import { app } from '$lib/core/app.svelte'
	import { routes } from '$lib/core/routes'
	import { sanctumService } from '$lib/domain/users/sanctum-service'

	let error = $state('')

	async function signOut() {
		try {
			await sanctumService.logout()
			// A full page load discards all signed-in state.
			window.location.assign(routes.login.href)
		} catch {
			error = 'Could not sign out. Please try again.'
		}
	}
</script>

<main class="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
	<h1 class="text-xl">Signed in as {app.state.user?.email}</h1>
	<div class="w-48">
		<button type="button" class="rounded-button w-full" onclick={signOut}>Sign out</button>
	</div>
</main>

{#if error}
	<Modal message={error} onClose={() => (error = '')} />
{/if}
