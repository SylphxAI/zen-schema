// ============================================================
// Map Schema
// ============================================================

import type { Result, Schema, StandardSchemaV1 } from '../core'
import { addSchemaMetadata, getErrorMsg, ValidationError } from '../core'

const ERR_MAP: Result<never> = { ok: false, error: 'Expected Map' }

/**
 * Create a Map validator
 *
 * @example
 * const validateStringToNumber = map(str, num)
 * const validateIdToUser = map(pipe(str, uuid), userSchema)
 */
export const map = <K, V>(
	keyValidator: Schema<K>,
	valueValidator: Schema<V>,
): Schema<Map<K, V>> => {
	// Pre-compute safe methods for monomorphic path
	const keySafe = keyValidator.safe
	const valSafe = valueValidator.safe

	const fn = ((value: unknown) => {
		if (!(value instanceof Map)) throw new ValidationError('Expected Map')

		const result = new Map<K, V>()
		for (const [key, val] of value) {
			let validKey: K
			try {
				validKey = keyValidator(key)
			} catch (e) {
				if (e instanceof ValidationError) {
					throw new ValidationError(`Map key: ${e.message}`)
				}
				throw e
			}

			try {
				result.set(validKey, valueValidator(val))
			} catch (e) {
				if (e instanceof ValidationError) {
					throw new ValidationError(`Map[${String(key)}]: ${e.message}`)
				}
				throw e
			}
		}
		return result
	}) as Schema<Map<K, V>>

	// Monomorphic path split at initialization time (4 combinations)
	fn.safe =
		keySafe && valSafe
			? (value: unknown): Result<Map<K, V>> => {
					if (!(value instanceof Map)) return ERR_MAP as Result<Map<K, V>>

					const result = new Map<K, V>()
					for (const [key, val] of value) {
						const kr = keySafe(key)
						if (!kr.ok) return { ok: false, error: `Map key: ${kr.error}` }
						const vr = valSafe(val)
						if (!vr.ok) return { ok: false, error: `Map[${String(key)}]: ${vr.error}` }
						result.set(kr.value, vr.value)
					}

					return { ok: true, value: result }
				}
			: keySafe
				? (value: unknown): Result<Map<K, V>> => {
						if (!(value instanceof Map)) return ERR_MAP as Result<Map<K, V>>

						const result = new Map<K, V>()
						for (const [key, val] of value) {
							const kr = keySafe(key)
							if (!kr.ok) return { ok: false, error: `Map key: ${kr.error}` }
							try {
								result.set(kr.value, valueValidator(val))
							} catch (e) {
								return { ok: false, error: `Map[${String(key)}]: ${getErrorMsg(e)}` }
							}
						}

						return { ok: true, value: result }
					}
				: valSafe
					? (value: unknown): Result<Map<K, V>> => {
							if (!(value instanceof Map)) return ERR_MAP as Result<Map<K, V>>

							const result = new Map<K, V>()
							for (const [key, val] of value) {
								let validKey: K
								try {
									validKey = keyValidator(key)
								} catch (e) {
									return { ok: false, error: `Map key: ${getErrorMsg(e)}` }
								}
								const vr = valSafe(val)
								if (!vr.ok) return { ok: false, error: `Map[${String(key)}]: ${vr.error}` }
								result.set(validKey, vr.value)
							}

							return { ok: true, value: result }
						}
					: (value: unknown): Result<Map<K, V>> => {
							if (!(value instanceof Map)) return ERR_MAP as Result<Map<K, V>>

							const result = new Map<K, V>()
							for (const [key, val] of value) {
								let validKey: K
								try {
									validKey = keyValidator(key)
								} catch (e) {
									return { ok: false, error: `Map key: ${getErrorMsg(e)}` }
								}
								try {
									result.set(validKey, valueValidator(val))
								} catch (e) {
									return { ok: false, error: `Map[${String(key)}]: ${getErrorMsg(e)}` }
								}
							}

							return { ok: true, value: result }
						}

	// Add Standard Schema
	;(fn as unknown as Record<string, unknown>)['~standard'] = {
		version: 1 as const,
		vendor: 'vex',
		validate: (value: unknown): StandardSchemaV1.Result<Map<K, V>> => {
			if (!(value instanceof Map)) {
				return { issues: [{ message: 'Expected Map' }] }
			}

			const result = new Map<K, V>()
			const keyStd = keyValidator['~standard']
			const valStd = valueValidator['~standard']

			for (const [key, val] of value) {
				let validKey: K

				if (keyStd) {
					const kr = keyStd.validate(key) as StandardSchemaV1.Result<K>
					if (kr.issues) {
						return { issues: [{ message: `Map key: ${kr.issues[0]?.message || 'Invalid'}` }] }
					}
					validKey = kr.value
				} else {
					try {
						validKey = keyValidator(key)
					} catch (e) {
						return {
							issues: [{ message: `Map key: ${e instanceof Error ? e.message : 'Invalid'}` }],
						}
					}
				}

				if (valStd) {
					const vr = valStd.validate(val) as StandardSchemaV1.Result<V>
					if (vr.issues) {
						return {
							issues: vr.issues.map((issue) => ({
								...issue,
								path: [key as PropertyKey, ...(issue.path || [])],
							})),
						}
					}
					result.set(validKey, vr.value)
				} else {
					try {
						result.set(validKey, valueValidator(val))
					} catch (e) {
						return {
							issues: [
								{
									message: getErrorMsg(e),
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

	// Add metadata for JSON Schema conversion
	addSchemaMetadata(fn, {
		type: 'map',
		inner: { key: keyValidator, value: valueValidator },
	})

	return fn
}
