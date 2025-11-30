// ============================================================
// Primitive Type Validators
// ============================================================

import type { Parser, Result } from '../core'
import { createValidator, ValidationError } from '../core'

// Pre-allocated error results (no allocation on failure)
const ERR_STRING: Result<never> = { ok: false, error: 'Expected string' }
const ERR_NUMBER: Result<never> = { ok: false, error: 'Expected number' }
const ERR_BOOLEAN: Result<never> = { ok: false, error: 'Expected boolean' }
const ERR_BIGINT: Result<never> = { ok: false, error: 'Expected bigint' }
const ERR_DATE: Result<never> = { ok: false, error: 'Expected Date' }
const ERR_ARRAY: Result<never> = { ok: false, error: 'Expected array' }
const ERR_OBJECT: Result<never> = { ok: false, error: 'Expected object' }

/** Validate string type */
export const str: Parser<string> = createValidator(
	(v) => {
		if (typeof v !== 'string') throw new ValidationError('Expected string')
		return v
	},
	(v) => (typeof v === 'string' ? { ok: true, value: v } : ERR_STRING),
	{ type: 'string' }
)

/** Validate number type */
export const num: Parser<number> = createValidator(
	(v) => {
		if (typeof v !== 'number' || Number.isNaN(v)) throw new ValidationError('Expected number')
		return v
	},
	(v) => (typeof v === 'number' && !Number.isNaN(v) ? { ok: true, value: v } : ERR_NUMBER),
	{ type: 'number' }
)

/** Validate boolean type */
export const bool: Parser<boolean> = createValidator(
	(v) => {
		if (typeof v !== 'boolean') throw new ValidationError('Expected boolean')
		return v
	},
	(v) => (typeof v === 'boolean' ? { ok: true, value: v } : ERR_BOOLEAN),
	{ type: 'boolean' }
)

/** Validate bigint type */
export const bigInt: Parser<bigint> = createValidator(
	(v) => {
		if (typeof v !== 'bigint') throw new ValidationError('Expected bigint')
		return v
	},
	(v) => (typeof v === 'bigint' ? { ok: true, value: v } : ERR_BIGINT),
	{ type: 'bigint' }
)

/** Validate Date type */
export const date: Parser<Date> = createValidator(
	(v) => {
		if (!(v instanceof Date) || Number.isNaN(v.getTime()))
			throw new ValidationError('Expected Date')
		return v
	},
	(v) => (v instanceof Date && !Number.isNaN(v.getTime()) ? { ok: true, value: v } : ERR_DATE),
	{ type: 'date' }
)

/** Validate array type */
export const arr: Parser<unknown[]> = createValidator(
	(v) => {
		if (!Array.isArray(v)) throw new ValidationError('Expected array')
		return v
	},
	(v) => (Array.isArray(v) ? { ok: true, value: v } : ERR_ARRAY),
	{ type: 'array' }
)

/** Validate object type (not null, not array) */
export const obj: Parser<Record<string, unknown>> = createValidator(
	(v) => {
		if (typeof v !== 'object' || v === null || Array.isArray(v))
			throw new ValidationError('Expected object')
		return v as Record<string, unknown>
	},
	(v) =>
		typeof v === 'object' && v !== null && !Array.isArray(v)
			? { ok: true, value: v as Record<string, unknown> }
			: ERR_OBJECT,
	{ type: 'object' }
)
