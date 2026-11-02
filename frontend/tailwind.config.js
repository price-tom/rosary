/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: ['selector', '[data-theme="dark"]'], // Enable dark mode via data-theme attribute or media query
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		fontSize: {
			xs: '0.7em',
			sm: '0.9em',
			base: '1rem',
			xl: '1.333rem',
			'2xl': '1.563rem',
			'3xl': '1.953rem',
			'4xl': '2.441rem',
			'5xl': '3.052rem'
		},
		extend: {
			colors: {
				rosewater: 'var(--color-rosewater)',
				flamingo: 'var(--color-flamingo)',
				pink: 'var(--color-pink)',
				mauve: 'var(--color-mauve)',
				red: 'var(--color-red)',
				maroon: 'var(--color-maroon)',
				peach: 'var(--color-peach)',
				yellow: 'var(--color-yellow)',
				green: 'var(--color-green)',
				teal: 'var(--color-teal)',
				sky: 'var(--color-sky)',
				sapphire: 'var(--color-sapphire)',
				blue: 'var(--color-blue)',
				lavender: 'var(--color-lavender)',
				text: 'var(--color-text)',
				'subtext-1': 'var(--color-subtext-1)',
				'subtext-0': 'var(--color-subtext-0)',
				'overlay-2': 'var(--color-overlay-2)',
				'overlay-1': 'var(--color-overlay-1)',
				'overlay-0': 'var(--color-overlay-0)',
				'surface-2': 'var(--color-surface-2)',
				'surface-1': 'var(--color-surface-1)', // <-- Now border-surface-1 will work
				'surface-0': 'var(--color-surface-0)', // <-- Now bg-surface-0 will work
				base: 'var(--color-base)',
				mantle: 'var(--color-mantle)',
				crust: 'var(--color-crust)',

				// Semantic color system using CSS custom properties
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				background: 'var(--color-background)',
				foreground: 'var(--color-foreground)',
				primary: {
					DEFAULT: 'var(--color-primary)',
					foreground: 'var(--color-primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--color-secondary)',
					foreground: 'var(--color-secondary-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--color-destructive)',
					foreground: 'var(--color-destructive-foreground)'
				},
				muted: {
					DEFAULT: 'var(--color-muted)',
					foreground: 'var(--color-muted-foreground)'
				},
				accent: {
					DEFAULT: 'var(--color-accent)',
					foreground: 'var(--color-accent-foreground)'
				},
				card: {
					DEFAULT: 'var(--color-card)',
					foreground: 'var(--color-card-foreground)'
				},
				success: {
					DEFAULT: 'var(--color-success)',
					foreground: 'var(--color-success-foreground)'
				},
				warning: {
					DEFAULT: 'var(--color-warning)',
					foreground: 'var(--color-warning-foreground)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	}
}
