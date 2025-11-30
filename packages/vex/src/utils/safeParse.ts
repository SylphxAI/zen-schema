// ============================================================
// Safe Parse Utilities
// ============================================================

import type { Validator } from '../core'

/**
 * Try to validate, return null on error
 */
export const tryParse =
	<I, O>(validator: Validator<I, O>) =>
	(value: I): O | null => {
		if (validator.safe) {
			const result = validator.safe(value)
			return result.ok ? result.value : null
		}
		try {
			return validator(value)
		} catch {
			return null
		}
	}

/**
 * Try to validate, return result object
 */
export const safeParse =
	<I, O>(validator: Validator<I, O>) =>
	(value: I): { success: true; data: O } | { success: false; error: string } => {
		if (validator.safe) {
			const result = validator.safe(value)
			return result.ok
				? { success: true, data: result.value }
				: { success: false, error: result.error }
		}
		try {
			return { success: true, data: validator(value) }
		} catch (e) {
			return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

/**
 * Returns a parser function for the validator
 * @example
 * const parseEmail = parser(pipe(str, email))
 * const email = parseEmail('test@example.com')
 */
export const parser =
	<I, O>(validator: Validator<I, O>) =>
	(value: I): O =>
		validator(value)

/**
 * Returns a safe parser function for the validator
 * @example
 * const parseEmailSafe = safeParser(pipe(str, email))
 * const result = parseEmailSafe('test@example.com')
 */
export const safeParser =
	<I, O>(validator: Validator<I, O>) =>
	(value: I): { success: true; data: O } | { success: false; error: string } =>
		safeParse(validator)(value)

/**
 * Type guard function - returns true if value passes validation
 * @example
 * const isEmail = is(pipe(str, email))
 * if (isEmail(value)) { ... }
 */
export const is =
	<I, O>(validator: Validator<I, O>) =>
	(value: unknown): value is O => {
		if (validator.safe) {
			return validator.safe(value as I).ok
		}
		try {
			validator(value as I)
			return true
		} catch {
			return false
		}
	}

/**
 * Assert that value passes validation, throws if not
 * @example
 * assert(pipe(str, email), value)
 * // value is now typed as string
 */
export function assert<I, O>(validator: Validator<I, O>, value: I): asserts value is I & O {
	validator(value)
}
