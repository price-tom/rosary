const CURRENT_APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'
const VERSION_KEY = 'app_version'

export async function checkVersionAndMigrate(): Promise<boolean> {
	const storedVersion = localStorage.getItem(VERSION_KEY)

	if (storedVersion && storedVersion !== CURRENT_APP_VERSION) {
		console.info(
			`Version mismatch (${storedVersion} -> ${CURRENT_APP_VERSION}). Clearing storage...`
		)
		await uninstallPWA()
		localStorage.setItem(VERSION_KEY, CURRENT_APP_VERSION)
		return true
	}

	if (!storedVersion) {
		localStorage.setItem(VERSION_KEY, CURRENT_APP_VERSION)
	}

	return false
}

export async function uninstallPWA(): Promise<void> {
	try {
		await Promise.allSettled([
			unregisterServiceWorkers(),
			clearCaches(),
			clearOPFS(),
			clearIndexedDB(),
			clearCookies()
		])
		localStorage.clear()
		sessionStorage.clear()
		localStorage.removeItem(VERSION_KEY)
	} catch (error) {
		console.error('Error during PWA cleanup:', error)
	}
}

async function unregisterServiceWorkers(): Promise<void> {
	if (!('serviceWorker' in navigator)) return
	const registrations = await navigator.serviceWorker.getRegistrations()
	await Promise.all(registrations.map((reg) => reg.unregister()))
}

async function clearCaches(): Promise<void> {
	if (!('caches' in window)) return
	const cacheNames = await caches.keys()
	await Promise.all(cacheNames.map((name) => caches.delete(name)))
}

async function clearOPFS(): Promise<void> {
	if (!('storage' in navigator && typeof navigator.storage.getDirectory === 'function')) return
	const rootDir = await navigator.storage.getDirectory()
	for await (const [name] of rootDir.entries()) {
		await rootDir.removeEntry(name, { recursive: true })
	}
}

async function clearIndexedDB(): Promise<void> {
	if (typeof indexedDB.databases !== 'function') return
	const dbs = await indexedDB.databases()
	for (const db of dbs) {
		if (db.name) indexedDB.deleteDatabase(db.name)
	}
}

async function clearCookies(): Promise<void> {
	const cookies = document.cookie.split(';')
	const hostname = window.location.hostname
	const domainParts = hostname.split('.')
	const domains: string[] = [''] // Include empty domain for host-only cookies

	for (let i = 0; i < domainParts.length - 1; i++) {
		const domain = domainParts.slice(i).join('.')
		domains.push(domain)
		domains.push('.' + domain) // Include leading dot variants
	}

	for (const cookie of cookies) {
		const eqPos = cookie.indexOf('=')
		const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()

		if (!name) continue

		// Try expiring the cookie across every domain variation and common paths
		for (const domain of domains) {
			const domainAttr = domain ? `; domain=${domain}` : ''
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainAttr}`
			// Also try current path just in case it wasn't set to root '/'
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${window.location.pathname}${domainAttr}`
		}
	}
}
