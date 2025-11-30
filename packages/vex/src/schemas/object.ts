// ============================================================
// Object Schema
// ============================================================

import type { Parser, Result, StandardSchemaV1 } from '../core'
import { addStandardSchema, ValidationError } from '../core'

const ERR_OBJECT: Result<never> = { ok: false, error: 'Expected object' }

type Shape<T> = { [K in keyof T]: Parser<T[K]> }

/**
 * Create an object validator from a shape
 *
 * @example
 * const validateUser = object({
 *   name: pipe(str, nonempty),
 *   age: pipe(num, int, gte(0)),
 *   email: pipe(str, email),
 * })
 */
export const object = <T extends Record<string, unknown>>(shape: Shape<T>): Parser<T> => {
	const entries = Object.entries(shape) as [keyof T, Parser<unknown>][]

	const fn = ((value: unknown) => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			throw new ValidationError('Expected object')
		}

		const input = value as Record<string, unknown>
		const result = {} as T

		for (const [key, validator] of entries) {
			try {
				result[key] = validator(input[key as string]) as T[keyof T]
			} catch (e) {
				if (e instanceof ValidationError) {
					throw new ValidationError(`${String(key)}: ${e.message}`)
				}
				throw e
			}
		}

		return result
	}) as Parser<T>

	fn.safe = (value: unknown): Result<T> => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return ERR_OBJECT as Result<T>
		}

		const input = value as Record<string, unknown>
		const result = {} as T

		for (const [key, validator] of entries) {
			if (validator.safe) {
				const r = validator.safe(input[key as string])
				if (!r.ok) {
					return { ok: false, error: `${String(key)}: ${r.error}` }
				}
				result[key] = r.value as T[keyof T]
			} else {
				try {
					result[key] = validator(input[key as string]) as T[keyof T]
				} catch (e) {
					return {
						ok: false,
						error: `${String(key)}: ${e instanceof Error ? e.message : 'Unknown error'}`,
					}
				}
			}
		}

		return { ok: true, value: result }
	}

	// Add Standard Schema with path support
	;(fn as unknown as Record<string, unknown>)['~standard'] = {
		version: 1 as const,
		vendor: 'vex',
		validate: (value: unknown): StandardSchemaV1.Result<T> => {
			if (typeof value !== 'object' || value === null || Array.isArray(value)) {
				return { issues: [{ message: 'Expected object' }] }
			}

			const input = value as Record<string, unknown>
			const result = {} as T

			for (const [key, validator] of entries) {
				const std = validator['~standard']
				if (std) {
					const r = std.validate(input[key as string]) as StandardSchemaV1.Result<unknown>
					if (r.issues) {
						return {
							issues: r.issues.map((issue) => ({
								...issue,
								path: [key as PropertyKey, ...(issue.path || [])],
							})),
						}
					}
					result[key] = r.value as T[keyof T]
				} else {
					try {
						result[key] = validator(input[key as string]) as T[keyof T]
					} catch (e) {
						return {
							issues: [
								{
									message: e instanceof Error ? e.message : 'Unknown error',
									path: [key as PropertyKey],
								},
							],
						}
					}
				}
			}

			return { value: result }
		},
	}

	return fn
}

/**
 * Make all properties optional
 */
export const partial = <T extends Record<string, unknown>>(
	schema: Parser<T>
): Parser<Partial<T>> => {
	const fn = ((value: unknown) => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			throw new ValidationError('Expected object')
		}

		if (schema.safe) {
			const result = schema.safe(value)
			if (result.ok) return result.value
		}

		return value as Partial<T>
	}) as Parser<Partial<T>>

	fn.safe = (value: unknown): Result<Partial<T>> => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return ERR_OBJECT as Result<Partial<T>>
		}
		return { ok: true, value: value as Partial<T> }
	}

	return addStandardSchema(fn)
}

/**
 * Allow extra properties (passthrough mode)
 */
export const passthrough = <T extends Record<string, unknown>>(
	schema: Parser<T>
): Parser<T & Record<string, unknown>> => {
	const fn = ((value: unknown) => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			throw new ValidationError('Expected object')
		}

		const validated = schema(value)
		return { ...value, ...validated } as T & Record<string, unknown>
	}) as Parser<T & Record<string, unknown>>

	fn.safe = (value: unknown): Result<T & Record<string, unknown>> => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return ERR_OBJECT as Result<T & Record<string, unknown>>
		}

		if (schema.safe) {
			const result = schema.safe(value)
			if (!result.ok) return result as Result<T & Record<string, unknown>>
			return { ok: true, value: { ...value, ...result.value } as T & Record<string, unknown> }
		}

		try {
			const validated = schema(value)
			return { ok: true, value: { ...value, ...validated } as T & Record<string, unknown> }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return addStandardSchema(fn)
}

/**
 * Strip unknown properties (strict mode)
 */
export const strict = <T extends Record<string, unknown>>(schema: Parser<T>): Parser<T> => {
	return schema
}

/** Alias for strict */
export { strict as strip }

// ============================================================
// Object Utilities (shape-based)
// ============================================================

/**
 * Pick specific properties from an object shape
 *
 * @example
 * const userShape = { name: str, age: num, email: pipe(str, email) }
 * const validateName = object(pick(userShape, ['name']))
 */
export const pick = <T extends Record<string, Parser<unknown>>, K extends keyof T>(
	shape: T,
	keys: readonly K[]
): Pick<T, K> => {
	const result = {} as Pick<T, K>
	for (const key of keys) {
		if (key in shape) {
			result[key] = shape[key]
		}
	}
	return result
}

/**
 * Omit specific properties from an object shape
 *
 * @example
 * const userShape = { name: str, age: num, email: pipe(str, email) }
 * const validateWithoutEmail = object(omit(userShape, ['email']))
 */
export const omit = <T extends Record<string, Parser<unknown>>, K extends keyof T>(
	shape: T,
	keys: readonly K[]
): Omit<T, K> => {
	const keysSet = new Set<string>(keys as unknown as string[])
	const result = {} as Record<string, Parser<unknown>>
	for (const [key, value] of Object.entries(shape)) {
		if (!keysSet.has(key)) {
			result[key] = value
		}
	}
	return result as Omit<T, K>
}

/**
 * Extend an object shape with additional properties
 *
 * @example
 * const userShape = { name: str, age: num }
 * const adminShape = extend(userShape, { role: literal('admin') })
 */
export const extend = <
	T extends Record<string, Parser<unknown>>,
	U extends Record<string, Parser<unknown>>,
>(
	base: T,
	extension: U
): T & U => {
	return { ...base, ...extension }
}

/**
 * Merge two object shapes (alias for extend)
 */
export const merge = extend
