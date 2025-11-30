// ============================================================
// Number Validators
// ============================================================

import type { Result, Validator } from '../core'
import { createValidator, ValidationError } from '../core'

const ERR_INT: Result<never> = { ok: false, error: 'Must be integer' }
const ERR_POSITIVE: Result<never> = { ok: false, error: 'Must be positive' }
const ERR_NEGATIVE: Result<never> = { ok: false, error: 'Must be negative' }
const ERR_FINITE: Result<never> = { ok: false, error: 'Must be finite' }

/** Integer check */
export const int: Validator<number> = createValidator(
	(v) => {
		if (!Number.isInteger(v)) throw new ValidationError('Must be integer')
		return v
	},
	(v) => (Number.isInteger(v) ? { ok: true, value: v } : ERR_INT)
)

/** Positive number (> 0) */
export const positive: Validator<number> = createValidator(
	(v) => {
		if (v <= 0) throw new ValidationError('Must be positive')
		return v
	},
	(v) => (v > 0 ? { ok: true, value: v } : ERR_POSITIVE)
)

/** Negative number (< 0) */
export const negative: Validator<number> = createValidator(
	(v) => {
		if (v >= 0) throw new ValidationError('Must be negative')
		return v
	},
	(v) => (v < 0 ? { ok: true, value: v } : ERR_NEGATIVE)
)

/** Finite number */
export const finite: Validator<number> = createValidator(
	(v) => {
		if (!Number.isFinite(v)) throw new ValidationError('Must be finite')
		return v
	},
	(v) => (Number.isFinite(v) ? { ok: true, value: v } : ERR_FINITE)
)

/** Greater than or equal */
export const gte = (n: number): Validator<number> => {
	const err: Result<never> = { ok: false, error: `Min ${n}` }
	return createValidator(
		(v) => {
			if (v < n) throw new ValidationError(`Min ${n}`)
			return v
		},
		(v) => (v >= n ? { ok: true, value: v } : err)
	)
}

/** Less than or equal */
export const lte = (n: number): Validator<number> => {
	const err: Result<never> = { ok: false, error: `Max ${n}` }
	return createValidator(
		(v) => {
			if (v > n) throw new ValidationError(`Max ${n}`)
			return v
		},
		(v) => (v <= n ? { ok: true, value: v } : err)
	)
}

/** Greater than */
export const gt = (n: number): Validator<number> => {
	const err: Result<never> = { ok: false, error: `Must be > ${n}` }
	return createValidator(
		(v) => {
			if (v <= n) throw new ValidationError(`Must be > ${n}`)
			return v
		},
		(v) => (v > n ? { ok: true, value: v } : err)
	)
}

/** Less than */
export const lt = (n: number): Validator<number> => {
	const err: Result<never> = { ok: false, error: `Must be < ${n}` }
	return createValidator(
		(v) => {
			if (v >= n) throw new ValidationError(`Must be < ${n}`)
			return v
		},
		(v) => (v < n ? { ok: true, value: v } : err)
	)
}

/** Multiple of */
export const multipleOf = (n: number): Validator<number> => {
	const err: Result<never> = { ok: false, error: `Must be multiple of ${n}` }
	return createValidator(
		(v) => {
			if (v % n !== 0) throw new ValidationError(`Must be multiple of ${n}`)
			return v
		},
		(v) => (v % n === 0 ? { ok: true, value: v } : err)
	)
}
