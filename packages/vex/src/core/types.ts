// ============================================================
// Core Types
// ============================================================

import type { StandardSchemaV1 } from './standard'

/** Result type for validation (no throwing) */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string }

/** A validator function that returns the value or throws, with optional Standard Schema support */
export type Validator<I, O = I> = ((value: I) => O) & {
	/** Safe version that returns Result instead of throwing */
	safe?: (value: I) => Result<O>
	/** Standard Schema V1 support */
	'~standard'?: StandardSchemaV1.Props<I, O>
}

/** A validator with guaranteed Standard Schema support */
export type StandardValidator<I, O = I> = Validator<I, O> & StandardSchemaV1<I, O>

/** A validator that accepts unknown input */
export type Parser<O> = Validator<unknown, O>
