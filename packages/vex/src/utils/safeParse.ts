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
