export interface LoginForm {
	email: string
	code: string
}

export interface Field {
	id: keyof LoginForm
	name: string
	type: 'email' | 'text'
	label: string
	autocomplete: 'username' | 'current-password' | 'off'
}
