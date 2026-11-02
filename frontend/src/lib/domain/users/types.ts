/**
 * @fileoverview Type definitions for the users domain
 */

/**
 * DTO: User object as it arrives from the Laravel/PHP backend.
 * Keeps the snake_case from the server.
 */
export interface BackendUser {
	id: string
	email: string
	name?: string | null
	email_verified_at?: string | null
}

/**
 * Domain Model: User object as used by your Svelte components.
 * Normalized to camelCase and easier to work with in JS.
 */
export interface AppUser {
	id: string
	name: string
	email: string
	emailVerified: boolean
}

/** Sign-in response from POST /auth/verify-code. */
export interface AuthResponse {
	user: BackendUser
}

export interface AuthService {
	verifyCode(email: string, code: string): Promise<AppUser>
	logout(): Promise<void>
	getCurrentUser(): Promise<AppUser | null>
	signInWithGoogle(): void
}
