// ============================================================
// Record Schema
// ============================================================

import type { Parser, Result, StandardSchemaV1 } from '../core'
import { ValidationError } from '../core'

const ERR_OBJECT: Result<never> = { ok: false, error: 'Expected object' }

/**
 * Create a record validator (object with dynamic keys)
 *
 * @example
 * const validateScores = record(str, num)
 * const validateData = record(str, pipe(str, nonempty))
 */
export const record = <K extends string, V>(
	keyValidator: Parser<K>,
	valueValidator: Parser<V>
): Parser<Record<K, V>> => {
	const fn = ((value: unknown) => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			throw new ValidationError('Expected object')
		}

		const result = {} as Record<K, V>
		for (const [key, val] of Object.entries(value)) {
			try {
				const validKey = keyValidator(key)
				try {
					result[validKey] = valueValidator(val)
				} catch (e) {
					if (e instanceof ValidationError) {
						throw new ValidationError(`[${key}]: ${e.message}`)
					}
					throw e
				}
			} catch (e) {
				if (e instanceof ValidationError && !e.message.startsWith('[')) {
					throw new ValidationError(`Invalid key "${key}": ${e.message}`)
				}
				throw e
			}
		}

		return result
	}) as Parser<Record<K, V>>

	fn.safe = (value: unknown): Result<Record<K, V>> => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return ERR_OBJECT as Result<Record<K, V>>
		}

		const result = {} as Record<K, V>
		for (const [key, val] of Object.entries(value)) {
			if (keyValidator.safe) {
				const keyResult = keyValidator.safe(key)
				if (!keyResult.ok) {
					return { ok: false, error: `Invalid key "${key}": ${keyResult.error}` }
				}
				if (valueValidator.safe) {
					const valResult = valueValidator.safe(val)
					if (!valResult.ok) {
						return { ok: false, error: `[${key}]: ${valResult.error}` }
					}
					result[keyResult.value] = valResult.value
				} else {
					try {
						result[keyResult.value] = valueValidator(val)
					} catch (e) {
						return {
							ok: false,
							error: `[${key}]: ${e instanceof Error ? e.message : 'Unknown error'}`,
						}
					}
				}
			} else {
				try {
					const validKey = keyValidator(key)
					if (valueValidator.safe) {
						const valResult = valueValidator.safe(val)
						if (!valResult.ok) {
							return { ok: false, error: `[${key}]: ${valResult.error}` }
						}
						result[validKey] = valResult.value
					} else {
						result[validKey] = valueValidator(val)
					}
				} catch (e) {
					return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
				}
			}
		}

		return { ok: true, value: result }
	}

	// Add Standard Schema with path support
	;(fn as unknown as Record<string, unknown>)['~standard'] = {
		version: 1 as const,
		vendor: 'vex',
		validate: (value: unknown): StandardSchemaV1.Result<Record<K, V>> => {
			if (typeof value !== 'object' || value === null || Array.isArray(value)) {
				return { issues: [{ message: 'Expected object' }] }
			}

			const result = {} as Record<K, V>
			for (const [key, val] of Object.entries(value)) {
				const keyStd = keyValidator['~standard']
				if (keyStd) {
					const keyResult = keyStd.validate(key) as StandardSchemaV1.Result<K>
					if (keyResult.issues) {
						return { issues: [{ message: `Invalid key "${key}"` }] }
					}
				}

				const valStd = valueValidator['~standard']
				if (valStd) {
					const valResult = valStd.validate(val) as StandardSchemaV1.Result<V>
					if (valResult.issues) {
						return {
							issues: valResult.issues.map((issue) => ({
								...issue,
								path: [key, ...(issue.path || [])],
							})),
						}
					}
					result[key as K] = valResult.value
				} else {
					try {
						result[key as K] = valueValidator(val)
					} catch (e) {
						return {
							issues: [{ message: e instanceof Error ? e.message : 'Unknown error', path: [key] }],
						}
					}
				}
			}

			return { value: result }
		},
	}

	return fn
}
