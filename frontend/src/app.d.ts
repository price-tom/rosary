// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	const __APP_VERSION__: string
	const __APP_GIT_HASH__: string
	const __APP_BUILD_DATE__: string
}

export {}
