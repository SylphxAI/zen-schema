// ============================================================
// Size Validators (for Set, Map, Array, and other collections)
// ============================================================

import type { Result, Validator } from '../core'
import { createValidator, ValidationError } from '../core'

type Sized = { size: number } | { length: number }

const getSize = (v: Sized): number => ('size' in v ? v.size : v.length)

/** Exact size validator */
export const size = <T extends Sized>(n: number): Validator<T> => {
	const msg = `Must have size ${n}`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (getSize(v) !== n) throw new ValidationError(msg)
			return v
		},
		(v) => (getSize(v) === n ? { ok: true, value: v } : err),
	)
}

/** Minimum size validator */
export const minSize = <T extends Sized>(n: number): Validator<T> => {
	const msg = `Must have at least size ${n}`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (getSize(v) < n) throw new ValidationError(msg)
			return v
		},
		(v) => (getSize(v) >= n ? { ok: true, value: v } : err),
	)
}

/** Maximum size validator */
export const maxSize = <T extends Sized>(n: number): Validator<T> => {
	const msg = `Must have at most size ${n}`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (getSize(v) > n) throw new ValidationError(msg)
			return v
		},
		(v) => (getSize(v) <= n ? { ok: true, value: v } : err),
	)
}

/** Not size validator */
export const notSize = <T extends Sized>(n: number): Validator<T> => {
	const msg = `Must not have size ${n}`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (getSize(v) === n) throw new ValidationError(msg)
			return v
		},
		(v) => (getSize(v) !== n ? { ok: true, value: v } : err),
	)
}
