<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import type RealtimeKitClient from '@cloudflare/realtimekit'
	import Modal from '$lib/components/Modal.svelte'
	import { Logger } from '$lib/core/logger'
	import { gotoRoute, routes } from '$lib/core/routes'
	import { prayerRoomService } from '$lib/domain/prayer-room/prayer-room-service'

	type Meeting = Awaited<ReturnType<typeof RealtimeKitClient.init>>
	type MeetingElement = HTMLElement & { meeting?: Meeting }

	let meetingEl: MeetingElement | undefined = $state()
	let meeting: Meeting | null = null
	let loading = $state(true)
	let error = $state('')

	function onStatesUpdate(event: Event) {
		const states = (event as CustomEvent<{ meeting?: string }>).detail
		if (states?.meeting === 'ended') gotoRoute(routes.home)
	}

	onMount(async () => {
		try {
			// Loaded here so the meeting code is only downloaded when someone joins.
			const [{ default: Client }, { defineCustomElements }, token] = await Promise.all([
				import('@cloudflare/realtimekit'),
				import('@cloudflare/realtimekit-ui/loader'),
				prayerRoomService.getJoinToken()
			])
			defineCustomElements()
			meeting = await Client.init({ authToken: token })
			if (meetingEl) meetingEl.meeting = meeting
		} catch (e) {
			Logger.error('Could not join the prayer room', e)
			error = 'Could not join the prayer room. Please try again.'
		} finally {
			loading = false
		}
	})

	onDestroy(() => {
		meeting?.leave().catch(() => {})
	})
</script>

<main class="flex h-dvh flex-col">
	{#if loading}
		<p class="m-auto">Joining the prayer room…</p>
	{/if}
	<rtk-meeting
		bind:this={meetingEl}
		class="min-h-0 flex-1"
		class:hidden={loading || error}
		mode="fill"
		show-setup-screen="true"
		onrtkStatesUpdate={onStatesUpdate}
	></rtk-meeting>
</main>

{#if error}
	<Modal message={error} onClose={() => gotoRoute(routes.home)} />
{/if}
