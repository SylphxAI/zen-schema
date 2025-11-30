// ============================================================
// Optional, Nullable, WithDefault
// ============================================================

import type { Result, Validator } from '../core'
import { addStandardSchema } from '../core'

/**
 * Make a validator optional (allows undefined)
 */
export const optional = <I, O>(
	validator: Validator<I, O>
): Validator<I | undefined, O | undefined> => {
	const fn = ((v: I | undefined) => {
		if (v === undefined) return undefined
		return validator(v)
	}) as Validator<I | undefined, O | undefined>

	fn.safe = (v: I | undefined): Result<O | undefined> => {
		if (v === undefined) return { ok: true, value: undefined }
		if (validator.safe) return validator.safe(v)
		try {
			return { ok: true, value: validator(v) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return addStandardSchema(fn)
}

/**
 * Make a validator nullable (allows null)
 */
export const nullable = <I, O>(validator: Validator<I, O>): Validator<I | null, O | null> => {
	const fn = ((v: I | null) => {
		if (v === null) return null
		return validator(v)
	}) as Validator<I | null, O | null>

	fn.safe = (v: I | null): Result<O | null> => {
		if (v === null) return { ok: true, value: null }
		if (validator.safe) return validator.safe(v)
		try {
			return { ok: true, value: validator(v) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return addStandardSchema(fn)
}

/**
 * Make a validator nullish (allows null or undefined)
 */
export const nullish = <I, O>(
	validator: Validator<I, O>
): Validator<I | null | undefined, O | null | undefined> => {
	const fn = ((v: I | null | undefined) => {
		if (v === null || v === undefined) return v
		return validator(v)
	}) as Validator<I | null | undefined, O | null | undefined>

	fn.safe = (v: I | null | undefined): Result<O | null | undefined> => {
		if (v === null || v === undefined) return { ok: true, value: v as O | null | undefined }
		if (validator.safe) return validator.safe(v)
		try {
			return { ok: true, value: validator(v) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return addStandardSchema(fn)
}

/**
 * Provide a default value when undefined
 */
export const withDefault = <I, O>(
	validator: Validator<I, O>,
	defaultValue: O
): Validator<I | undefined, O> => {
	const fn = ((v: I | undefined) => {
		if (v === undefined) return defaultValue
		return validator(v)
	}) as Validator<I | undefined, O>

	fn.safe = (v: I | undefined): Result<O> => {
		if (v === undefined) return { ok: true, value: defaultValue }
		if (validator.safe) return validator.safe(v)
		try {
			return { ok: true, value: validator(v) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return addStandardSchema(fn)
}
