<script lang="ts">
	import { fade } from 'svelte/transition'

	interface Props {
		message: string
		onClose?: (value: string | boolean | null) => void
		prompt?: boolean
		visible?: boolean
	}

	let { message, onClose, prompt = false, visible = $bindable(true) }: Props = $props()

	let inputValue = $state('')

	function handleConfirm() {
		if (prompt) {
			onClose?.(inputValue)
		} else {
			onClose?.(true)
		}
		visible = false
	}

	function handleCancel() {
		onClose?.(null)
		visible = false
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!visible) {
			return
		}
		if (event.key === 'Enter') {
			event.preventDefault()
			handleConfirm()
		} else if (event.key === 'Escape') {
			handleCancel()
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />
{#if visible}
	<div class="backdrop bg-surface-1/70 backdrop-blur" transition:fade={{ duration: 200 }}>
		<div class="modal flex flex-col gap-6">
			<p>{message}</p>
			{#if prompt}
				<input bind:value={inputValue} type="text" />
			{/if}
			<div class="flex gap-3">
				<button class="rounded-button" onclick={handleConfirm}>OK</button>
				<!-- <button class="rounded-button" onclick={handleCancel}>Cancel</button> -->
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}
	.modal {
		min-width: 300px;
	}
</style>
