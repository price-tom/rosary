import { sveltekit } from '@sveltejs/kit/vite'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync } from 'fs'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const isProduction = process.env.NODE_ENV === 'production'

// Get version info
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
const version = pkg.version
let gitHash = process.env.GIT_COMMIT_HASH || 'unknown'
if (gitHash === 'unknown') {
	try {
		gitHash = execSync('git rev-parse --short HEAD').toString().trim()
	} catch (e) {
		console.warn('Could not get git hash (no .git directory or GIT_COMMIT_HASH env var)')
	}
}
const buildDate = new Date().toISOString()

// Custom plugin to serve .ico files with correct MIME type
function serveIcoWithMimeType() {
	return {
		name: 'serve-ico-mime-type',
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.url?.endsWith('.ico')) {
					res.setHeader('Content-Type', 'image/x-icon')
				}
				next()
			})
		}
	}
}

export default {
	define: {
		__APP_VERSION__: JSON.stringify(version),
		__APP_GIT_HASH__: JSON.stringify(gitHash),
		__APP_BUILD_DATE__: JSON.stringify(buildDate)
	},
	plugins: [
		// Serve .ico files with correct MIME type
		serveIcoWithMimeType(),

		sveltekit(),
		tailwindcss(),
		VitePWA({
			// Disable service worker - using SvelteKit's built-in service worker at src/service-worker.js
			injectRegister: null,
			registerType: 'prompt',
			strategies: 'generateSW',
			workbox: {
				globPatterns: [] // Don't precache anything - let SvelteKit handle it
			},
			includeAssets: ['favicon.ico', 'logo.svg', 'apple-touch-icon-180x180.png'],
			manifest: {
				name: 'Rosary',
				short_name: 'Rosary',
				description: 'Rosary',
				start_url: '/',
				scope: '/',
				id: '/',
				theme_color: '#210f04',
				background_color: '#210f04',
				display: 'standalone',
				display_override: ['window-controls-overlay', 'standalone', 'fullscreen'],
				orientation: 'any',
				icons: [
					{
						src: 'pwa-64x64.png',
						sizes: '64x64',
						type: 'image/png'
					},
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				],
				launch_handler: {
					client_mode: 'navigate-existing'
				}
			}
		})
	].filter(Boolean),
	server: {
		// Dev environments are served from <namespace>.<tailnet>.ts.net
		allowedHosts: ['localhost', '.ts.net'],
		port: 8000
	},
	build: {
		sourcemap: true,
		chunkSizeWarningLimit: 1000
	}
}
