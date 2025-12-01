// ============================================================
// Collection Actions (for arrays)
// ============================================================

import type { Result, Validator } from '../core'
import { addStandardSchema, ValidationError } from '../core'

/**
 * Check if all items pass a predicate
 *
 * @example
 * const allPositive = pipe(array(num), everyItem((n) => n > 0, 'All items must be positive'))
 */
export const everyItem = <T>(
	check: (item: T, index: number) => boolean,
	message = 'Not all items passed validation',
): Validator<T[], T[]> => {
	const err: Result<never> = { ok: false, error: message }
	const fn = ((v: T[]) => {
		if (!v.every(check)) throw new ValidationError(message)
		return v
	}) as Validator<T[], T[]>

	fn.safe = (v: T[]): Result<T[]> => (v.every(check) ? { ok: true, value: v } : err)

	return addStandardSchema(fn)
}

/**
 * Check if at least one item passes a predicate
 *
 * @example
 * const hasPositive = pipe(array(num), someItem((n) => n > 0, 'At least one item must be positive'))
 */
export const someItem = <T>(
	check: (item: T, index: number) => boolean,
	message = 'No items passed validation',
): Validator<T[], T[]> => {
	const err: Result<never> = { ok: false, error: message }
	const fn = ((v: T[]) => {
		if (!v.some(check)) throw new ValidationError(message)
		return v
	}) as Validator<T[], T[]>

	fn.safe = (v: T[]): Result<T[]> => (v.some(check) ? { ok: true, value: v } : err)

	return addStandardSchema(fn)
}

/**
 * Check items with a custom validation function
 *
 * @example
 * const validateItems = pipe(array(num), checkItems((items) => items.length > 0 && items[0] === 1))
 */
export const checkItems = <T>(
	check: (items: T[]) => boolean,
	message = 'Items validation failed',
): Validator<T[], T[]> => {
	const err: Result<never> = { ok: false, error: message }
	const fn = ((v: T[]) => {
		if (!check(v)) throw new ValidationError(message)
		return v
	}) as Validator<T[], T[]>

	fn.safe = (v: T[]): Result<T[]> => (check(v) ? { ok: true, value: v } : err)

	return addStandardSchema(fn)
}

/**
 * Filter items by a predicate (transform)
 *
 * @example
 * const onlyPositive = pipe(array(num), filterItems((n) => n > 0))
 */
export const filterItems = <T>(
	predicate: (item: T, index: number) => boolean,
): Validator<T[], T[]> => {
	const fn = ((v: T[]) => v.filter(predicate)) as Validator<T[], T[]>

	fn.safe = (v: T[]): Result<T[]> => ({ ok: true, value: v.filter(predicate) })

	return addStandardSchema(fn)
}

/**
 * Find first item matching predicate (transform to single item or undefined)
 *
 * @example
 * const findFirst = pipe(array(num), findItem((n) => n > 0))
 */
export const findItem = <T>(
	predicate: (item: T, index: number) => boolean,
): Validator<T[], T | undefined> => {
	const fn = ((v: T[]) => v.find(predicate)) as Validator<T[], T | undefined>

	fn.safe = (v: T[]): Result<T | undefined> => ({ ok: true, value: v.find(predicate) })

	return addStandardSchema(fn)
}

/**
 * Map items (transform)
 *
 * @example
 * const doubled = pipe(array(num), mapItems((n) => n * 2))
 */
export const mapItems = <T, U>(mapper: (item: T, index: number) => U): Validator<T[], U[]> => {
	const fn = ((v: T[]) => v.map(mapper)) as Validator<T[], U[]>

	fn.safe = (v: T[]): Result<U[]> => ({ ok: true, value: v.map(mapper) })

	return addStandardSchema(fn)
}

/**
 * Reduce items (transform)
 *
 * @example
 * const sum = pipe(array(num), reduceItems((acc, n) => acc + n, 0))
 */
export const reduceItems = <T, U>(
	reducer: (acc: U, item: T, index: number) => U,
	initial: U,
): Validator<T[], U> => {
	const fn = ((v: T[]) => v.reduce(reducer, initial)) as Validator<T[], U>

	fn.safe = (v: T[]): Result<U> => ({ ok: true, value: v.reduce(reducer, initial) })

	return addStandardSchema(fn)
}

/**
 * Sort items (transform)
 *
 * @example
 * const sorted = pipe(array(num), sortItems((a, b) => a - b))
 */
export const sortItems = <T>(compareFn?: (a: T, b: T) => number): Validator<T[], T[]> => {
	const fn = ((v: T[]) => [...v].sort(compareFn)) as Validator<T[], T[]>

	fn.safe = (v: T[]): Result<T[]> => ({ ok: true, value: [...v].sort(compareFn) })

	return addStandardSchema(fn)
}

/**
 * Check that array excludes certain values
 *
 * @example
 * const noZeros = pipe(array(num), excludes([0], 'Array must not contain zeros'))
 */
export const excludes = <T>(
	values: T[],
	message = 'Array contains excluded values',
): Validator<T[], T[]> => {
	const valuesSet = new Set(values)
	const err: Result<never> = { ok: false, error: message }
	const fn = ((v: T[]) => {
		if (v.some((item) => valuesSet.has(item))) throw new ValidationError(message)
		return v
	}) as Validator<T[], T[]>

	fn.safe = (v: T[]): Result<T[]> =>
		v.some((item) => valuesSet.has(item)) ? err : { ok: true, value: v }

	return addStandardSchema(fn)
}

/**
 * Validate entries count (for objects/maps)
 *
 * @example
 * const exactEntries = pipe(record(str, num), entries(3))
 */
export const entries = (n: number): Validator<Record<string, unknown>, Record<string, unknown>> => {
	const msg = `Must have exactly ${n} entries`
	const err: Result<never> = { ok: false, error: msg }
	const fn = ((v: Record<string, unknown>) => {
		if (Object.keys(v).length !== n) throw new ValidationError(msg)
		return v
	}) as Validator<Record<string, unknown>, Record<string, unknown>>

	fn.safe = (v: Record<string, unknown>): Result<Record<string, unknown>> =>
		Object.keys(v).length === n ? { ok: true, value: v } : err

	return addStandardSchema(fn)
}

/**
 * Validate minimum entries count
 */
export const minEntries = (
	n: number,
): Validator<Record<string, unknown>, Record<string, unknown>> => {
	const msg = `Must have at least ${n} entries`
	const err: Result<never> = { ok: false, error: msg }
	const fn = ((v: Record<string, unknown>) => {
		if (Object.keys(v).length < n) throw new ValidationError(msg)
		return v
	}) as Validator<Record<string, unknown>, Record<string, unknown>>

	fn.safe = (v: Record<string, unknown>): Result<Record<string, unknown>> =>
		Object.keys(v).length >= n ? { ok: true, value: v } : err

	return addStandardSchema(fn)
}

/**
 * Validate maximum entries count
 */
export const maxEntries = (
	n: number,
): Validator<Record<string, unknown>, Record<string, unknown>> => {
	const msg = `Must have at most ${n} entries`
	const err: Result<never> = { ok: false, error: msg }
	const fn = ((v: Record<string, unknown>) => {
		if (Object.keys(v).length > n) throw new ValidationError(msg)
		return v
	}) as Validator<Record<string, unknown>, Record<string, unknown>>

	fn.safe = (v: Record<string, unknown>): Result<Record<string, unknown>> =>
		Object.keys(v).length <= n ? { ok: true, value: v } : err

	return addStandardSchema(fn)
}

/**
 * Validate entries count is not n
 */
export const notEntries = (
	n: number,
): Validator<Record<string, unknown>, Record<string, unknown>> => {
	const msg = `Must not have ${n} entries`
	const err: Result<never> = { ok: false, error: msg }
	const fn = ((v: Record<string, unknown>) => {
		if (Object.keys(v).length === n) throw new ValidationError(msg)
		return v
	}) as Validator<Record<string, unknown>, Record<string, unknown>>

	fn.safe = (v: Record<string, unknown>): Result<Record<string, unknown>> =>
		Object.keys(v).length !== n ? { ok: true, value: v } : err

	return addStandardSchema(fn)
}
