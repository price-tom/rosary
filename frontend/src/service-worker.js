import { build, files, version } from '$service-worker'

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`

const ASSETS = [
	...build, // the app itself
	...files // everything in `static`
]

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	)
})

self.addEventListener('activate', (event) => {
	event.waitUntil(deleteOldCaches().then(() => self.clients.claim()))
})

async function deleteOldCaches() {
	for (const key of await caches.keys()) {
		if (key !== CACHE) await caches.delete(key)
	}
}

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting()
	}
})

async function notifyOnlineStatus(online) {
	const clients = await self.clients.matchAll()
	clients.forEach((client) => client.postMessage({ type: 'ONLINE_STATUS', online }))
}

self.addEventListener('online', () => notifyOnlineStatus(true))
self.addEventListener('offline', () => notifyOnlineStatus(false))

/** @param {URL} url */
function isInternalPath(url) {
	return url.pathname.startsWith('/cdn-cgi/') || url.pathname.startsWith('/.well-known/')
}

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url)

	if (event.request.method !== 'GET') return
	if (url.origin !== self.location.origin) return
	if (isInternalPath(url)) return

	// API responses can hold a user's data, so they must never reach the cache.
	if (url.pathname.startsWith('/api/')) return

	event.respondWith(
		event.request.mode === 'navigate' ? navigationHandler(event.request) : cacheFirst(event.request)
	)
})

/**
 * Cache-first strategy for static assets
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirst(request) {
	const cached = await caches.match(request)
	if (cached) return cached

	try {
		const response = await fetch(request)
		if (response.ok) {
			const cache = await caches.open(CACHE)
			cache.put(request, response.clone())
		}
		return response
	} catch {
		return new Response('Offline', { status: 503 })
	}
}

/**
 * Network first, falling back to the cached app shell for SPA routing when offline
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function navigationHandler(request) {
	try {
		return await fetch(request)
	} catch {
		const shell = (await caches.match('/index.html')) ?? (await caches.match('/'))
		return shell ?? new Response('Offline', { status: 503 })
	}
}
