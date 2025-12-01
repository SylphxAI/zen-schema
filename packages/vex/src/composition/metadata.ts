// ============================================================
// Metadata Composition Functions
// ============================================================
//
// Functions to add documentation and nominal typing to validators.
// Uses the unified metadata system from core/metadata.ts
//
// ============================================================

import type { Parser, Result, Validator } from '../core'
import { addStandardSchema, getMeta, type Metadata, setMeta } from '../core'

// ============================================================
// Re-exports from core
// ============================================================

export { getMeta, type Metadata } from '../core'

// ============================================================
// Getter Functions
// ============================================================

/**
 * Get metadata from a validator
 *
 * @example
 * const meta = getMetadata(validator)
 */
export const getMetadata = getMeta

/**
 * Get description from a validator
 *
 * @example
 * const desc = getDescription(emailValidator)
 */
export const getDescription = <I, O>(validator: Validator<I, O>): string | undefined => {
	return getMeta(validator)?.description
}

/**
 * Get title from a validator
 *
 * @example
 * const t = getTitle(emailValidator)
 */
export const getTitle = <I, O>(validator: Validator<I, O>): string | undefined => {
	return getMeta(validator)?.title
}

/**
 * Get examples from a validator
 *
 * @example
 * const exs = getExamples(emailValidator)
 */
export const getExamples = <I, O>(validator: Validator<I, O>): unknown[] | undefined => {
	return getMeta(validator)?.examples
}

/**
 * Get brand from a validator
 *
 * @example
 * const b = getBrand(emailValidator)
 */
export const getBrand = <I, O>(validator: Validator<I, O>): string | undefined => {
	return getMeta(validator)?.brand
}

/**
 * Get flavor from a validator
 *
 * @example
 * const f = getFlavor(userIdValidator)
 */
export const getFlavor = <I, O>(validator: Validator<I, O>): string | undefined => {
	return getMeta(validator)?.flavor
}

// ============================================================
// Helper: Clone validator with metadata
// ============================================================

function cloneWithMeta<I, O>(
	validator: Validator<I, O>,
	metaUpdates: Partial<Metadata>,
): Validator<I, O> {
	const fn = ((value: I) => validator(value)) as Validator<I, O>

	fn.safe = (value: I): Result<O> => {
		if (validator.safe) return validator.safe(value)
		try {
			return { ok: true, value: validator(value) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	// Get existing metadata and merge with updates
	const existing = getMeta(validator)
	if (existing) {
		setMeta(fn, { ...existing, ...metaUpdates })
	} else {
		// If no existing metadata, create minimal metadata with updates
		setMeta(fn, { type: 'unknown', ...metaUpdates })
	}

	return addStandardSchema(fn)
}

// ============================================================
// Setter Functions
// ============================================================

/**
 * Add or update all metadata on a validator
 *
 * @example
 * const validated = metadata(str(), {
 *   description: 'User email address',
 *   title: 'Email',
 *   examples: ['user@example.com']
 * })
 */
export const metadata = <I, O>(
	validator: Validator<I, O>,
	meta: Partial<Metadata>,
): Validator<I, O> => {
	return cloneWithMeta(validator, meta)
}

/**
 * Add a description to a validator
 *
 * @example
 * const validateEmail = description(str(email), 'User email address')
 */
export const description = <I, O>(validator: Validator<I, O>, text: string): Validator<I, O> => {
	return cloneWithMeta(validator, { description: text })
}

/**
 * Add a title to a validator
 *
 * @example
 * const validateEmail = title(str(email), 'Email')
 */
export const title = <I, O>(validator: Validator<I, O>, text: string): Validator<I, O> => {
	return cloneWithMeta(validator, { title: text })
}

/**
 * Add examples to a validator
 *
 * @example
 * const validateEmail = examples(str(email), ['user@example.com', 'admin@domain.org'])
 */
export const examples = <I, O>(validator: Validator<I, O>, exampleValues: O[]): Validator<I, O> => {
	return cloneWithMeta(validator, { examples: exampleValues })
}

/**
 * Add a brand to a validator (nominal typing support)
 *
 * @example
 * type Email = string & { __brand: 'Email' }
 * const validateEmail = brand(str(email), 'Email')
 */
export const brand = <I, O, B extends string>(
	validator: Validator<I, O>,
	brandName: B,
): Validator<I, O & { __brand: B }> => {
	const fn = ((value: I) => validator(value)) as Validator<I, O & { __brand: B }>

	fn.safe = (value: I): Result<O & { __brand: B }> => {
		if (validator.safe) {
			const result = validator.safe(value)
			if (result.ok) return { ok: true, value: result.value as O & { __brand: B } }
			return result as Result<O & { __brand: B }>
		}
		try {
			return { ok: true, value: validator(value) as O & { __brand: B } }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	// Get existing metadata and add brand
	const existing = getMeta(validator)
	if (existing) {
		setMeta(fn, { ...existing, brand: brandName })
	} else {
		setMeta(fn, { type: 'unknown', brand: brandName })
	}

	return addStandardSchema(fn)
}

/**
 * Add a flavor to a validator (weaker nominal typing)
 *
 * @example
 * type UserId = string & { __flavor?: 'UserId' }
 * const validateUserId = flavor(str(uuid), 'UserId')
 */
export const flavor = <I, O, F extends string>(
	validator: Validator<I, O>,
	flavorName: F,
): Validator<I, O & { __flavor?: F }> => {
	const fn = ((value: I) => validator(value)) as Validator<I, O & { __flavor?: F }>

	fn.safe = (value: I): Result<O & { __flavor?: F }> => {
		if (validator.safe) {
			const result = validator.safe(value)
			if (result.ok) return { ok: true, value: result.value as O & { __flavor?: F } }
			return result as Result<O & { __flavor?: F }>
		}
		try {
			return { ok: true, value: validator(value) as O & { __flavor?: F } }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	// Get existing metadata and add flavor
	const existing = getMeta(validator)
	if (existing) {
		setMeta(fn, { ...existing, flavor: flavorName })
	} else {
		setMeta(fn, { type: 'unknown', flavor: flavorName })
	}

	return addStandardSchema(fn)
}

/**
 * Make a validator readonly (type-level only, no runtime effect)
 *
 * @example
 * const validateReadonlyUser = readonly(validateUser)
 */
export const readonly = <O>(validator: Parser<O>): Parser<Readonly<O>> => {
	const fn = ((value: unknown) => validator(value)) as Parser<Readonly<O>>

	fn.safe = (value: unknown): Result<Readonly<O>> => {
		if (validator.safe) {
			const result = validator.safe(value)
			if (result.ok) return { ok: true, value: result.value as Readonly<O> }
			return result as Result<Readonly<O>>
		}
		try {
			return { ok: true, value: validator(value) as Readonly<O> }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	// Get existing metadata and add readonly flag
	const existing = getMeta(validator)
	if (existing) {
		setMeta(fn, { ...existing, readonly: true })
	} else {
		setMeta(fn, { type: 'unknown', readonly: true })
	}

	return addStandardSchema(fn)
}

/**
 * Mark a validator as deprecated
 *
 * @example
 * const oldValidator = deprecated(str())
 */
export const deprecated = <I, O>(validator: Validator<I, O>): Validator<I, O> => {
	return cloneWithMeta(validator, { deprecated: true })
}
