// ============================================================
// Metadata Functions
// ============================================================

import type { Parser, Result, Validator } from '../core'
import { addStandardSchema } from '../core'

/** Symbol for storing metadata on validators */
const META = Symbol.for('vex.metadata')

/** Metadata interface */
export interface ValidatorMetadata {
	description?: string
	title?: string
	brand?: string
	flavor?: string
	examples?: unknown[]
	[key: string]: unknown
}

/** Validator with metadata */
export type ValidatorWithMeta<I, O> = Validator<I, O> & {
	[META]?: ValidatorMetadata
}

/**
 * Get metadata from a validator
 *
 * @example
 * const meta = getMetadata(validator)
 */
export const getMetadata = <I, O>(validator: Validator<I, O>): ValidatorMetadata | undefined => {
	return (validator as ValidatorWithMeta<I, O>)[META]
}

/**
 * Add or update metadata on a validator
 *
 * @example
 * const validator = metadata(pipe(str, email), { description: 'User email' })
 */
export const metadata = <I, O>(
	validator: Validator<I, O>,
	meta: ValidatorMetadata
): Validator<I, O> => {
	const fn = ((value: I) => validator(value)) as ValidatorWithMeta<I, O>

	fn.safe = (value: I): Result<O> => {
		if (validator.safe) return validator.safe(value)
		try {
			return { ok: true, value: validator(value) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	// Copy existing metadata and merge with new
	const existingMeta = getMetadata(validator)
	fn[META] = { ...existingMeta, ...meta }

	return addStandardSchema(fn)
}

/**
 * Add a description to a validator
 *
 * @example
 * const validateEmail = description(pipe(str, email), 'User email address')
 */
export const description = <I, O>(validator: Validator<I, O>, text: string): Validator<I, O> => {
	return metadata(validator, { description: text })
}

/**
 * Add a title to a validator
 *
 * @example
 * const validateEmail = title(pipe(str, email), 'Email')
 */
export const title = <I, O>(validator: Validator<I, O>, text: string): Validator<I, O> => {
	return metadata(validator, { title: text })
}

/**
 * Add a brand to a validator (nominal typing support)
 *
 * @example
 * type Email = string & { __brand: 'Email' }
 * const validateEmail = brand(pipe(str, email), 'Email')
 */
export const brand = <I, O, B extends string>(
	validator: Validator<I, O>,
	brandName: B
): Validator<I, O & { __brand: B }> => {
	const fn = ((value: I) => validator(value)) as ValidatorWithMeta<I, O & { __brand: B }>

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

	// Copy existing metadata and add brand
	const existingMeta = getMetadata(validator)
	fn[META] = { ...existingMeta, brand: brandName }

	return addStandardSchema(fn)
}

/**
 * Add a flavor to a validator (weaker nominal typing)
 *
 * @example
 * type UserId = string & { __flavor?: 'UserId' }
 * const validateUserId = flavor(pipe(str, uuid), 'UserId')
 */
export const flavor = <I, O, F extends string>(
	validator: Validator<I, O>,
	flavorName: F
): Validator<I, O & { __flavor?: F }> => {
	const fn = ((value: I) => validator(value)) as ValidatorWithMeta<I, O & { __flavor?: F }>

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

	// Copy existing metadata and add flavor
	const existingMeta = getMetadata(validator)
	fn[META] = { ...existingMeta, flavor: flavorName }

	return addStandardSchema(fn)
}

/**
 * Make a validator readonly (type-level only, no runtime effect)
 *
 * @example
 * const validateReadonlyUser = readonly(validateUser)
 */
export const readonly = <I, O>(validator: Parser<O>): Parser<Readonly<O>> => {
	const fn = ((value: I) => validator(value as unknown)) as Parser<Readonly<O>>

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

	return addStandardSchema(fn)
}

/**
 * Add examples to a validator
 *
 * @example
 * const validateEmail = examples(pipe(str, email), ['user@example.com', 'admin@domain.org'])
 */
export const examples = <I, O>(validator: Validator<I, O>, exampleValues: O[]): Validator<I, O> => {
	return metadata(validator, { examples: exampleValues })
}

/**
 * Get description from a validator
 */
export const getDescription = <I, O>(validator: Validator<I, O>): string | undefined => {
	return getMetadata(validator)?.description
}

/**
 * Get title from a validator
 */
export const getTitle = <I, O>(validator: Validator<I, O>): string | undefined => {
	return getMetadata(validator)?.title
}

/**
 * Get examples from a validator
 */
export const getExamples = <I, O>(validator: Validator<I, O>): unknown[] | undefined => {
	return getMetadata(validator)?.examples
}
