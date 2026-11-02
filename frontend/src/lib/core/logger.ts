/**
 * @fileoverview Central logger for the application.
 * Handles logging to external services (e.g., Sentry) and conditionally to the console.
 */

const isDev = import.meta.env?.DEV || false

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

export interface LogContext {
	[key: string]: unknown
}

class LoggerService {
	error(message: string, error: Error | unknown = null, context: LogContext = {}): void {
		if (isDev) {
			console.log(`%c[ERROR] ${message}`, 'color: red; font-weight: bold;', { error, context })
		}
	}

	/**
	 * Log a warning message
	 */
	warn(message: string, context: LogContext = {}): void {
		if (isDev) {
			console.log(`%c[WARN] ${message}`, 'color: orange; font-weight: bold;', context)
		}
	}

	/**
	 * Log an info message
	 */
	info(message: string, context: LogContext = {}): void {
		if (isDev) {
			console.log(`%c[INFO] ${message}`, 'color: blue; font-weight: bold;')
		}
	}

	/**
	 * Log a debug message
	 */
	debug(message: string, context: LogContext = {}): void {
		if (isDev) {
			console.log(`%c[DEBUG] ${message}`, 'color: gray;')
		}
	}
}

export const Logger = new LoggerService()
