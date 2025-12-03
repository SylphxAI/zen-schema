// ============================================================
// Set Schema
// ============================================================

import type { Result, Schema, StandardSchemaV1 } from '../core'
import { addSchemaMetadata, getErrorMsg, ValidationError } from '../core'

const ERR_SET: Result<never> = { ok: false, error: 'Expected Set' }

/**
 * Create a Set validator
 *
 * @example
 * const validateNumberSet = set(num)
 * const validateStringSet = set(pipe(str, nonempty))
 */
export const set = <T>(itemValidator: Schema<T>): Schema<Set<T>> => {
	// Pre-compute safe method for monomorphic path
	const itemSafe = itemValidator.safe

	const fn = ((value: unknown) => {
		if (!(value instanceof Set)) throw new ValidationError('Expected Set')

		const result = new Set<T>()
		let i = 0
		for (const item of value) {
			try {
				result.add(itemValidator(item))
			} catch (e) {
				if (e instanceof ValidationError) {
					throw new ValidationError(`Set[${i}]: ${e.message}`)
				}
				throw e
			}
			i++
		}
		return result
	}) as Schema<Set<T>>

	// Monomorphic path split at initialization time
	fn.safe = itemSafe
		? (value: unknown): Result<Set<T>> => {
				if (!(value instanceof Set)) return ERR_SET as Result<Set<T>>

				const result = new Set<T>()
				let i = 0
				for (const item of value) {
					const r = itemSafe(item)
					if (!r.ok) return { ok: false, error: `Set[${i}]: ${r.error}` }
					result.add(r.value)
					i++
				}

				return { ok: true, value: result }
			}
		: (value: unknown): Result<Set<T>> => {
				if (!(value instanceof Set)) return ERR_SET as Result<Set<T>>

				const result = new Set<T>()
				let i = 0
				for (const item of value) {
					try {
						result.add(itemValidator(item))
					} catch (e) {
						return { ok: false, error: `Set[${i}]: ${getErrorMsg(e)}` }
					}
					i++
				}

				return { ok: true, value: result }
			}

	// Add Standard Schema with path support
	;(fn as unknown as Record<string, unknown>)['~standard'] = {
		version: 1 as const,
		vendor: 'vex',
		validate: (value: unknown): StandardSchemaV1.Result<Set<T>> => {
			if (!(value instanceof Set)) {
				return { issues: [{ message: 'Expected Set' }] }
			}

			const result = new Set<T>()
			const std = itemValidator['~standard']
			let i = 0

			for (const item of value) {
				if (std) {
					const r = std.validate(item) as StandardSchemaV1.Result<T>
					if (r.issues) {
						return {
							issues: r.issues.map((issue) => ({
								...issue,
								path: [i, ...(issue.path || [])],
							})),
						}
					}
					result.add(r.value)
				} else {
					try {
						result.add(itemValidator(item))
					} catch (e) {
						return {
							issues: [{ message: getErrorMsg(e), path: [i] }],
						}
					}
				}
				i++
			}

			return { value: result }
		},
	}

	// Add metadata for JSON Schema conversion
	addSchemaMetadata(fn, {
		type: 'set',
		inner: itemValidator,
	})

	return fn
}
