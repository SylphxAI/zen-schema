// ============================================================
// Array Schema
// ============================================================

import type { Parser, Result, StandardSchemaV1 } from '../core'
import { ValidationError } from '../core'

const ERR_ARRAY: Result<never> = { ok: false, error: 'Expected array' }

/**
 * Create an array validator
 *
 * @example
 * const validateNumbers = array(pipe(num, int))
 */
export const array = <T>(itemValidator: Parser<T>): Parser<T[]> => {
	const fn = ((value: unknown) => {
		if (!Array.isArray(value)) throw new ValidationError('Expected array')

		return value.map((item, i) => {
			try {
				return itemValidator(item)
			} catch (e) {
				if (e instanceof ValidationError) {
					throw new ValidationError(`[${i}]: ${e.message}`)
				}
				throw e
			}
		})
	}) as Parser<T[]>

	fn.safe = (value: unknown): Result<T[]> => {
		if (!Array.isArray(value)) return ERR_ARRAY as Result<T[]>

		const result: T[] = []
		for (let i = 0; i < value.length; i++) {
			if (itemValidator.safe) {
				const r = itemValidator.safe(value[i])
				if (!r.ok) {
					return { ok: false, error: `[${i}]: ${r.error}` }
				}
				result.push(r.value)
			} else {
				try {
					result.push(itemValidator(value[i]))
				} catch (e) {
					return { ok: false, error: `[${i}]: ${e instanceof Error ? e.message : 'Unknown error'}` }
				}
			}
		}

		return { ok: true, value: result }
	}

	// Add Standard Schema with path support
	;(fn as unknown as Record<string, unknown>)['~standard'] = {
		version: 1 as const,
		vendor: 'vex',
		validate: (value: unknown): StandardSchemaV1.Result<T[]> => {
			if (!Array.isArray(value)) {
				return { issues: [{ message: 'Expected array' }] }
			}

			const result: T[] = []
			const std = itemValidator['~standard']

			for (let i = 0; i < value.length; i++) {
				if (std) {
					const r = std.validate(value[i]) as StandardSchemaV1.Result<T>
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
						result.push(itemValidator(value[i]))
					} catch (e) {
						return {
							issues: [{ message: e instanceof Error ? e.message : 'Unknown error', path: [i] }],
						}
					}
				}
			}

			return { value: result }
		},
	}

	return fn
}
