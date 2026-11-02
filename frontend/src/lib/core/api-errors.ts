export interface DefaultErrorResponse {
	message: string
	code?: string
	errors?: Record<string, string[]> // For validation errors
}

export class ApiError<T = DefaultErrorResponse> extends Error {
	status: number
	data: T

	constructor(message: string, status: number, data: T) {
		super(message)
		this.name = 'ApiError'
		this.status = status
		this.data = data

		Object.setPrototypeOf(this, ApiError.prototype)
	}
}
