// ============================================================
// Pipe Composition
// ============================================================

import type { Result, Validator } from '../core'
import { addStandardSchema } from '../core'

/**
 * Pipe validators together (left to right)
 *
 * @example
 * const validateEmail = pipe(str, email)
 * const validateAge = pipe(num, int, gte(0), lte(150))
 */
export function pipe<A, B>(v1: Validator<A, B>): Validator<A, B>
export function pipe<A, B, C>(v1: Validator<A, B>, v2: Validator<B, C>): Validator<A, C>
export function pipe<A, B, C, D>(
	v1: Validator<A, B>,
	v2: Validator<B, C>,
	v3: Validator<C, D>
): Validator<A, D>
export function pipe<A, B, C, D, E>(
	v1: Validator<A, B>,
	v2: Validator<B, C>,
	v3: Validator<C, D>,
	v4: Validator<D, E>
): Validator<A, E>
export function pipe<A, B, C, D, E, F>(
	v1: Validator<A, B>,
	v2: Validator<B, C>,
	v3: Validator<C, D>,
	v4: Validator<D, E>,
	v5: Validator<E, F>
): Validator<A, F>
export function pipe<A, B, C, D, E, F, G>(
	v1: Validator<A, B>,
	v2: Validator<B, C>,
	v3: Validator<C, D>,
	v4: Validator<D, E>,
	v5: Validator<E, F>,
	v6: Validator<F, G>
): Validator<A, G>
export function pipe(...validators: Validator<unknown, unknown>[]): Validator<unknown, unknown> {
	// Create the throwing version
	const fn = ((value: unknown) => {
		let result = value
		for (const v of validators) {
			result = v(result)
		}
		return result
	}) as Validator<unknown, unknown>

	// Create the safe version that uses .safe if available
	fn.safe = (value: unknown): Result<unknown> => {
		let result: unknown = value
		for (const v of validators) {
			if (v.safe) {
				const r = v.safe(result)
				if (!r.ok) return r
				result = r.value
			} else {
				try {
					result = v(result)
				} catch (e) {
					return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
				}
			}
		}
		return { ok: true, value: result }
	}

	return addStandardSchema(fn)
}
