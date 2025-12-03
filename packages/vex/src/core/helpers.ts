// ============================================================
// Helper Functions
// ============================================================

import { isMetaAction, type MetaAction, type Metadata, setMeta } from './metadata'
import type { StandardSchemaV1 } from './standard'
import type { Result, Schema, Validator } from './types'

// ============================================================
// MetaAction Separation (shared across union, intersect, tuple)
// ============================================================

/** Argument type that can be a schema or MetaAction */
export type SchemaOrMetaAction = Schema<unknown> | MetaAction

/** Result of separating schemas from MetaActions */
export interface SeparatedArgs {
	schemas: Schema<unknown>[]
	metaActions: MetaAction[]
}

/**
 * Separate schemas from MetaActions in mixed argument list
 *
 * Used by union(), intersect(), tuple() to handle trailing MetaAction args
 */
export function separateMetaActions(args: SchemaOrMetaAction[]): SeparatedArgs {
	const schemas: Schema<unknown>[] = []
	const metaActions: MetaAction[] = []

	for (const arg of args) {
		if (isMetaAction(arg)) {
			metaActions.push(arg)
		} else {
			schemas.push(arg)
		}
	}

	return { schemas, metaActions }
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
	metadata?: Metadata,
): Validator<I, O> {
	const fn = validate as Validator<I, O>
	fn.safe = safeValidate
	if (metadata) {
		setMeta(fn, metadata)
	}
	return addStandardSchema(fn)
}
