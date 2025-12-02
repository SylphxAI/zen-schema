// ============================================================
// Refine & Transform
// ============================================================

import type { Result, Validator } from '../core'
import { addStandardSchema, getErrorMsg, ValidationError } from '../core'

/**
 * Add a custom validation check
 *
 * @example
 * const positiveNumber = refine(num, (n) => n > 0, 'Must be positive')
 * const evenNumber = refine(num, (n) => n % 2 === 0, 'Must be even')
 */
export const refine = <I, O>(
	validator: Validator<I, O>,
	check: (value: O) => boolean,
	message = 'Validation failed',
): Validator<I, O> => {
	const err: Result<never> = { ok: false, error: message }

	const fn = ((value: I) => {
		const result = validator(value)
		if (!check(result)) throw new ValidationError(message)
		return result
	}) as Validator<I, O>

	fn.safe = (value: I): Result<O> => {
		if (validator.safe) {
			const r = validator.safe(value)
			if (!r.ok) return r
			return check(r.value) ? { ok: true, value: r.value } : err
		}
		try {
			const result = validator(value)
			return check(result) ? { ok: true, value: result } : err
		} catch (e) {
			return { ok: false, error: getErrorMsg(e) }
		}
	}

	return addStandardSchema(fn)
}

/**
 * Transform the validated value
 *
 * @example
 * const upperStr = transform(str, (s) => s.toUpperCase())
 * const doubled = transform(num, (n) => n * 2)
 */
export const transform = <I, O, T>(
	validator: Validator<I, O>,
	transformFn: (value: O) => T,
): Validator<I, T> => {
	const result = ((value: I) => {
		const validated = validator(value)
		return transformFn(validated)
	}) as Validator<I, T>

	result.safe = (value: I): Result<T> => {
		if (validator.safe) {
			const r = validator.safe(value)
			if (!r.ok) return r as Result<T>
			try {
				return { ok: true, value: transformFn(r.value) }
			} catch (e) {
				return { ok: false, error: e instanceof Error ? e.message : 'Transform failed' }
			}
		}
		try {
			const validated = validator(value)
			return { ok: true, value: transformFn(validated) }
		} catch (e) {
			return { ok: false, error: getErrorMsg(e) }
		}
	}

	return addStandardSchema(result)
}

/**
 * Catch validation errors and return a default value
 *
 * @example
 * const safeNum = catchError(num, 0)
 */
export const catchError = <I, O>(validator: Validator<I, O>, defaultValue: O): Validator<I, O> => {
	const fn = ((value: I) => {
		try {
			return validator(value)
		} catch {
			return defaultValue
		}
	}) as Validator<I, O>

	fn.safe = (value: I): Result<O> => {
		if (validator.safe) {
			const result = validator.safe(value)
			return result.ok ? result : { ok: true, value: defaultValue }
		}
		try {
			return { ok: true, value: validator(value) }
		} catch {
			return { ok: true, value: defaultValue }
		}
	}

	return addStandardSchema(fn)
}
