// ============================================================
// Custom Validators
// ============================================================

import type { Parser, Result } from '../core'
import { addStandardSchema, ValidationError } from '../core'

/**
 * Create a custom validator from a validation function
 *
 * @example
 * const isEven = custom<number>((v) => v % 2 === 0, 'Must be even')
 */
export const custom = <T>(
	checkFn: (value: T) => boolean,
	message = 'Validation failed',
): Parser<T> => {
	const err: Result<never> = { ok: false, error: message }

	const fn = ((value: unknown) => {
		if (!checkFn(value as T)) throw new ValidationError(message)
		return value as T
	}) as Parser<T>

	fn.safe = (value: unknown): Result<T> => {
		try {
			if (!checkFn(value as T)) return err
			return { ok: true, value: value as T }
		} catch {
			return err
		}
	}

	return addStandardSchema(fn)
}

/**
 * Create a custom async validator from a validation function
 * Note: Returns an async parser that must be awaited
 *
 * @example
 * const isUniqueEmail = customAsync<string>(
 *   async (email) => !(await db.users.exists({ email })),
 *   'Email already exists'
 * )
 */
export const customAsync = <T>(
	checkFn: (value: T) => Promise<boolean>,
	message = 'Validation failed',
): ((value: unknown) => Promise<T>) => {
	return async (value: unknown) => {
		if (!(await checkFn(value as T))) throw new ValidationError(message)
		return value as T
	}
}

/**
 * Create a validator that performs any check (alias for refine with boolean return)
 *
 * @example
 * const positive = check((n: number) => n > 0, 'Must be positive')
 */
export const check: typeof custom = custom
