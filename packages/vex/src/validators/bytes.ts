// ============================================================
// Bytes Validators (for strings)
// ============================================================

import type { Result, Validator } from '../core'
import { createValidator, ValidationError } from '../core'

/**
 * Validate string byte length equals n
 *
 * @example
 * const validate4Bytes = pipe(str, bytes(4))
 */
export const bytes = (n: number): Validator<string> => {
	const msg = `Must be ${n} bytes`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			const len = new TextEncoder().encode(v).length
			if (len !== n) throw new ValidationError(msg)
			return v
		},
		(v) => (new TextEncoder().encode(v).length === n ? { ok: true, value: v } : err)
	)
}

/**
 * Validate string byte length is at least n
 *
 * @example
 * const validateMinBytes = pipe(str, minBytes(1))
 */
export const minBytes = (n: number): Validator<string> => {
	const msg = `Must be at least ${n} bytes`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			const len = new TextEncoder().encode(v).length
			if (len < n) throw new ValidationError(msg)
			return v
		},
		(v) => (new TextEncoder().encode(v).length >= n ? { ok: true, value: v } : err)
	)
}

/**
 * Validate string byte length is at most n
 *
 * @example
 * const validateMaxBytes = pipe(str, maxBytes(100))
 */
export const maxBytes = (n: number): Validator<string> => {
	const msg = `Must be at most ${n} bytes`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			const len = new TextEncoder().encode(v).length
			if (len > n) throw new ValidationError(msg)
			return v
		},
		(v) => (new TextEncoder().encode(v).length <= n ? { ok: true, value: v } : err)
	)
}

/**
 * Validate string byte length is not n
 *
 * @example
 * const validateNotBytes = pipe(str, notBytes(0))
 */
export const notBytes = (n: number): Validator<string> => {
	const msg = `Must not be ${n} bytes`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			const len = new TextEncoder().encode(v).length
			if (len === n) throw new ValidationError(msg)
			return v
		},
		(v) => (new TextEncoder().encode(v).length !== n ? { ok: true, value: v } : err)
	)
}
