import { describe, expect, test } from 'bun:test'
import { createAsyncValidator } from './core'
import {
	exactOptionalAsync,
	fallbackAsync,
	nonNullableAsync,
	nonNullishAsync,
	nonOptionalAsync,
	nullableAsync,
	nullishAsync,
	optionalAsync,
	partialAsync,
	requiredAsync,
	undefinedableAsync,
} from './modifiers'

const strAsync = createAsyncValidator(
	async (v: unknown) => {
		if (typeof v !== 'string') throw new Error('Expected string')
		return v
	},
	async (v: unknown) => {
		if (typeof v !== 'string') return { ok: false, error: 'Expected string' }
		return { ok: true, value: v }
	},
)

describe('async/modifiers', () => {
	describe('optionalAsync', () => {
		test('passes undefined through', async () => {
			const validator = optionalAsync(strAsync)
			expect(await validator(undefined)).toBe(undefined)
		})

		test('validates defined value', async () => {
			const validator = optionalAsync(strAsync)
			expect(await validator('hello')).toBe('hello')
		})

		test('safe version with undefined', async () => {
			const validator = optionalAsync(strAsync)
			expect(await validator.safe!(undefined)).toEqual({ ok: true, value: undefined })
		})

		test('safe version with valid value', async () => {
			const validator = optionalAsync(strAsync)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})

		test('safe version with invalid value', async () => {
			const validator = optionalAsync(strAsync)
			expect(await validator.safe!(123)).toEqual({ ok: false, error: 'Expected string' })
		})

		test('safe falls back to try-catch when no safe method', async () => {
			const noSafe = async (v: string) => v.toUpperCase()
			const validator = optionalAsync(noSafe as any)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'HELLO' })
		})

		test('safe handles error in try-catch fallback', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Must be string')
				return v
			}
			const validator = optionalAsync(noSafe as any)
			expect(await validator.safe!(123)).toEqual({ ok: false, error: 'Must be string' })
		})

		test('safe handles non-Error exception', async () => {
			const throwsNonError = async () => {
				throw 'string error'
			}
			const validator = optionalAsync(throwsNonError as any)
			expect(await validator.safe!('anything')).toEqual({ ok: false, error: 'Unknown error' })
		})
	})

	describe('nullableAsync', () => {
		test('passes null through', async () => {
			const validator = nullableAsync(strAsync)
			expect(await validator(null)).toBe(null)
		})

		test('validates non-null value', async () => {
			const validator = nullableAsync(strAsync)
			expect(await validator('hello')).toBe('hello')
		})

		test('safe version with null', async () => {
			const validator = nullableAsync(strAsync)
			expect(await validator.safe!(null)).toEqual({ ok: true, value: null })
		})

		test('safe version with valid value', async () => {
			const validator = nullableAsync(strAsync)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: string) => v.toUpperCase()
			const validator = nullableAsync(noSafe as any)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'HELLO' })
		})

		test('safe handles error in try-catch fallback', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Must be string')
				return v
			}
			const validator = nullableAsync(noSafe as any)
			expect(await validator.safe!(123)).toEqual({ ok: false, error: 'Must be string' })
		})

		test('safe handles non-Error exception', async () => {
			const throwsNonError = async () => {
				throw 'string error'
			}
			const validator = nullableAsync(throwsNonError as any)
			expect(await validator.safe!('anything')).toEqual({ ok: false, error: 'Unknown error' })
		})
	})

	describe('nullishAsync', () => {
		test('passes null through', async () => {
			const validator = nullishAsync(strAsync)
			expect(await validator(null)).toBe(null)
		})

		test('passes undefined through', async () => {
			const validator = nullishAsync(strAsync)
			expect(await validator(undefined)).toBe(undefined)
		})

		test('validates non-nullish value', async () => {
			const validator = nullishAsync(strAsync)
			expect(await validator('hello')).toBe('hello')
		})

		test('safe version with null', async () => {
			const validator = nullishAsync(strAsync)
			expect(await validator.safe!(null)).toEqual({ ok: true, value: null })
		})

		test('safe version with undefined', async () => {
			const validator = nullishAsync(strAsync)
			expect(await validator.safe!(undefined)).toEqual({ ok: true, value: undefined })
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: string) => v.toUpperCase()
			const validator = nullishAsync(noSafe as any)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'HELLO' })
		})

		test('safe handles error in try-catch fallback', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Must be string')
				return v
			}
			const validator = nullishAsync(noSafe as any)
			expect(await validator.safe!(123)).toEqual({ ok: false, error: 'Must be string' })
		})

		test('safe handles non-Error exception', async () => {
			const throwsNonError = async () => {
				throw 'string error'
			}
			const validator = nullishAsync(throwsNonError as any)
			expect(await validator.safe!('anything')).toEqual({ ok: false, error: 'Unknown error' })
		})
	})

	describe('undefinedableAsync', () => {
		test('is alias for optionalAsync', () => {
			expect(undefinedableAsync).toBe(optionalAsync)
		})
	})

	describe('exactOptionalAsync', () => {
		test('passes undefined through', async () => {
			const validator = exactOptionalAsync(strAsync)
			expect(await validator(undefined)).toBe(undefined)
		})

		test('validates defined value', async () => {
			const validator = exactOptionalAsync(strAsync)
			expect(await validator('hello')).toBe('hello')
		})

		test('safe version works', async () => {
			const validator = exactOptionalAsync(strAsync)
			expect(await validator.safe!(undefined)).toEqual({ ok: true, value: undefined })
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: string) => v.toUpperCase()
			const validator = exactOptionalAsync(noSafe as any)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'HELLO' })
		})

		test('safe handles error in try-catch fallback', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Must be string')
				return v
			}
			const validator = exactOptionalAsync(noSafe as any)
			expect(await validator.safe!(123)).toEqual({ ok: false, error: 'Must be string' })
		})

		test('safe handles non-Error exception', async () => {
			const throwsNonError = async () => {
				throw 'string error'
			}
			const validator = exactOptionalAsync(throwsNonError as any)
			expect(await validator.safe!('anything')).toEqual({ ok: false, error: 'Unknown error' })
		})
	})

	describe('nonNullableAsync', () => {
		test('throws on null result', async () => {
			const maybeNull = createAsyncValidator(
				async (v: unknown) => (v === 'null' ? null : (v as string)),
				async (v: unknown) => ({ ok: true, value: v === 'null' ? null : (v as string) }),
			)
			const validator = nonNullableAsync(maybeNull)
			await expect(validator('null')).rejects.toThrow('Value cannot be null')
		})

		test('passes non-null value', async () => {
			const maybeNull = createAsyncValidator(
				async (v: unknown) => v as string,
				async (v: unknown) => ({ ok: true, value: v as string }),
			)
			const validator = nonNullableAsync(maybeNull)
			expect(await validator('hello')).toBe('hello')
		})

		test('safe version returns error on null', async () => {
			const maybeNull = createAsyncValidator(
				async (v: unknown) => (v === 'null' ? null : (v as string)),
				async (v: unknown) => ({ ok: true, value: v === 'null' ? null : (v as string) }),
			)
			const validator = nonNullableAsync(maybeNull)
			expect(await validator.safe!('null')).toEqual({
				ok: false,
				error: 'Value cannot be null',
			})
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: string) => (v === 'null' ? null : v)
			const validator = nonNullableAsync(noSafe as any)
			expect(await validator.safe!('null')).toEqual({
				ok: false,
				error: 'Value cannot be null',
			})
		})

		test('safe try-catch with valid value', async () => {
			const noSafe = async (v: string) => v
			const validator = nonNullableAsync(noSafe as any)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})

		test('safe handles non-Error exception', async () => {
			const throwsNonError = async () => {
				throw 'string error'
			}
			const validator = nonNullableAsync(throwsNonError as any)
			expect(await validator.safe!('anything')).toEqual({ ok: false, error: 'Unknown error' })
		})

		test('safe passes through underlying error', async () => {
			const failing = createAsyncValidator(
				async () => {
					throw new Error('fail')
				},
				async () => ({ ok: false, error: 'fail' }),
			)
			const validator = nonNullableAsync(failing)
			expect(await validator.safe!('test')).toEqual({ ok: false, error: 'fail' })
		})

		test('safe returns success when validator.safe passes with non-null value', async () => {
			const maybeNull = createAsyncValidator(
				async (v: unknown) => v as string,
				async (v: unknown) => ({ ok: true, value: v as string }),
			)
			const validator = nonNullableAsync(maybeNull)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})
	})

	describe('nonNullishAsync', () => {
		test('throws on null result', async () => {
			const maybeNull = createAsyncValidator(
				async (v: unknown) => (v === 'null' ? null : (v as string)),
				async (v: unknown) => ({ ok: true, value: v === 'null' ? null : (v as string) }),
			)
			const validator = nonNullishAsync(maybeNull)
			await expect(validator('null')).rejects.toThrow('Value cannot be null or undefined')
		})

		test('throws on undefined result', async () => {
			const maybeUndef = createAsyncValidator(
				async (v: unknown) => (v === 'undef' ? undefined : (v as string)),
				async (v: unknown) => ({ ok: true, value: v === 'undef' ? undefined : (v as string) }),
			)
			const validator = nonNullishAsync(maybeUndef)
			await expect(validator('undef')).rejects.toThrow('Value cannot be null or undefined')
		})

		test('passes valid value', async () => {
			const validator = nonNullishAsync(strAsync as any)
			expect(await validator('hello')).toBe('hello')
		})

		test('safe version returns error', async () => {
			const maybeNull = createAsyncValidator(
				async (v: unknown) => (v === 'null' ? null : (v as string)),
				async (v: unknown) => ({ ok: true, value: v === 'null' ? null : (v as string) }),
			)
			const validator = nonNullishAsync(maybeNull)
			expect(await validator.safe!('null')).toEqual({
				ok: false,
				error: 'Value cannot be null or undefined',
			})
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: string) => (v === 'null' ? null : v)
			const validator = nonNullishAsync(noSafe as any)
			expect(await validator.safe!('null')).toEqual({
				ok: false,
				error: 'Value cannot be null or undefined',
			})
		})

		test('safe try-catch with valid value', async () => {
			const noSafe = async (v: string) => v
			const validator = nonNullishAsync(noSafe as any)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})

		test('safe try-catch with undefined result', async () => {
			const noSafe = async (v: string) => (v === 'undef' ? undefined : v)
			const validator = nonNullishAsync(noSafe as any)
			expect(await validator.safe!('undef')).toEqual({
				ok: false,
				error: 'Value cannot be null or undefined',
			})
		})

		test('safe handles non-Error exception', async () => {
			const throwsNonError = async () => {
				throw 'string error'
			}
			const validator = nonNullishAsync(throwsNonError as any)
			expect(await validator.safe!('anything')).toEqual({ ok: false, error: 'Unknown error' })
		})

		test('safe returns success when validator.safe passes with non-nullish value', async () => {
			const maybeNull = createAsyncValidator(
				async (v: unknown) => v as string,
				async (v: unknown) => ({ ok: true, value: v as string }),
			)
			const validator = nonNullishAsync(maybeNull)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})

		test('safe returns error when validator.safe returns undefined', async () => {
			const maybeUndef = createAsyncValidator(
				async (v: unknown) => (v === 'undef' ? undefined : (v as string)),
				async (v: unknown) => ({ ok: true, value: v === 'undef' ? undefined : (v as string) }),
			)
			const validator = nonNullishAsync(maybeUndef)
			expect(await validator.safe!('undef')).toEqual({
				ok: false,
				error: 'Value cannot be null or undefined',
			})
		})
	})

	describe('nonOptionalAsync', () => {
		test('throws on undefined result', async () => {
			const maybeUndef = createAsyncValidator(
				async (v: unknown) => (v === 'undef' ? undefined : (v as string)),
				async (v: unknown) => ({ ok: true, value: v === 'undef' ? undefined : (v as string) }),
			)
			const validator = nonOptionalAsync(maybeUndef)
			await expect(validator('undef')).rejects.toThrow('Value cannot be undefined')
		})

		test('passes defined value', async () => {
			const validator = nonOptionalAsync(strAsync as any)
			expect(await validator('hello')).toBe('hello')
		})

		test('safe version returns error', async () => {
			const maybeUndef = createAsyncValidator(
				async (v: unknown) => (v === 'undef' ? undefined : (v as string)),
				async (v: unknown) => ({ ok: true, value: v === 'undef' ? undefined : (v as string) }),
			)
			const validator = nonOptionalAsync(maybeUndef)
			expect(await validator.safe!('undef')).toEqual({
				ok: false,
				error: 'Value cannot be undefined',
			})
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: string) => (v === 'undef' ? undefined : v)
			const validator = nonOptionalAsync(noSafe as any)
			expect(await validator.safe!('undef')).toEqual({
				ok: false,
				error: 'Value cannot be undefined',
			})
		})

		test('safe try-catch with valid value', async () => {
			const noSafe = async (v: string) => v
			const validator = nonOptionalAsync(noSafe as any)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})

		test('safe handles non-Error exception', async () => {
			const throwsNonError = async () => {
				throw 'string error'
			}
			const validator = nonOptionalAsync(throwsNonError as any)
			expect(await validator.safe!('anything')).toEqual({ ok: false, error: 'Unknown error' })
		})

		test('safe returns success when validator.safe passes with defined value', async () => {
			const maybeUndef = createAsyncValidator(
				async (v: unknown) => v as string,
				async (v: unknown) => ({ ok: true, value: v as string }),
			)
			const validator = nonOptionalAsync(maybeUndef)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})
	})

	describe('fallbackAsync', () => {
		test('returns value on success', async () => {
			const validator = fallbackAsync(strAsync, 'default')
			expect(await validator('hello')).toBe('hello')
		})

		test('returns fallback on error', async () => {
			const validator = fallbackAsync(strAsync, 'default')
			expect(await validator(123)).toBe('default')
		})

		test('supports function fallback', async () => {
			const validator = fallbackAsync(strAsync, () => 'default')
			expect(await validator(123)).toBe('default')
		})

		test('supports async function fallback', async () => {
			const validator = fallbackAsync(strAsync, async () => 'default')
			expect(await validator(123)).toBe('default')
		})

		test('safe version returns fallback on error', async () => {
			const validator = fallbackAsync(strAsync, 'default')
			expect(await validator.safe!(123)).toEqual({ ok: true, value: 'default' })
		})

		test('safe version returns value on success', async () => {
			const validator = fallbackAsync(strAsync, 'default')
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: string) => {
				if (typeof v !== 'string') throw new Error('Expected string')
				return v
			}
			const validator = fallbackAsync(noSafe as any, 'default')
			expect(await validator.safe!(123)).toEqual({ ok: true, value: 'default' })
		})

		test('safe try-catch with valid value', async () => {
			const noSafe = async (v: string) => v.toUpperCase()
			const validator = fallbackAsync(noSafe as any, 'default')
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'HELLO' })
		})
	})

	describe('partialAsync', () => {
		test('validates partial object', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name: string },
				async (v: unknown) => ({ ok: true, value: v as { name: string } }),
			)
			const validator = partialAsync(objAsync)
			expect(await validator({ name: 'test' })).toEqual({ name: 'test' })
		})

		test('throws on non-object', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name: string },
				async (v: unknown) => ({ ok: true, value: v as { name: string } }),
			)
			const validator = partialAsync(objAsync)
			await expect(validator('not an object')).rejects.toThrow('Expected object')
		})

		test('throws on null', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name: string },
				async (v: unknown) => ({ ok: true, value: v as { name: string } }),
			)
			const validator = partialAsync(objAsync)
			await expect(validator(null)).rejects.toThrow('Expected object')
		})

		test('throws on array', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name: string },
				async (v: unknown) => ({ ok: true, value: v as { name: string } }),
			)
			const validator = partialAsync(objAsync)
			await expect(validator([])).rejects.toThrow('Expected object')
		})

		test('safe version works', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name: string },
				async (v: unknown) => ({ ok: true, value: v as { name: string } }),
			)
			const validator = partialAsync(objAsync)
			expect(await validator.safe!({ name: 'test' })).toEqual({
				ok: true,
				value: { name: 'test' },
			})
		})

		test('safe version returns error on non-object', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name: string },
				async (v: unknown) => ({ ok: true, value: v as { name: string } }),
			)
			const validator = partialAsync(objAsync)
			expect(await validator.safe!('not an object')).toEqual({
				ok: false,
				error: 'Expected object',
			})
		})

		test('uses schema.safe when available and passes', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name: string },
				async (v: unknown) => ({ ok: true, value: v as { name: string } }),
			)
			const validator = partialAsync(objAsync)
			expect(await validator({ name: 'test' })).toEqual({ name: 'test' })
		})

		test('returns value even if schema.safe fails (partial allows missing)', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => {
					const o = v as { name?: string }
					if (!o.name) throw new Error('name required')
					return o as { name: string }
				},
				async (v: unknown) => {
					const o = v as { name?: string }
					if (!o.name) return { ok: false, error: 'name required' }
					return { ok: true, value: o as { name: string } }
				},
			)
			const validator = partialAsync(objAsync)
			// partial should return the value as-is even if underlying schema fails
			expect(await validator({})).toEqual({})
		})
	})

	describe('requiredAsync', () => {
		test('validates required object', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name: string },
				async (v: unknown) => ({ ok: true, value: v as { name: string } }),
			)
			const validator = requiredAsync(objAsync)
			expect(await validator({ name: 'test' })).toEqual({ name: 'test' })
		})

		test('throws on non-object', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name: string },
				async (v: unknown) => ({ ok: true, value: v as { name: string } }),
			)
			const validator = requiredAsync(objAsync)
			await expect(validator('not an object')).rejects.toThrow('Expected object')
		})

		test('throws on undefined field', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name?: string },
				async (v: unknown) => ({ ok: true, value: v as { name?: string } }),
			)
			const validator = requiredAsync(objAsync)
			await expect(validator({ name: undefined })).rejects.toThrow('name: Required')
		})

		test('safe version returns error on undefined field', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name?: string },
				async (v: unknown) => ({ ok: true, value: v as { name?: string } }),
			)
			const validator = requiredAsync(objAsync)
			expect(await validator.safe!({ name: undefined })).toEqual({
				ok: false,
				error: 'name: Required',
			})
		})

		test('safe version returns error on non-object', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name: string },
				async (v: unknown) => ({ ok: true, value: v as { name: string } }),
			)
			const validator = requiredAsync(objAsync)
			expect(await validator.safe!('not an object')).toEqual({
				ok: false,
				error: 'Expected object',
			})
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: unknown) => v as { name?: string }
			const validator = requiredAsync(noSafe as any)
			expect(await validator.safe!({ name: undefined })).toEqual({
				ok: false,
				error: 'name: Required',
			})
		})

		test('safe try-catch with valid value', async () => {
			const noSafe = async (v: unknown) => v as { name: string }
			const validator = requiredAsync(noSafe as any)
			expect(await validator.safe!({ name: 'test' })).toEqual({
				ok: true,
				value: { name: 'test' },
			})
		})

		test('safe handles non-Error exception', async () => {
			const throwsNonError = async () => {
				throw 'string error'
			}
			const validator = requiredAsync(throwsNonError as any)
			expect(await validator.safe!({ name: 'test' })).toEqual({
				ok: false,
				error: 'Unknown error',
			})
		})

		test('safe returns success when schema.safe passes with all defined values', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name: string; age: number },
				async (v: unknown) => ({ ok: true, value: v as { name: string; age: number } }),
			)
			const validator = requiredAsync(objAsync)
			expect(await validator.safe!({ name: 'test', age: 25 })).toEqual({
				ok: true,
				value: { name: 'test', age: 25 },
			})
		})

		test('safe returns error when schema.safe passes but value has undefined field', async () => {
			const objAsync = createAsyncValidator(
				async (v: unknown) => v as { name?: string },
				async (v: unknown) => ({ ok: true, value: v as { name?: string } }),
			)
			const validator = requiredAsync(objAsync)
			expect(await validator.safe!({ name: undefined })).toEqual({
				ok: false,
				error: 'name: Required',
			})
		})

		test('safe passes through underlying error from schema.safe', async () => {
			const failing = createAsyncValidator(
				async () => {
					throw new Error('schema error')
				},
				async () => ({ ok: false, error: 'schema error' }),
			)
			const validator = requiredAsync(failing)
			expect(await validator.safe!({ name: 'test' })).toEqual({
				ok: false,
				error: 'schema error',
			})
		})
	})
})
