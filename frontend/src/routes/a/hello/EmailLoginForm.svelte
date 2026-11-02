<script lang="ts">
	import Modal from '$lib/components/Modal.svelte'
	import { loginViewContext } from '$lib/state/login-view.svelte'
	import { scale } from 'svelte/transition'
	import { gotoRoute, routes } from '$lib/core/routes'
	import type { LoginForm, Field } from '$lib/types/forms'
	import { api } from '$lib/core/api'
	import { sanctumService } from '$lib/domain/users/sanctum-service'
	import LoadingBlocker from '$lib/components/LoadingBlocker.svelte'

	// Functional Domain Types & Validators

	type StepConfig = Field & {
		validate: (form: LoginForm) => boolean
		action: (form: LoginForm) => Promise<void> | void
	}

	const isNonEmpty = (str: string): boolean => str.trim().length > 0
	const isValidEmail = (email: string): boolean => isNonEmpty(email) && email.includes('@')

	const steps: StepConfig[] = [
		{
			id: 'email',
			name: 'email',
			type: 'email',
			label: 'EMAIL',
			autocomplete: 'username',
			validate: (form) => isValidEmail(form.email),
			action: (form) => sendCode(form.email)
		},
		{
			id: 'code',
			name: 'code',
			type: 'text',
			label: 'code',
			autocomplete: 'off',
			validate: (form) => isNonEmpty(form.code),
			action: (form) => verifyCode(form.email, form.code)
		}
	]

	// Reactive State
	let formRef = $state<HTMLFormElement | null>(null)
	let visibleFieldId = $state(0)
	let isLoading = $state(false)
	let showModal = $state(false)
	let modalOptions = $state({ title: '', message: '' })

	let formData = $state<LoginForm>({
		email: '',
		code: ''
	})

	const currentStep = $derived(steps[visibleFieldId])
	const isCurrentStepValid = $derived(currentStep?.validate(formData) ?? false)

	// Event Handlers / Step Execution

	const nextStep = (current: number, max: number): number =>
		current < max - 1 ? current + 1 : current

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault()
		if (!isCurrentStepValid) return

		try {
			const isLastStep = visibleFieldId === steps.length - 1
			await currentStep.action(formData)
			if (isLastStep) {
				await gotoRoute(routes.home)
				return
			}
			visibleFieldId = nextStep(visibleFieldId, steps.length)
		} catch (error) {
			modalOptions = {
				title: 'Error',
				message:
					error instanceof Error
						? error.message
						: 'An error occurred. Please try again at a later time.'
			}
			showModal = true
		}
	}
	const sendCode = async (email: string) => {
		await api.post('/auth/send-code', { email })
	}

	const verifyCode = async (email: string, code: string) => {
		await sanctumService.verifyCode(email, code)
	}

	// Keyboard Navigation (Focus Trap)

	const onKeyDown = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'Tab':
				if (!formRef) return

				const focusableElements = Array.from(
					formRef.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled])')
				)

				if (focusableElements.length === 0) return

				e.preventDefault()
				const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
				const nextIndex = currentIndex + 1 < focusableElements.length ? currentIndex + 1 : 0
				focusableElements[nextIndex].focus()
				break

			case 'Enter':
				// If focus is not already on a button, trigger form submission explicitly
				if (document.activeElement?.tagName !== 'BUTTON' && formRef) {
					e.preventDefault()
					formRef.requestSubmit()
				}
				break

			case 'Escape':
				cancelFn()
				break
		}
	}

	const cancelFn = () => (loginViewContext.chromeVisible = !loginViewContext.chromeVisible)

	// Svelte Action for auto-focusing elements when they enter the DOM
	const focusAction = (node: HTMLElement) => {
		requestAnimationFrame(() => node.focus())
	}
</script>

<svelte:window onkeydown={onKeyDown} />

<form bind:this={formRef} onsubmit={handleSubmit} class="relative w-full">
	{#each steps as field, index (field.id)}
		{#if visibleFieldId === index}
			<div class="flex flex-col gap-4" in:scale={{ delay: 300 }}>
				{@render formStep(field, formData)}

				<div class="flex flex-col gap-2">
					<button type="submit" class="rounded-button" disabled={!isCurrentStepValid}>
						CONTINUE
					</button>
					<button type="button" class="rounded-button" onclick={cancelFn}> CANCEL </button>
				</div>
			</div>
		{/if}
	{/each}

	{#if isLoading}
		<div
			class="absolute inset-0 flex items-center justify-center bg-base"
			out:scale={{ duration: 300, delay: 200 }}
			in:scale={{ duration: 300, delay: 200 }}
		>
			<LoadingBlocker />
		</div>
	{/if}
</form>

{#if showModal}
	<Modal message={modalOptions.message} bind:visible={showModal} />
{/if}

{#snippet formStep(field: Field, formData: LoginForm)}
	<div class="flex flex-col gap-1">
		<label for={field.id} class="sr-only">
			{field.label}
		</label>
		<input
			id={field.id}
			name={field.name}
			type={field.type}
			bind:value={formData[field.id]}
			autocomplete={field.autocomplete}
			placeholder={field.label}
			class="text-center border-2 border-text/70 hover:border-text focus:border-text"
			{@attach focusAction}
		/>
	</div>
{/snippet}
