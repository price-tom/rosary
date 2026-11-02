import { describe, it, expect, beforeEach } from 'vitest'
import { removeBootSplash, showBootStep } from './boot-splash'

describe('boot splash', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div id="boot-splash"><ul id="boot-steps"></ul></div>'
	})

	it('marks the previous step done when the next one starts', () => {
		showBootStep('Signing in')
		showBootStep('Loading')

		const steps = [...document.querySelectorAll('#boot-steps li')].map((li) => li.textContent)
		expect(steps).toEqual(['✓ Signing in', '… Loading'])
	})

	it('does nothing once the splash is gone', () => {
		removeBootSplash()

		expect(() => showBootStep('Signing in')).not.toThrow()
		expect(document.querySelector('#boot-steps')).toBeNull()
	})
})
