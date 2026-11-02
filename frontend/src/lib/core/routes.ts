import { goto } from '$app/navigation'
import { resolve } from '$app/paths'

type RouteDefinition = {
	readonly href: string
	readonly label: string
}
export const routes = {
	home: { href: '/a/home', label: 'Home' },
	login: { href: '/a/hello', label: 'Login' }
} as const satisfies Record<string, RouteDefinition>

export type Route = (typeof routes)[keyof typeof routes]

export const gotoRoute = (route: Route): Promise<void> => goto(resolve(route.href))
