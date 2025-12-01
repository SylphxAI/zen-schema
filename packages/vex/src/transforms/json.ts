// ============================================================
// JSON Transforms
// ============================================================

import type { Parser, Result, Validator } from '../core'
import { addStandardSchema, ValidationError } from '../core'

/**
 * Parse JSON string to value
 *
 * @example
 * const validateConfig = pipe(str, parseJson, object({ ... }))
 */
export const parseJson: Validator<string, unknown> = (() => {
	const fn = ((v: string) => {
		try {
			return JSON.parse(v)
		} catch {
			throw new ValidationError('Invalid JSON')
		}
	}) as Validator<string, unknown>

	fn.safe = (v: string): Result<unknown> => {
		try {
			return { ok: true, value: JSON.parse(v) }
		} catch {
			return { ok: false, error: 'Invalid JSON' }
		}
	}

	return addStandardSchema(fn)
})()

/**
 * Parse JSON string and validate with schema
 *
 * @example
 * const validateConfig = parseJsonWith(object({ name: str, value: num }))
 */
export const parseJsonWith = <T>(schema: Parser<T>): Validator<string, T> => {
	const fn = ((v: string) => {
		let parsed: unknown
		try {
			parsed = JSON.parse(v)
		} catch {
			throw new ValidationError('Invalid JSON')
		}
		return schema(parsed)
	}) as Validator<string, T>

	fn.safe = (v: string): Result<T> => {
		let parsed: unknown
		try {
			parsed = JSON.parse(v)
		} catch {
			return { ok: false, error: 'Invalid JSON' }
		}
		if (schema.safe) return schema.safe(parsed)
		try {
			return { ok: true, value: schema(parsed) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return addStandardSchema(fn)
}

/**
 * Stringify value to JSON
 *
 * @example
 * const toJson = pipe(validateUser, stringifyJson)
 */
export const stringifyJson: Validator<unknown, string> = (() => {
	const fn = ((v: unknown) => {
		try {
			return JSON.stringify(v)
		} catch {
			throw new ValidationError('Cannot stringify to JSON')
		}
	}) as Validator<unknown, string>

	fn.safe = (v: unknown): Result<string> => {
		try {
			return { ok: true, value: JSON.stringify(v) }
		} catch {
			return { ok: false, error: 'Cannot stringify to JSON' }
		}
	}

	return addStandardSchema(fn)
})()

/**
 * Stringify with formatting options
 *
 * @example
 * const toPrettyJson = stringifyJsonWith(2)
 */
export const stringifyJsonWith = (
	space?: string | number,
	replacer?: (key: string, value: unknown) => unknown,
): Validator<unknown, string> => {
	const fn = ((v: unknown) => {
		try {
			return JSON.stringify(v, replacer, space)
		} catch {
			throw new ValidationError('Cannot stringify to JSON')
		}
	}) as Validator<unknown, string>

	fn.safe = (v: unknown): Result<string> => {
		try {
			return { ok: true, value: JSON.stringify(v, replacer, space) }
		} catch {
			return { ok: false, error: 'Cannot stringify to JSON' }
		}
	}

	return addStandardSchema(fn)
}
