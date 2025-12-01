// ============================================================
// Async Core Types and Helpers
// ============================================================

import type { Result } from '../core'
import { ValidationError } from '../core'

/** Async parser function type */
export type AsyncParser<T> = {
	(value: unknown): Promise<T>
	safe?: (value: unknown) => Promise<Result<T>>
}

/** Async validator function type */
export type AsyncValidator<I, O = I> = {
	(value: I): Promise<O>
	safe?: (value: I) => Promise<Result<O>>
}

/** Create an async validator with both throwing and safe versions */
export const createAsyncValidator = <I, O>(
	parse: (value: I) => Promise<O>,
	safeParse: (value: I) => Promise<Result<O>>,
): AsyncValidator<I, O> => {
	const fn = parse as AsyncValidator<I, O>
	fn.safe = safeParse
	return fn
}

/** Pre-allocated async error results */
export const asyncErr = (message: string): Promise<Result<never>> =>
	Promise.resolve({ ok: false, error: message })

export const asyncOk = <T>(value: T): Promise<Result<T>> => Promise.resolve({ ok: true, value })

export { ValidationError }
