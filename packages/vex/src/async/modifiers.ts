// ============================================================
// Async Modifier Variants
// ============================================================

import type { Result } from '../core'
import { ValidationError } from '../core'
import type { AsyncParser, AsyncValidator } from './core'

// ============================================================
// Optional Variants
// ============================================================

export const optionalAsync = <I, O>(
	validator: AsyncValidator<I, O>,
): AsyncValidator<I | undefined, O | undefined> => {
	const fn = (async (v: I | undefined) => {
		if (v === undefined) return undefined
		return validator(v)
	}) as AsyncValidator<I | undefined, O | undefined>

	fn.safe = async (v: I | undefined): Promise<Result<O | undefined>> => {
		if (v === undefined) return { ok: true, value: undefined }
		if (validator.safe) return validator.safe(v)
		try {
			return { ok: true, value: await validator(v) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return fn
}

export const nullableAsync = <I, O>(
	validator: AsyncValidator<I, O>,
): AsyncValidator<I | null, O | null> => {
	const fn = (async (v: I | null) => {
		if (v === null) return null
		return validator(v)
	}) as AsyncValidator<I | null, O | null>

	fn.safe = async (v: I | null): Promise<Result<O | null>> => {
		if (v === null) return { ok: true, value: null }
		if (validator.safe) return validator.safe(v)
		try {
			return { ok: true, value: await validator(v) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return fn
}

export const nullishAsync = <I, O>(
	validator: AsyncValidator<I, O>,
): AsyncValidator<I | null | undefined, O | null | undefined> => {
	const fn = (async (v: I | null | undefined) => {
		if (v === null || v === undefined) return v
		return validator(v)
	}) as AsyncValidator<I | null | undefined, O | null | undefined>

	fn.safe = async (v: I | null | undefined): Promise<Result<O | null | undefined>> => {
		if (v === null || v === undefined) return { ok: true, value: v as O | null | undefined }
		if (validator.safe) return validator.safe(v)
		try {
			return { ok: true, value: await validator(v) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return fn
}

export const undefinedableAsync = optionalAsync

export const exactOptionalAsync = <I, O>(
	validator: AsyncValidator<I, O>,
): AsyncValidator<I | undefined, O | undefined> => {
	const fn = (async (v: I | undefined) => {
		if (v === undefined) return undefined
		return validator(v)
	}) as AsyncValidator<I | undefined, O | undefined>

	fn.safe = async (v: I | undefined): Promise<Result<O | undefined>> => {
		if (v === undefined) return { ok: true, value: undefined }
		if (validator.safe) return validator.safe(v)
		try {
			return { ok: true, value: await validator(v) }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return fn
}

// ============================================================
// Non-* Variants
// ============================================================

export const nonNullableAsync = <I, O>(
	validator: AsyncValidator<I | null, O | null>,
): AsyncValidator<I, Exclude<O, null>> => {
	const fn = (async (v: I) => {
		const result = await validator(v)
		if (result === null) throw new ValidationError('Value cannot be null')
		return result as Exclude<O, null>
	}) as AsyncValidator<I, Exclude<O, null>>

	fn.safe = async (v: I): Promise<Result<Exclude<O, null>>> => {
		if (validator.safe) {
			const res = await validator.safe(v)
			if (!res.ok) return res as Result<Exclude<O, null>>
			if (res.value === null) return { ok: false, error: 'Value cannot be null' }
			return { ok: true, value: res.value as Exclude<O, null> }
		}
		try {
			const result = await validator(v)
			if (result === null) return { ok: false, error: 'Value cannot be null' }
			return { ok: true, value: result as Exclude<O, null> }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return fn
}

export const nonNullishAsync = <I, O>(
	validator: AsyncValidator<I | null | undefined, O | null | undefined>,
): AsyncValidator<I, Exclude<O, null | undefined>> => {
	const fn = (async (v: I) => {
		const result = await validator(v)
		if (result === null || result === undefined) {
			throw new ValidationError('Value cannot be null or undefined')
		}
		return result as Exclude<O, null | undefined>
	}) as AsyncValidator<I, Exclude<O, null | undefined>>

	fn.safe = async (v: I): Promise<Result<Exclude<O, null | undefined>>> => {
		if (validator.safe) {
			const res = await validator.safe(v)
			if (!res.ok) return res as Result<Exclude<O, null | undefined>>
			if (res.value === null || res.value === undefined) {
				return { ok: false, error: 'Value cannot be null or undefined' }
			}
			return { ok: true, value: res.value as Exclude<O, null | undefined> }
		}
		try {
			const result = await validator(v)
			if (result === null || result === undefined) {
				return { ok: false, error: 'Value cannot be null or undefined' }
			}
			return { ok: true, value: result as Exclude<O, null | undefined> }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return fn
}

export const nonOptionalAsync = <I, O>(
	validator: AsyncValidator<I | undefined, O | undefined>,
): AsyncValidator<I, Exclude<O, undefined>> => {
	const fn = (async (v: I) => {
		const result = await validator(v)
		if (result === undefined) throw new ValidationError('Value cannot be undefined')
		return result as Exclude<O, undefined>
	}) as AsyncValidator<I, Exclude<O, undefined>>

	fn.safe = async (v: I): Promise<Result<Exclude<O, undefined>>> => {
		if (validator.safe) {
			const res = await validator.safe(v)
			if (!res.ok) return res as Result<Exclude<O, undefined>>
			if (res.value === undefined) return { ok: false, error: 'Value cannot be undefined' }
			return { ok: true, value: res.value as Exclude<O, undefined> }
		}
		try {
			const result = await validator(v)
			if (result === undefined) return { ok: false, error: 'Value cannot be undefined' }
			return { ok: true, value: result as Exclude<O, undefined> }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return fn
}

// ============================================================
// Fallback Async
// ============================================================

export const fallbackAsync = <I, O>(
	validator: AsyncValidator<I, O>,
	fallbackValue: O | (() => O) | (() => Promise<O>),
): AsyncValidator<I, O> => {
	const getFallback = async (): Promise<O> => {
		if (typeof fallbackValue === 'function') {
			return (fallbackValue as () => O | Promise<O>)()
		}
		return fallbackValue
	}

	const fn = (async (v: I) => {
		try {
			return await validator(v)
		} catch {
			return getFallback()
		}
	}) as AsyncValidator<I, O>

	fn.safe = async (v: I): Promise<Result<O>> => {
		if (validator.safe) {
			const res = await validator.safe(v)
			if (!res.ok) return { ok: true, value: await getFallback() }
			return res
		}
		try {
			return { ok: true, value: await validator(v) }
		} catch {
			return { ok: true, value: await getFallback() }
		}
	}

	return fn
}

// ============================================================
// Partial/Required Async
// ============================================================

export const partialAsync = <T extends Record<string, unknown>>(
	schema: AsyncParser<T>,
): AsyncParser<Partial<T>> => {
	const fn = (async (value: unknown) => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			throw new ValidationError('Expected object')
		}
		if (schema.safe) {
			const result = await schema.safe(value)
			if (result.ok) return result.value
		}
		return value as Partial<T>
	}) as AsyncParser<Partial<T>>

	fn.safe = async (value: unknown): Promise<Result<Partial<T>>> => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return { ok: false, error: 'Expected object' }
		}
		return { ok: true, value: value as Partial<T> }
	}

	return fn
}

export const requiredAsync = <T extends Record<string, unknown>>(
	schema: AsyncParser<Partial<T>>,
): AsyncParser<Required<T>> => {
	const fn = (async (value: unknown) => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			throw new ValidationError('Expected object')
		}
		const result = (await schema(value)) as Record<string, unknown>
		for (const [key, val] of Object.entries(result)) {
			if (val === undefined) {
				throw new ValidationError(`${key}: Required`)
			}
		}
		return result as Required<T>
	}) as AsyncParser<Required<T>>

	fn.safe = async (value: unknown): Promise<Result<Required<T>>> => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return { ok: false, error: 'Expected object' }
		}
		if (schema.safe) {
			const res = await schema.safe(value)
			if (!res.ok) return res as Result<Required<T>>
			for (const [key, val] of Object.entries(res.value as Record<string, unknown>)) {
				if (val === undefined) {
					return { ok: false, error: `${key}: Required` }
				}
			}
			return { ok: true, value: res.value as Required<T> }
		}
		try {
			const result = (await schema(value)) as Record<string, unknown>
			for (const [key, val] of Object.entries(result)) {
				if (val === undefined) {
					return { ok: false, error: `${key}: Required` }
				}
			}
			return { ok: true, value: result as Required<T> }
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
		}
	}

	return fn
}
