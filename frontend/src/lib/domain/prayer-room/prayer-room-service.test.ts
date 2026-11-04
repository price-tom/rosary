import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError } from '$lib/core/api-errors'
import { api } from '$lib/core/api'
import { prayerRoomService } from './prayer-room-service'

vi.mock('$lib/core/api', () => ({
	api: { post: vi.fn() }
}))

describe('prayerRoomService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('returns the participant token from the backend', async () => {
		vi.mocked(api.post).mockResolvedValue({ token: 'participant-token' })
		expect(await prayerRoomService.getJoinToken()).toBe('participant-token')
		expect(api.post).toHaveBeenCalledWith('/prayer-room/join')
	})

	it('passes API errors through', async () => {
		vi.mocked(api.post).mockRejectedValue(new ApiError('Server Error', 500, {}))
		await expect(prayerRoomService.getJoinToken()).rejects.toBeInstanceOf(ApiError)
	})
})
