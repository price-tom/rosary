/**
 * Origin of the Laravel app (for /sanctum/csrf-cookie and /auth/google/*),
 * derived from VITE_API_BASE_URL
 */
export const backendOrigin = (): string => new URL(import.meta.env.VITE_API_BASE_URL).origin
