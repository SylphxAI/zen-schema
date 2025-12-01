// ============================================================
// Helper Functions
// ============================================================

import { type Metadata, setMeta } from './metadata'
import type { StandardSchemaV1 } from './standard'
import type { Result, Validator } from './types'

// ============================================================
// Standard Schema Support
// ============================================================

/**
 * Add Standard Schema support to a validator
 */
export function addStandardSchema<I, O>(fn: Validator<I, O>): Validator<I, O> {
	const safeFn = fn.safe
	;(fn as unknown as Record<string, unknown>)['~standard'] = {
		version: 1 as const,
		vendor: 'vex',
		validate: (value: unknown): StandardSchemaV1.Result<O> => {
			if (safeFn) {
				const result = safeFn(value as I)
				if (result.ok) {
					return { value: result.value }
				}
				return { issues: [{ message: result.error }] }
			}
			// Fallback to try-catch
			try {
				return { value: fn(value as I) }
			} catch (e) {
				return { issues: [{ message: e instanceof Error ? e.message : 'Unknown error' }] }
			}
		},
	}
	return fn
}

/**
 * Create validator with safe version and Standard Schema
 */
export function createValidator<I, O>(
	validate: (value: I) => O,
	safeValidate: (value: I) => Result<O>,
	metadata?: Metadata,
): Validator<I, O> {
	const fn = validate as Validator<I, O>
	fn.safe = safeValidate
	if (metadata) {
		setMeta(fn, metadata)
	}
	return addStandardSchema(fn)
}
