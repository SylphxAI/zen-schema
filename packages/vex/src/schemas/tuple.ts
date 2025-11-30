// ============================================================
// Tuple Schema
// ============================================================

import type { Parser, Result, StandardSchemaV1 } from '../core'
import { ValidationError } from '../core'

const ERR_ARRAY: Result<never> = { ok: false, error: 'Expected array' }

type TupleOutput<T extends readonly Parser<unknown>[]> = {
	[K in keyof T]: T[K] extends Parser<infer O> ? O : never
}

/**
 * Create a tuple validator (fixed-length array with specific types)
 *
 * @example
 * const validatePoint = tuple([num, num])
 * const validateEntry = tuple([str, num, bool])
 */
export const tuple = <T extends readonly [Parser<unknown>, ...Parser<unknown>[]]>(
	schemas: T
): Parser<TupleOutput<T>> => {
	const fn = ((value: unknown) => {
		if (!Array.isArray(value)) throw new ValidationError('Expected array')
		if (value.length !== schemas.length) {
			throw new ValidationError(`Expected ${schemas.length} items, got ${value.length}`)
		}

		return schemas.map((schema, i) => {
			try {
				return schema(value[i])
			} catch (e) {
				if (e instanceof ValidationError) {
					throw new ValidationError(`[${i}]: ${e.message}`)
				}
				throw e
			}
		}) as TupleOutput<T>
	}) as Parser<TupleOutput<T>>

	fn.safe = (value: unknown): Result<TupleOutput<T>> => {
		if (!Array.isArray(value)) return ERR_ARRAY as Result<TupleOutput<T>>
		if (value.length !== schemas.length) {
			return { ok: false, error: `Expected ${schemas.length} items, got ${value.length}` }
		}

		const result: unknown[] = []
		for (const [i, schema] of schemas.entries()) {
			if (schema.safe) {
				const r = schema.safe(value[i])
				if (!r.ok) return { ok: false, error: `[${i}]: ${r.error}` }
				result.push(r.value)
			} else {
				try {
					result.push(schema(value[i]))
				} catch (e) {
					return { ok: false, error: `[${i}]: ${e instanceof Error ? e.message : 'Unknown error'}` }
				}
			}
		}

		return { ok: true, value: result as TupleOutput<T> }
	}

	// Add Standard Schema with path support
	;(fn as unknown as Record<string, unknown>)['~standard'] = {
		version: 1 as const,
		vendor: 'vex',
		validate: (value: unknown): StandardSchemaV1.Result<TupleOutput<T>> => {
			if (!Array.isArray(value)) {
				return { issues: [{ message: 'Expected array' }] }
			}
			if (value.length !== schemas.length) {
				return { issues: [{ message: `Expected ${schemas.length} items, got ${value.length}` }] }
			}

			const result: unknown[] = []
			for (const [i, schema] of schemas.entries()) {
				const std = schema['~standard']
				if (std) {
					const r = std.validate(value[i]) as StandardSchemaV1.Result<unknown>
					if (r.issues) {
						return {
							issues: r.issues.map((issue) => ({
								...issue,
								path: [i, ...(issue.path || [])],
							})),
						}
					}
					result.push(r.value)
				} else {
					try {
						result.push(schema(value[i]))
					} catch (e) {
						return {
							issues: [{ message: e instanceof Error ? e.message : 'Unknown error', path: [i] }],
						}
					}
				}
			}

			return { value: result as TupleOutput<T> }
		},
	}

	return fn
}
