// ============================================================
// 🧘 Zen Functional API - Direct validator functions
// ============================================================
//
// This module provides a pure functional approach to validation:
// - No objects, just functions
// - Compose validators with pipe()
// - Zero overhead, maximum performance
//
// Usage:
//   import { str, num, pipe, min, max, email } from '@sylphx/zen-full/fn'
//
//   const validateEmail = pipe(str, email)
//   const validateAge = pipe(num, int, min(0), max(150))
//
//   validateEmail('test@example.com') // 'test@example.com'
//   validateEmail(123) // throws
//
// ============================================================

// ============================================================
// Core Types
// ============================================================

/** A validator function that returns the value or throws */
export type Validator<I, O = I> = (value: I) => O

/** A validator that accepts unknown input */
export type Parser<O> = Validator<unknown, O>

/** Validation error */
export class ValidationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ValidationError'
	}
}

// ============================================================
// Type Validators (Parsers)
// ============================================================

/** Validate string type */
export const str: Parser<string> = (v) => {
	if (typeof v !== 'string') throw new ValidationError('Expected string')
	return v
}

/** Validate number type */
export const num: Parser<number> = (v) => {
	if (typeof v !== 'number' || Number.isNaN(v)) throw new ValidationError('Expected number')
	return v
}

/** Validate boolean type */
export const bool: Parser<boolean> = (v) => {
	if (typeof v !== 'boolean') throw new ValidationError('Expected boolean')
	return v
}

/** Validate bigint type */
export const bigInt: Parser<bigint> = (v) => {
	if (typeof v !== 'bigint') throw new ValidationError('Expected bigint')
	return v
}

/** Validate Date type */
export const date: Parser<Date> = (v) => {
	if (!(v instanceof Date) || Number.isNaN(v.getTime())) throw new ValidationError('Expected Date')
	return v
}

/** Validate array type */
export const arr: Parser<unknown[]> = (v) => {
	if (!Array.isArray(v)) throw new ValidationError('Expected array')
	return v
}

/** Validate object type (not null, not array) */
export const obj: Parser<Record<string, unknown>> = (v) => {
	if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new ValidationError('Expected object')
	return v as Record<string, unknown>
}

// ============================================================
// String Validators
// ============================================================

/** Minimum length */
export const min = (n: number): Validator<string> => (v) => {
	if (v.length < n) throw new ValidationError(`Min ${n} chars`)
	return v
}

/** Maximum length */
export const max = (n: number): Validator<string> => (v) => {
	if (v.length > n) throw new ValidationError(`Max ${n} chars`)
	return v
}

/** Exact length */
export const len = (n: number): Validator<string> => (v) => {
	if (v.length !== n) throw new ValidationError(`Must be ${n} chars`)
	return v
}

/** Non-empty string */
export const nonempty: Validator<string> = (v) => {
	if (v.length === 0) throw new ValidationError('Required')
	return v
}

/** Email format */
export const email: Validator<string> = (v) => {
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new ValidationError('Invalid email')
	return v
}

/** URL format */
export const url: Validator<string> = (v) => {
	if (!/^https?:\/\/.+/.test(v)) throw new ValidationError('Invalid URL')
	return v
}

/** UUID format */
export const uuid: Validator<string> = (v) => {
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)) {
		throw new ValidationError('Invalid UUID')
	}
	return v
}

/** Regex pattern */
export const pattern = (re: RegExp, msg = 'Invalid format'): Validator<string> => (v) => {
	if (!re.test(v)) throw new ValidationError(msg)
	return v
}

/** Starts with prefix */
export const startsWith = (prefix: string): Validator<string> => (v) => {
	if (!v.startsWith(prefix)) throw new ValidationError(`Must start with "${prefix}"`)
	return v
}

/** Ends with suffix */
export const endsWith = (suffix: string): Validator<string> => (v) => {
	if (!v.endsWith(suffix)) throw new ValidationError(`Must end with "${suffix}"`)
	return v
}

/** Contains substring */
export const includes = (search: string): Validator<string> => (v) => {
	if (!v.includes(search)) throw new ValidationError(`Must include "${search}"`)
	return v
}

// ============================================================
// Number Validators
// ============================================================

/** Integer check */
export const int: Validator<number> = (v) => {
	if (!Number.isInteger(v)) throw new ValidationError('Must be integer')
	return v
}

/** Positive number (> 0) */
export const positive: Validator<number> = (v) => {
	if (v <= 0) throw new ValidationError('Must be positive')
	return v
}

/** Negative number (< 0) */
export const negative: Validator<number> = (v) => {
	if (v >= 0) throw new ValidationError('Must be negative')
	return v
}

/** Finite number */
export const finite: Validator<number> = (v) => {
	if (!Number.isFinite(v)) throw new ValidationError('Must be finite')
	return v
}

/** Minimum value */
export const gte = (n: number): Validator<number> => (v) => {
	if (v < n) throw new ValidationError(`Min ${n}`)
	return v
}

/** Maximum value */
export const lte = (n: number): Validator<number> => (v) => {
	if (v > n) throw new ValidationError(`Max ${n}`)
	return v
}

/** Greater than */
export const gt = (n: number): Validator<number> => (v) => {
	if (v <= n) throw new ValidationError(`Must be > ${n}`)
	return v
}

/** Less than */
export const lt = (n: number): Validator<number> => (v) => {
	if (v >= n) throw new ValidationError(`Must be < ${n}`)
	return v
}

/** Multiple of */
export const multipleOf = (n: number): Validator<number> => (v) => {
	if (v % n !== 0) throw new ValidationError(`Must be multiple of ${n}`)
	return v
}

// ============================================================
// Composition
// ============================================================

/**
 * Pipe validators together (left to right)
 *
 * @example
 * const validateEmail = pipe(str, email)
 * const validateAge = pipe(num, int, gte(0), lte(150))
 */
export function pipe<A, B>(v1: Validator<A, B>): Validator<A, B>
export function pipe<A, B, C>(v1: Validator<A, B>, v2: Validator<B, C>): Validator<A, C>
export function pipe<A, B, C, D>(v1: Validator<A, B>, v2: Validator<B, C>, v3: Validator<C, D>): Validator<A, D>
export function pipe<A, B, C, D, E>(v1: Validator<A, B>, v2: Validator<B, C>, v3: Validator<C, D>, v4: Validator<D, E>): Validator<A, E>
export function pipe<A, B, C, D, E, F>(v1: Validator<A, B>, v2: Validator<B, C>, v3: Validator<C, D>, v4: Validator<D, E>, v5: Validator<E, F>): Validator<A, F>
export function pipe(...validators: Validator<unknown, unknown>[]): Validator<unknown, unknown> {
	return (value: unknown) => {
		let result = value
		for (const v of validators) {
			result = v(result)
		}
		return result
	}
}

/**
 * Try to validate, return null on error
 */
export const tryParse = <I, O>(validator: Validator<I, O>) => (value: I): O | null => {
	try {
		return validator(value)
	} catch {
		return null
	}
}

/**
 * Try to validate, return result object
 */
export const safeParse = <I, O>(validator: Validator<I, O>) => (value: I): { success: true; data: O } | { success: false; error: string } => {
	try {
		return { success: true, data: validator(value) }
	} catch (e) {
		return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
	}
}

/**
 * Make a validator optional (allows undefined)
 */
export const optional = <I, O>(validator: Validator<I, O>): Validator<I | undefined, O | undefined> => (v) => {
	if (v === undefined) return undefined
	return validator(v)
}

/**
 * Make a validator nullable (allows null)
 */
export const nullable = <I, O>(validator: Validator<I, O>): Validator<I | null, O | null> => (v) => {
	if (v === null) return null
	return validator(v)
}

/**
 * Provide a default value
 */
export const withDefault = <I, O>(validator: Validator<I, O>, defaultValue: O): Validator<I | undefined, O> => (v) => {
	if (v === undefined) return defaultValue
	return validator(v)
}

// ============================================================
// Object Validation
// ============================================================

type Shape<T> = { [K in keyof T]: Parser<T[K]> }

/**
 * Create an object validator from a shape
 *
 * @example
 * const validateUser = object({
 *   name: pipe(str, nonempty),
 *   age: pipe(num, int, gte(0)),
 *   email: pipe(str, email),
 * })
 */
export const object = <T extends Record<string, unknown>>(shape: Shape<T>): Parser<T> => {
	const entries = Object.entries(shape) as [keyof T, Parser<unknown>][]

	return (value: unknown) => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			throw new ValidationError('Expected object')
		}

		const input = value as Record<string, unknown>
		const result = {} as T

		for (const [key, validator] of entries) {
			try {
				result[key] = validator(input[key as string]) as T[keyof T]
			} catch (e) {
				if (e instanceof ValidationError) {
					throw new ValidationError(`${String(key)}: ${e.message}`)
				}
				throw e
			}
		}

		return result
	}
}

/**
 * Create an array validator
 *
 * @example
 * const validateNumbers = array(pipe(num, int))
 */
export const array = <T>(itemValidator: Parser<T>): Parser<T[]> => (value: unknown) => {
	if (!Array.isArray(value)) throw new ValidationError('Expected array')

	return value.map((item, i) => {
		try {
			return itemValidator(item)
		} catch (e) {
			if (e instanceof ValidationError) {
				throw new ValidationError(`[${i}]: ${e.message}`)
			}
			throw e
		}
	})
}

// ============================================================
// Transforms
// ============================================================

/** Trim whitespace */
export const trim: Validator<string> = (v) => v.trim()

/** To lowercase */
export const lower: Validator<string> = (v) => v.toLowerCase()

/** To uppercase */
export const upper: Validator<string> = (v) => v.toUpperCase()

/** Parse to integer */
export const toInt: Validator<string, number> = (v) => {
	const n = Number.parseInt(v, 10)
	if (Number.isNaN(n)) throw new ValidationError('Invalid integer')
	return n
}

/** Parse to float */
export const toFloat: Validator<string, number> = (v) => {
	const n = Number.parseFloat(v)
	if (Number.isNaN(n)) throw new ValidationError('Invalid number')
	return n
}

/** Parse to Date */
export const toDate: Validator<string, Date> = (v) => {
	const d = new Date(v)
	if (Number.isNaN(d.getTime())) throw new ValidationError('Invalid date')
	return d
}
