import { api } from '$lib/core/api'

interface JoinResponse {
	token: string
}

/**
 * The shared prayer room, a Cloudflare RealtimeKit meeting. The backend adds the
 * signed-in user as a participant and returns their RealtimeKit auth token.
 */
export const prayerRoomService = {
	async getJoinToken(): Promise<string> {
		const { token } = await api.post<JoinResponse>('/prayer-room/join')
		return token
	}
}
