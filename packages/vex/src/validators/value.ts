// ============================================================
// Value Validators
// ============================================================

import type { Result, Validator } from '../core'
import { createValidator, ValidationError } from '../core'

/**
 * Validate value equals expected
 *
 * @example
 * const isZero = pipe(num, value(0))
 */
export const value = <T>(expected: T): Validator<T, T> => {
	const msg = `Expected ${JSON.stringify(expected)}`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (v !== expected) throw new ValidationError(msg)
			return v
		},
		(v) => (v === expected ? { ok: true, value: v } : err)
	)
}

/**
 * Validate value is one of expected values
 *
 * @example
 * const isValidStatus = pipe(str, values(['active', 'inactive']))
 */
export const values = <T>(expected: readonly T[]): Validator<T, T> => {
	const set = new Set(expected)
	const msg = `Expected one of: ${expected.map((v) => JSON.stringify(v)).join(', ')}`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (!set.has(v)) throw new ValidationError(msg)
			return v
		},
		(v) => (set.has(v) ? { ok: true, value: v } : err)
	)
}

/**
 * Validate value is not the excluded value
 *
 * @example
 * const notZero = pipe(num, notValue(0))
 */
export const notValue = <T>(excluded: T): Validator<T, T> => {
	const msg = `Value must not be ${JSON.stringify(excluded)}`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (v === excluded) throw new ValidationError(msg)
			return v
		},
		(v) => (v !== excluded ? { ok: true, value: v } : err)
	)
}

/**
 * Validate value is not one of excluded values
 *
 * @example
 * const notSpecial = pipe(num, notValues([0, -1]))
 */
export const notValues = <T>(excluded: readonly T[]): Validator<T, T> => {
	const set = new Set<T>(excluded)
	const msg = `Value must not be one of: ${excluded.map((v) => JSON.stringify(v)).join(', ')}`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (set.has(v)) throw new ValidationError(msg)
			return v
		},
		(v) => (!set.has(v) ? { ok: true, value: v } : err)
	)
}

/**
 * Validate value is greater than min (alias for gt)
 *
 * @example
 * const positive = pipe(num, gtValue(0))
 */
export const gtValue = (min: number | bigint | Date): Validator<number | bigint | Date> => {
	const msg = `Must be greater than ${min instanceof Date ? min.toISOString() : min}`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (v <= min) throw new ValidationError(msg)
			return v
		},
		(v) => (v > min ? { ok: true, value: v } : err)
	)
}

/**
 * Validate value is less than max (alias for lt)
 *
 * @example
 * const negative = pipe(num, ltValue(0))
 */
export const ltValue = (max: number | bigint | Date): Validator<number | bigint | Date> => {
	const msg = `Must be less than ${max instanceof Date ? max.toISOString() : max}`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (v >= max) throw new ValidationError(msg)
			return v
		},
		(v) => (v < max ? { ok: true, value: v } : err)
	)
}

/**
 * Validate value is at least min (alias for gte / minValue)
 *
 * @example
 * const nonNegative = pipe(num, minValue(0))
 */
export const minValue = (min: number | bigint | Date): Validator<number | bigint | Date> => {
	const msg = `Must be at least ${min instanceof Date ? min.toISOString() : min}`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (v < min) throw new ValidationError(msg)
			return v
		},
		(v) => (v >= min ? { ok: true, value: v } : err)
	)
}

/**
 * Validate value is at most max (alias for lte / maxValue)
 *
 * @example
 * const atMost100 = pipe(num, maxValue(100))
 */
export const maxValue = (max: number | bigint | Date): Validator<number | bigint | Date> => {
	const msg = `Must be at most ${max instanceof Date ? max.toISOString() : max}`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (v > max) throw new ValidationError(msg)
			return v
		},
		(v) => (v <= max ? { ok: true, value: v } : err)
	)
}
