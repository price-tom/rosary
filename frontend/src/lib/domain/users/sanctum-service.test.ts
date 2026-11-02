import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError } from '$lib/core/api-errors'
import { api } from '$lib/core/api'
import { sanctumService } from './sanctum-service'

vi.mock('$lib/core/api', () => ({
	api: { get: vi.fn(), post: vi.fn(), ensureCsrfCookie: vi.fn(async () => {}) }
}))

const backendUser = { id: 'u1', email: 'a@example.com', name: null, email_verified_at: null }

describe('sanctumService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		localStorage.clear()
	})

	it('falls back to the email when a new user has no name', async () => {
		vi.mocked(api.post).mockResolvedValue({ user: backendUser })
		expect(await sanctumService.verifyCode('a@example.com', '123456')).toEqual({
			id: 'u1',
			name: 'a@example.com',
			email: 'a@example.com',
			emailVerified: false
		})
	})

	it('treats a 401 from /me as signed out', async () => {
		localStorage.setItem('user', '{}')
		vi.mocked(api.get).mockRejectedValue(new ApiError('Unauthorized', 401, {}))
		expect(await sanctumService.getCurrentUser()).toBeNull()
		expect(localStorage.getItem('user')).toBeNull()
	})

	it('rethrows other errors from /me', async () => {
		vi.mocked(api.get).mockRejectedValue(new ApiError('Server Error', 500, {}))
		await expect(sanctumService.getCurrentUser()).rejects.toBeInstanceOf(ApiError)
	})

	it('clears the stored user and refreshes the CSRF cookie on logout', async () => {
		localStorage.setItem('user', '{}')
		vi.mocked(api.post).mockResolvedValue(null)
		await sanctumService.logout()
		expect(localStorage.getItem('user')).toBeNull()
		expect(api.ensureCsrfCookie).toHaveBeenCalledWith(true)
	})
})
