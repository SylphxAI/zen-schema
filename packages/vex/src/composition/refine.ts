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

// ============================================================
// Advanced Transform Functions (Zod Parity)
// ============================================================

/**
 * Transform input BEFORE validation (preprocess)
 *
 * Unlike `transform` which runs after validation, `preprocess` runs before.
 * This is useful for coercing or cleaning data before type validation.
 *
 * @example
 * // Trim and validate
 * const trimmedStr = preprocess((v) => String(v).trim(), str(nonempty))
 * trimmedStr('  hello  ') // 'hello'
 * trimmedStr('   ')       // Error: nonempty
 *
 * @example
 * // Coerce to number then validate
 * const coercedNum = preprocess((v) => Number(v), num(positive))
 * coercedNum('123')  // 123
 * coercedNum('-5')   // Error: must be positive
 */
export const preprocess = <I, O>(
	preprocessFn: (value: unknown) => I,
	validator: Validator<I, O>,
): Validator<unknown, O> => {
	const fn = ((value: unknown) => {
		const preprocessed = preprocessFn(value)
		return validator(preprocessed)
	}) as Validator<unknown, O>

	fn.safe = (value: unknown): Result<O> => {
		try {
			const preprocessed = preprocessFn(value)
			if (validator.safe) {
				return validator.safe(preprocessed)
			}
			return { ok: true, value: validator(preprocessed) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Preprocess failed' }
		}
	}

	return addStandardSchema(fn)
}

/**
 * Standalone transform schema - accepts any input and transforms it
 *
 * Unlike `transform(validator, fn)` which requires a validator first,
 * `to(fn)` accepts any input and transforms it directly.
 *
 * @example
 * // Convert anything to string
 * const toString = to((v) => String(v))
 * toString(123)     // '123'
 * toString(true)    // 'true'
 * toString(null)    // 'null'
 *
 * @example
 * // Parse JSON
 * const parseJson = to((v) => JSON.parse(v as string))
 * parseJson('{"a":1}')  // { a: 1 }
 *
 * @example
 * // With validation after transform
 * const toPositiveNum = pipe(to(Number), num(positive))
 */
export const to = <O>(transformFn: (value: unknown) => O): Validator<unknown, O> => {
	const fn = ((value: unknown) => {
		return transformFn(value)
	}) as Validator<unknown, O>

	fn.safe = (value: unknown): Result<O> => {
		try {
			return { ok: true, value: transformFn(value) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Transform failed' }
		}
	}

	return addStandardSchema(fn)
}

/**
 * Type-preserving transform (overwrite)
 *
 * Like `transform`, but guarantees the output type matches input type.
 * Useful for mutations that don't change the type (trim, normalize, etc.)
 *
 * @example
 * const normalized = pipe(str(), overwrite((s) => s.trim().toLowerCase()))
 * normalized('  HELLO  ')  // 'hello'
 *
 * @example
 * const clamped = pipe(num(), overwrite((n) => Math.max(0, Math.min(100, n))))
 * clamped(150)  // 100
 * clamped(-10)  // 0
 */
export const overwrite = <T>(transformFn: (value: T) => T): Validator<T, T> => {
	const fn = ((value: T) => {
		return transformFn(value)
	}) as Validator<T, T>

	fn.safe = (value: T): Result<T> => {
		try {
			return { ok: true, value: transformFn(value) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Overwrite failed' }
		}
	}

	return addStandardSchema(fn)
}

/**
 * Bi-directional codec for encode/decode transformations
 *
 * A codec defines both directions of a transformation:
 * - decode: transform input to output (used during parse)
 * - encode: transform output back to input (used for serialization)
 *
 * @example
 * const dateCodec = codec(str(datetime), {
 *   decode: (s) => new Date(s),
 *   encode: (d) => d.toISOString(),
 * })
 *
 * // Parsing (decode)
 * const date = dateCodec.parse('2024-01-15T00:00:00Z')  // Date object
 *
 * // Serializing (encode)
 * const str = dateCodec.encode(new Date())  // ISO string
 *
 * @example
 * const base64Codec = codec(str(), {
 *   decode: (s) => Buffer.from(s, 'base64'),
 *   encode: (b) => b.toString('base64'),
 * })
 */
export interface Codec<I, M, O> extends Validator<I, O> {
	/** Encode output back to the intermediate/serializable form */
	encode: (value: O) => M
	/** The underlying validator for the intermediate type */
	schema: Validator<I, M>
}

export const codec = <I, M, O>(
	validator: Validator<I, M>,
	options: {
		decode: (value: M) => O
		encode: (value: O) => M
	},
): Codec<I, M, O> => {
	const { decode, encode } = options

	const fn = ((value: I) => {
		const validated = validator(value)
		return decode(validated)
	}) as Codec<I, M, O>

	fn.safe = (value: I): Result<O> => {
		if (validator.safe) {
			const r = validator.safe(value)
			if (!r.ok) return r as Result<O>
			try {
				return { ok: true, value: decode(r.value) }
			} catch (e) {
				return { ok: false, error: e instanceof Error ? e.message : 'Decode failed' }
			}
		}
		try {
			const validated = validator(value)
			return { ok: true, value: decode(validated) }
		} catch (e) {
			return { ok: false, error: getErrorMsg(e) }
		}
	}

	fn.encode = encode
	fn.schema = validator

	return addStandardSchema(fn) as Codec<I, M, O>
}

/**
 * Create a transform that can fail with validation errors
 *
 * Like `to()` but with access to an error context for reporting issues.
 * Use this when the transform might fail and you want proper error handling.
 *
 * @example
 * const parseDate = tryTransform((value, ctx) => {
 *   const date = new Date(value as string)
 *   if (isNaN(date.getTime())) {
 *     ctx.fail('Invalid date format')
 *   }
 *   return date
 * })
 *
 * @example
 * const fetchUser = tryTransform(async (id, ctx) => {
 *   const user = await db.findUser(id)
 *   if (!user) {
 *     ctx.fail(`User ${id} not found`)
 *   }
 *   return user
 * })
 */
export const tryTransform = <I, O>(
	transformFn: (value: I, ctx: { fail: (message: string) => void }) => O,
): Validator<I, O> => {
	const fn = ((value: I) => {
		let error: string | null = null
		const ctx = {
			fail: (message: string) => {
				error = message
			},
		}
		const result = transformFn(value, ctx)
		if (error) throw new ValidationError(error)
		return result
	}) as Validator<I, O>

	fn.safe = (value: I): Result<O> => {
		let error: string | null = null
		const ctx = {
			fail: (message: string) => {
				error = message
			},
		}
		try {
			const result = transformFn(value, ctx)
			if (error) return { ok: false, error }
			return { ok: true, value: result }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Transform failed' }
		}
	}

	return addStandardSchema(fn)
}
