// ============================================================
// Array Schema
// ============================================================

import type { Parser, Result, StandardSchemaV1, Validator } from '../core'
import { createValidator, ValidationError } from '../core'

const ERR_ARRAY: Result<never> = { ok: false, error: 'Expected array' }
const ERR_NONEMPTY: Result<never> = { ok: false, error: 'Array must not be empty' }

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

// ============================================================
// Array Length Validators
// ============================================================

/** Array minimum length validator */
export const minLength = <T>(n: number): Validator<T[], T[]> => {
	const msg = `Array must have at least ${n} items`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (v.length < n) throw new ValidationError(msg)
			return v
		},
		(v) => (v.length >= n ? { ok: true, value: v } : err)
	)
}

/** Array maximum length validator */
export const maxLength = <T>(n: number): Validator<T[], T[]> => {
	const msg = `Array must have at most ${n} items`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (v.length > n) throw new ValidationError(msg)
			return v
		},
		(v) => (v.length <= n ? { ok: true, value: v } : err)
	)
}

/** Array exact length validator */
export const exactLength = <T>(n: number): Validator<T[], T[]> => {
	const msg = `Array must have exactly ${n} items`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (v.length !== n) throw new ValidationError(msg)
			return v
		},
		(v) => (v.length === n ? { ok: true, value: v } : err)
	)
}

/** Array non-empty validator */
export const nonemptyArray = <T>(): Validator<T[], [T, ...T[]]> => {
	return createValidator(
		(v) => {
			if (v.length === 0) throw new ValidationError('Array must not be empty')
			return v as [T, ...T[]]
		},
		(v) => (v.length > 0 ? { ok: true, value: v as [T, ...T[]] } : ERR_NONEMPTY)
	) as Validator<T[], [T, ...T[]]>
}
