// Controls the #boot-splash element in app.html. It's there from first paint and
// covers the wait for route modules, which SvelteKit loads before it renders any layout.

/** Marks the current step as done and shows the next one. */
export function showBootStep(label: string): void {
	const steps = document.getElementById('boot-steps')
	if (!steps) return

	markStepsDone(steps)
	const step = document.createElement('li')
	step.textContent = `… ${label}`
	step.dataset.label = label
	steps.append(step)
}

function markStepsDone(steps: HTMLElement): void {
	for (const step of steps.querySelectorAll<HTMLElement>('li:not(.done)')) {
		step.classList.add('done')
		step.textContent = `✓ ${step.dataset.label}`
	}
}

/** Leaves a splash that's already fading out to finish. */
export function removeBootSplash(): void {
	const splash = document.getElementById('boot-splash')
	if (!splash?.dataset.fading) splash?.remove()
}

/** Same timing as the fade the bootstrap layout's blocker used. */
export function fadeOutBootSplash(): void {
	const splash = document.getElementById('boot-splash')
	if (!splash || splash.dataset.fading) return

	const steps = document.getElementById('boot-steps')
	if (steps) markStepsDone(steps)

	splash.dataset.fading = 'true'
	const fade = splash.animate(
		{ opacity: [1, 0] },
		{ delay: 1000, duration: 800, easing: 'cubic-bezier(0.32, 0, 0.67, 0)', fill: 'forwards' }
	)
	fade.onfinish = () => splash.remove()
}
