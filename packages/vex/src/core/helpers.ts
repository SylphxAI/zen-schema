// ============================================================
// Helper Functions
// ============================================================

import type { StandardSchemaV1 } from './standard'
import type { Result, Validator } from './types'

// ============================================================
// Schema Metadata
// ============================================================

/** Schema metadata for JSON Schema conversion */
export interface SchemaMetadata {
	type: string
	constraints?: Record<string, unknown>
	inner?: unknown
}

const SCHEMA_META = '~schema' as const

/**
 * Add schema metadata to a validator
 */
export function addSchemaMetadata<I, O>(
	fn: Validator<I, O>,
	metadata: SchemaMetadata
): Validator<I, O> {
	;(fn as unknown as Record<string, unknown>)[SCHEMA_META] = metadata
	return fn
}

/**
 * Get schema metadata from a validator
 */
export function getSchemaMetadata(validator: unknown): SchemaMetadata | undefined {
	return (validator as Record<string, unknown>)?.[SCHEMA_META] as SchemaMetadata | undefined
}

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
	metadata?: SchemaMetadata
): Validator<I, O> {
	const fn = validate as Validator<I, O>
	fn.safe = safeValidate
	if (metadata) {
		addSchemaMetadata(fn, metadata)
	}
	return addStandardSchema(fn)
}
