import { showBootStep, removeBootSplash } from './boot-splash'
import { Logger } from './logger'
import { checkVersionAndMigrate } from './pwa-service'
import { sanctumService } from '$lib/domain/users/sanctum-service'
import type { AppUser } from '$lib/domain/users/types'

class AppManager {
	state = $state({
		isInitializing: true,
		isReady: false,
		isAuthenticated: false,
		user: null as AppUser | null,
		error: null as string | null,
		debugPanelVisible: false
	})

	private initPromise: Promise<void> | null = null

	async initialize(): Promise<void> {
		if (this.initPromise) return this.initPromise
		Logger.info('Start bootstrap sequence')

		this.initPromise = (async () => {
			try {
				this.state.isInitializing = true
				this.state.error = null
				await checkVersionAndMigrate()
				showBootStep('Signing in')
				await this.initAuth()
				this.state.isReady = true
			} catch (err: unknown) {
				const errorMessage = err instanceof Error ? err.message : 'Initialization failed'
				this.state.error = errorMessage
				Logger.error('App Bootstrap Failed', err as Error)
				removeBootSplash()
				this.initPromise = null
				throw err
			} finally {
				Logger.info('Initializing complete')
				this.state.isInitializing = false
			}
		})()

		return this.initPromise
	}

	private async initAuth() {
		try {
			const user = await sanctumService.getCurrentUser()

			if (user) {
				this.state.user = user
				this.state.isAuthenticated = true
			} else {
				window.location.href = '/a/hello'
				return await this.leavingPage()
			}
		} catch (e) {
			Logger.error('Error verifying user credentials', e)
			window.location.href = '/a/hello'
			return await this.leavingPage()
		}
	}

	/** Never resolves, so nothing that waits on bootstrap runs while the page unloads. */
	private leavingPage(): Promise<never> {
		return new Promise(() => {})
	}

	get isReady() {
		return this.state.isReady && !this.state.isInitializing
	}

	reset(): void {
		this.state.isInitializing = true
		this.state.isReady = false
		this.state.error = null
		this.initPromise = null
	}
}

export const app = new AppManager()
