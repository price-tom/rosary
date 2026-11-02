<script>
	import { onMount } from 'svelte'
	import { fade, scale, slide } from 'svelte/transition'
	import { quadOut, quadIn } from 'svelte/easing'
	import { replaceState } from '$app/navigation'
	import { loginViewContext } from '$lib/state/login-view.svelte'
	import { GOOGLE_ERROR_MESSAGES } from '$lib/domain/users/sanctum-service'
	import Modal from '$lib/components/Modal.svelte'
	import GoogleLogin from './GoogleLogin.svelte'
	import EmailLoginForm from './EmailLoginForm.svelte'
	import Logo from '$lib/components/Logo.svelte'

	let oauthError = $state('')

	onMount(() => {
		const url = new URL(window.location.href)
		const code = url.searchParams.get('error')
		if (!code) return

		oauthError = GOOGLE_ERROR_MESSAGES[code] ?? GOOGLE_ERROR_MESSAGES.google_failed
		url.searchParams.delete('error')
		replaceState(url, {})
	})
</script>

<div class="container">
	<header>
		{#if loginViewContext.chromeVisible}
			<div
				out:fade={{ duration: 300, easing: quadIn }}
				in:fade={{ duration: 300, easing: quadOut, delay: 300 }}
				class="logo-wrapper"
			>
				<Logo />
			</div>
		{/if}
	</header>
	<main>
		{#if !loginViewContext.chromeVisible}
			<div
				in:fade={{ duration: 300, easing: quadOut, delay: 300 }}
				out:scale={{ duration: 300, easing: quadIn }}
				class="z-10 auth-button-group"
			>
				<EmailLoginForm />
			</div>
		{:else}
			<div
				class="auth-button-group"
				in:fade={{ duration: 300, easing: quadOut, delay: 300 }}
				out:scale={{ duration: 300, easing: quadIn }}
			>
				<GoogleLogin />
				<button
					type="button"
					onclick={() => (loginViewContext.chromeVisible = !loginViewContext.chromeVisible)}
					class="rounded-button auth-button"
				>
					Sign in with Email
				</button>
			</div>
		{/if}
	</main>
	<footer class="footer-section">
		{#if loginViewContext.chromeVisible}
			<div
				in:fade={{ duration: 300, easing: quadOut, delay: 500 }}
				out:fade={{ duration: 300, easing: quadIn }}
				class="footer-content"
			>
				<a class="text-subtext-0/70 text-sm hover:text-subtext-0" href="/a/privacy">
					Privacy Policy
				</a>
				<a class="text-subtext-0/70 text-sm hover:text-subtext-0" href="/a/terms"> Terms of Use </a>
			</div>
		{/if}
	</footer>
</div>

{#if oauthError}
	<Modal message={oauthError} visible={true} onClose={() => (oauthError = '')} />
{/if}

<style>
	:root {
		--phi: 1.61803;
		--phi-reciprocal: calc(1 / var(--phi)); /* ~0.61803 (61.8%) */
		--phi-remainder: calc(1 - var(--phi-reciprocal)); /* ~0.38197 (38.2%) */
	}

	.container {
		display: grid;
		height: 100vh;
		width: calc(var(--phi-remainder) * 100vw);
		grid-template-rows: 33.33vh 33.33vh 33.3vh;
		margin: 0 auto;
	}

	header {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.logo-wrapper {
		height: 100%;
		width: 6em;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	main {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button {
		width: 100%;
	}

	.auth-button-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: calc(1rem / var(--phi));
		width: calc(var(--phi-reciprocal) * 100%);
		min-width: 12em;
	}

	.footer-section {
		display: flex;
		align-items: flex-end;
		height: 100%;
	}

	.footer-content {
		display: flex;
		justify-content: space-between;
		width: 100%;
		height: calc(var(--phi-remainder) / 2 * 100%);
	}
</style>
