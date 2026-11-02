import { vi } from 'vitest'

// Setup mock browser environment
global.fetch = vi.fn()

// Don't override the document object, just set the cookie
if (global.document) {
	document.cookie = 'XSRF-TOKEN=test-token'
}
