import { dev } from '$app/environment'
import type { HandleClientError } from '@sveltejs/kit'

/** Service worker registration reference */
let swRegistration: ServiceWorkerRegistration | null = null

/** @type {import('@sveltejs/kit').ClientInit} */
export async function init() {
	// Capture install prompt event
	if (typeof window !== 'undefined') {
		window.addEventListener('beforeinstallprompt', (event) => {
			// Prevent the mini-infobar from appearing on mobile
			event.preventDefault()
			// Dispatch custom event for components to react
			window.dispatchEvent(new CustomEvent('pwa-install-available'))
		})

		// Track when app is installed
		window.addEventListener('appinstalled', () => {
			window.dispatchEvent(new CustomEvent('pwa-installed'))
		})
	}

	// Only register service worker in production
	if (!dev && 'serviceWorker' in navigator) {
		try {
			swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
				type: 'classic'
			})

			// Check for updates on registration
			swRegistration.addEventListener('updatefound', () => {
				const newWorker = swRegistration?.installing
				if (!newWorker) return

				newWorker.addEventListener('statechange', () => {
					if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
						// New service worker is installed and there's an existing one
						// Dispatch event to notify app of available update
						window.dispatchEvent(new CustomEvent('pwa-update-available'))
					}
				})
			})

			// Listen for controller change (after skipWaiting)
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				// New service worker has taken control
				window.dispatchEvent(new CustomEvent('pwa-updated'))
			})

			// Listen for messages from service worker
			navigator.serviceWorker.addEventListener('message', (event) => {
				if (event.data?.type === 'ONLINE_STATUS') {
					window.dispatchEvent(
						new CustomEvent('pwa-online-status', {
							detail: { online: event.data.online }
						})
					)
				}
			})

			console.log('Service worker registered successfully:', swRegistration?.scope)
		} catch (error) {
			console.error('Service worker registration failed:', error)
			// Don't re-throw the error to prevent it from breaking the app
		}
	}
}

export const handleError: HandleClientError = async ({ error, event }) => {
	console.log('Client error:', { error, event })
	return error as App.Error
}
