import { api } from '$lib/core/api'
import { ApiError } from '$lib/core/api-errors'
import type { AppUser, AuthResponse, AuthService, BackendUser } from './types'

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL

export const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
	no_account: 'Could not sign in with that Google account. Please try again.',
	google_failed: 'Google sign-in was cancelled or failed. Please try again.'
}

export class SanctumService implements AuthService {
	public async verifyCode(email: string, code: string) {
		const { user } = await api.post<AuthResponse>('/auth/verify-code', {
			email,
			code
		})
		return this.toAppUser(user)
	}

	public async logout(): Promise<void> {
		try {
			await api.post('/logout')
		} finally {
			localStorage.removeItem('user')
			await api.ensureCsrfCookie(true).catch(() => {})
		}
	}

	public async getCurrentUser() {
		try {
			const user = this.toAppUser(await api.get<BackendUser>('/me'))
			localStorage.setItem('user', JSON.stringify(user))
			return user
		} catch (error) {
			if (error instanceof ApiError && [401, 403, 419].includes(error.status)) {
				localStorage.removeItem('user')
				return null
			}
			throw error
		}
	}

	public signInWithGoogle(): void {
		const url = new URL('/auth/google/redirect', BASE_API_URL)
		window.location.assign(url)
	}

	private toAppUser(user: BackendUser): AppUser {
		return {
			id: user.id,
			name: user.name || user.email,
			email: user.email,
			emailVerified: !!user.email_verified_at
		}
	}
}

export const sanctumService = new SanctumService()
