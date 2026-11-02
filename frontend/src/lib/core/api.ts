import { ApiError, type DefaultErrorResponse } from './api-errors'
import { backendOrigin } from './platform'
import { Logger } from '$lib/core/logger'
export { ApiError, type DefaultErrorResponse }

const API_ENDPOINT = import.meta.env.VITE_API_BASE_URL + '/api'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/** Laravel's CSRF token-mismatch status. */
const CSRF_MISMATCH = 419

function readCookie(name: string): string | null {
	const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
	return match ? decodeURIComponent(match[1]) : null
}

/**
 * Talks to the Laravel API with Sanctum's cookie auth: an HttpOnly session cookie
 * (`credentials: 'include'`) plus the XSRF-TOKEN cookie echoed back as
 * `X-XSRF-TOKEN` on unsafe methods.
 */
class ApiService {
	private csrfReady: Promise<void> | null = null

	/**
	 * Primes Sanctum's XSRF-TOKEN cookie. Only needed once per session; call
	 * again with `force` after a 419 or after login/logout rotates the token.
	 */
	ensureCsrfCookie(force = false): Promise<void> {
		// If a request is already in-flight and not forced, reuse the existing promise
		if (!force && this.csrfReady) {
			return this.csrfReady
		}

		// Construct base URL (ensuring no trailing /api or double slashes)
		const baseUrl = backendOrigin().replace(/\/api\/?$/, '')

		this.csrfReady = fetch(`${baseUrl}/sanctum/csrf-cookie`, {
			method: 'GET',
			credentials: 'include',
			headers: { Accept: 'application/json' }
		})
			.then((response) => {
				if (!response.ok) {
					this.csrfReady = null
					throw new ApiError('Could not initialize CSRF session', response.status, {})
				}
			})
			.catch((err) => {
				this.csrfReady = null
				throw err
			})

		return this.csrfReady
	}

	/**
	 * Adds the auth headers to a request.
	 */
	private async withAuth(method: string, init?: HeadersInit): Promise<Headers> {
		const headers = new Headers(init)
		// Default to JSON, but let callers opt into other content (e.g. SSE streams).
		if (!headers.has('Accept')) headers.set('Accept', 'application/json')

		if (!SAFE_METHODS.has(method.toUpperCase())) {
			await this.ensureCsrfCookie()
			const xsrf = readCookie('XSRF-TOKEN')
			if (xsrf) headers.set('X-XSRF-TOKEN', xsrf)
		}
		return headers
	}

	/**
	 * `fetch` with auth applied, for callers that need the raw Response.
	 */
	async authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
		const method = init.method ?? 'GET'
		const headers = await this.withAuth(method, init.headers)
		return fetch(input, {
			...init,
			headers,
			credentials: 'include'
		})
	}

	private async request<T, E = DefaultErrorResponse>(
		endpoint: string,
		options: RequestInit = {},
		retried = false
	): Promise<T> {
		const url = this.createEndpoint(endpoint)

		const headers = new Headers(options.headers)
		if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
			headers.set('Content-Type', 'application/json')
		}

		const response = await this.authorizedFetch(url, { ...options, headers })

		// Stale XSRF token (session expired or rotated): refresh once and retry.
		if (response.status === CSRF_MISMATCH && !retried) {
			await this.ensureCsrfCookie(true)
			return this.request<T, E>(endpoint, options, true)
		}
		if (!response.ok) {
			const errorData = (await response.json().catch(() => ({}))) as E
			throw new ApiError<E>(
				(errorData as any)?.message || response.statusText,
				response.status,
				errorData
			)
		}
		if (response.status === 204) return null as T

		try {
			const result = await response.json()
			return result?.data ?? result
		} catch {
			return undefined as T
		}
	}

	get<T, E = DefaultErrorResponse>(url: string) {
		Logger.info('api url:', { url })
		return this.request<T, E>(url, { method: 'GET' })
	}

	post<T, E = DefaultErrorResponse>(url: string, body?: any) {
		return this.request<T, E>(url, {
			method: 'POST',
			body: body instanceof FormData ? body : JSON.stringify(body)
		})
	}

	put<T, E = DefaultErrorResponse>(url: string, body?: any) {
		Logger.info('api put url:', { url, body })
		return this.request<T, E>(url, {
			method: 'PUT',
			body: body instanceof FormData ? body : JSON.stringify(body)
		})
	}

	private createEndpoint(endpoint: string): string {
		return endpoint.startsWith('/') ? `${API_ENDPOINT}${endpoint}` : `${API_ENDPOINT}/${endpoint}`
	}
}

// Export a single instance
export const api = new ApiService()
