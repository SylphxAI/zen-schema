// ============================================================
// Number Validators
// ============================================================

import type { Result, Validator } from '../core'
import { createValidator, ValidationError } from '../core'

const ERR_INT: Result<never> = { ok: false, error: 'Must be integer' }
const ERR_POSITIVE: Result<never> = { ok: false, error: 'Must be positive' }
const ERR_NEGATIVE: Result<never> = { ok: false, error: 'Must be negative' }
const ERR_NONNEGATIVE: Result<never> = { ok: false, error: 'Must be non-negative' }
const ERR_NONPOSITIVE: Result<never> = { ok: false, error: 'Must be non-positive' }
const ERR_FINITE: Result<never> = { ok: false, error: 'Must be finite' }
const ERR_SAFE: Result<never> = { ok: false, error: 'Must be safe integer' }

/** Integer check */
export const int: Validator<number> = createValidator(
	(v) => {
		if (!Number.isInteger(v)) throw new ValidationError('Must be integer')
		return v
	},
	(v) => (Number.isInteger(v) ? { ok: true, value: v } : ERR_INT),
	{ type: 'integer', constraints: { integer: true } },
)

/** Positive number (> 0) */
export const positive: Validator<number> = createValidator(
	(v) => {
		if (v <= 0) throw new ValidationError('Must be positive')
		return v
	},
	(v) => (v > 0 ? { ok: true, value: v } : ERR_POSITIVE),
	{ type: 'positive', constraints: { exclusiveMinimum: 0 } },
)

/** Negative number (< 0) */
export const negative: Validator<number> = createValidator(
	(v) => {
		if (v >= 0) throw new ValidationError('Must be negative')
		return v
	},
	(v) => (v < 0 ? { ok: true, value: v } : ERR_NEGATIVE),
	{ type: 'negative', constraints: { exclusiveMaximum: 0 } },
)

/** Non-negative number (>= 0) */
export const nonnegative: Validator<number> = createValidator(
	(v) => {
		if (v < 0) throw new ValidationError('Must be non-negative')
		return v
	},
	(v) => (v >= 0 ? { ok: true, value: v } : ERR_NONNEGATIVE),
	{ type: 'nonnegative', constraints: { minimum: 0 } },
)

/** Non-positive number (<= 0) */
export const nonpositive: Validator<number> = createValidator(
	(v) => {
		if (v > 0) throw new ValidationError('Must be non-positive')
		return v
	},
	(v) => (v <= 0 ? { ok: true, value: v } : ERR_NONPOSITIVE),
	{ type: 'nonpositive', constraints: { maximum: 0 } },
)

/** Finite number */
export const finite: Validator<number> = createValidator(
	(v) => {
		if (!Number.isFinite(v)) throw new ValidationError('Must be finite')
		return v
	},
	(v) => (Number.isFinite(v) ? { ok: true, value: v } : ERR_FINITE),
	{ type: 'finite', constraints: { finite: true } },
)

/** Greater than or equal */
export const gte = (n: number): Validator<number> => {
	const err: Result<never> = { ok: false, error: `Min ${n}` }
	return createValidator(
		(v) => {
			if (v < n) throw new ValidationError(`Min ${n}`)
			return v
		},
		(v) => (v >= n ? { ok: true, value: v } : err),
		{ type: 'gte', constraints: { minimum: n } },
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
		(v) => (v <= n ? { ok: true, value: v } : err),
		{ type: 'lte', constraints: { maximum: n } },
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
		(v) => (v > n ? { ok: true, value: v } : err),
		{ type: 'gt', constraints: { exclusiveMinimum: n } },
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
		(v) => (v < n ? { ok: true, value: v } : err),
		{ type: 'lt', constraints: { exclusiveMaximum: n } },
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
		(v) => (v % n === 0 ? { ok: true, value: v } : err),
		{ type: 'multipleOf', constraints: { multipleOf: n } },
	)
}

/** Safe integer (within JS safe integer range) */
export const safe: Validator<number> = createValidator(
	(v) => {
		if (!Number.isSafeInteger(v)) throw new ValidationError('Must be safe integer')
		return v
	},
	(v) => (Number.isSafeInteger(v) ? { ok: true, value: v } : ERR_SAFE),
	{
		type: 'safeInteger',
		constraints: {
			integer: true,
			minimum: Number.MIN_SAFE_INTEGER,
			maximum: Number.MAX_SAFE_INTEGER,
		},
	},
)

/** Alias: step is same as multipleOf */
export { multipleOf as step }

/** Alias: integer is same as int (Valibot compatibility) */
export { int as integer }

/** Alias: safeInteger is same as safe (Valibot compatibility) */
export { safe as safeInteger }
