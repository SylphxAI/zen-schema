import { describe, expect, test } from 'bun:test'
import type { Result } from '../core'
import { asyncErr, asyncOk, createAsyncValidator, ValidationError } from './core'

describe('async/core', () => {
	describe('asyncErr', () => {
		test('returns error result', async () => {
			const result = await asyncErr('Test error')
			expect(result).toEqual({ ok: false, error: 'Test error' })
		})

		test('returns error with empty message', async () => {
			const result = await asyncErr('')
			expect(result).toEqual({ ok: false, error: '' })
		})

		test('returns error with long message', async () => {
			const longMessage = 'x'.repeat(1000)
			const result = await asyncErr(longMessage)
			expect(result).toEqual({ ok: false, error: longMessage })
		})

		test('returns error with special characters', async () => {
			const result = await asyncErr('Error: <script>alert("xss")</script>')
			expect(result).toEqual({ ok: false, error: 'Error: <script>alert("xss")</script>' })
		})

		test('returns error with unicode characters', async () => {
			const result = await asyncErr('错误: 无效的值')
			expect(result).toEqual({ ok: false, error: '错误: 无效的值' })
		})

		test('is a Promise', async () => {
			const result = asyncErr('Test')
			expect(result).toBeInstanceOf(Promise)
		})

		test('resolves immediately', async () => {
			const start = Date.now()
			await asyncErr('Test')
			const elapsed = Date.now() - start
			expect(elapsed).toBeLessThan(50)
		})

		test('result has ok property false', async () => {
			const result = await asyncErr('Test')
			expect(result.ok).toBe(false)
		})

		test('result has error property', async () => {
			const result = await asyncErr('Custom error')
			expect('error' in result).toBe(true)
			expect((result as any).error).toBe('Custom error')
		})

		test('returns proper Result type', async () => {
			const result: Result<never> = await asyncErr('Test')
			expect(result.ok).toBe(false)
		})
	})

	describe('asyncOk', () => {
		test('returns success result', async () => {
			const result = await asyncOk('test value')
			expect(result).toEqual({ ok: true, value: 'test value' })
		})

		test('works with numbers', async () => {
			const result = await asyncOk(42)
			expect(result).toEqual({ ok: true, value: 42 })
		})

		test('works with objects', async () => {
			const obj = { name: 'test' }
			const result = await asyncOk(obj)
			expect(result).toEqual({ ok: true, value: obj })
		})

		test('works with null', async () => {
			const result = await asyncOk(null)
			expect(result).toEqual({ ok: true, value: null })
		})

		test('works with undefined', async () => {
			const result = await asyncOk(undefined)
			expect(result).toEqual({ ok: true, value: undefined })
		})

		test('works with boolean true', async () => {
			const result = await asyncOk(true)
			expect(result).toEqual({ ok: true, value: true })
		})

		test('works with boolean false', async () => {
			const result = await asyncOk(false)
			expect(result).toEqual({ ok: true, value: false })
		})

		test('works with zero', async () => {
			const result = await asyncOk(0)
			expect(result).toEqual({ ok: true, value: 0 })
		})

		test('works with empty string', async () => {
			const result = await asyncOk('')
			expect(result).toEqual({ ok: true, value: '' })
		})

		test('works with arrays', async () => {
			const arr = [1, 2, 3]
			const result = await asyncOk(arr)
			expect(result).toEqual({ ok: true, value: arr })
		})

		test('works with nested objects', async () => {
			const nested = { a: { b: { c: 1 } } }
			const result = await asyncOk(nested)
			expect(result).toEqual({ ok: true, value: nested })
		})

		test('works with Date objects', async () => {
			const date = new Date()
			const result = await asyncOk(date)
			expect(result).toEqual({ ok: true, value: date })
		})

		test('works with bigint', async () => {
			const big = BigInt(9007199254740991)
			const result = await asyncOk(big)
			expect(result).toEqual({ ok: true, value: big })
		})

		test('works with Symbol', async () => {
			const sym = Symbol('test')
			const result = await asyncOk(sym)
			expect(result).toEqual({ ok: true, value: sym })
		})

		test('preserves object reference', async () => {
			const obj = { key: 'value' }
			const result = await asyncOk(obj)
			expect(result.ok).toBe(true)
			expect((result as any).value).toBe(obj)
		})

		test('is a Promise', async () => {
			const result = asyncOk('test')
			expect(result).toBeInstanceOf(Promise)
		})

		test('resolves immediately', async () => {
			const start = Date.now()
			await asyncOk('test')
			const elapsed = Date.now() - start
			expect(elapsed).toBeLessThan(50)
		})

		test('result has ok property true', async () => {
			const result = await asyncOk('test')
			expect(result.ok).toBe(true)
		})

		test('result has value property', async () => {
			const result = await asyncOk('custom value')
			expect('value' in result).toBe(true)
			expect((result as any).value).toBe('custom value')
		})
	})

	describe('createAsyncValidator', () => {
		test('creates validator with parse and safeParse', async () => {
			const validator = createAsyncValidator(
				async (v: string) => v.toUpperCase(),
				async (v: string) => ({ ok: true as const, value: v.toUpperCase() }),
			)

			expect(await validator('hello')).toBe('HELLO')
			expect(await validator.safe!('world')).toEqual({ ok: true, value: 'WORLD' })
		})

		test('handles errors in parse', async () => {
			const validator = createAsyncValidator(
				async (v: unknown) => {
					if (typeof v !== 'string') throw new Error('Expected string')
					return v
				},
				async (v: unknown) => {
					if (typeof v !== 'string') return { ok: false as const, error: 'Expected string' }
					return { ok: true as const, value: v }
				},
			)

			await expect(validator(123)).rejects.toThrow('Expected string')
			expect(await validator.safe!(123)).toEqual({ ok: false, error: 'Expected string' })
		})

		test('creates validator that transforms values', async () => {
			const validator = createAsyncValidator(
				async (v: number) => v * 2,
				async (v: number) => ({ ok: true as const, value: v * 2 }),
			)

			expect(await validator(5)).toBe(10)
			expect(await validator.safe!(5)).toEqual({ ok: true, value: 10 })
		})

		test('creates validator with async delay', async () => {
			const validator = createAsyncValidator(
				async (v: string) => {
					await new Promise((r) => setTimeout(r, 1))
					return v.toLowerCase()
				},
				async (v: string) => {
					await new Promise((r) => setTimeout(r, 1))
					return { ok: true as const, value: v.toLowerCase() }
				},
			)

			expect(await validator('HELLO')).toBe('hello')
			expect(await validator.safe!('WORLD')).toEqual({ ok: true, value: 'world' })
		})

		test('creates validator that validates objects', async () => {
			type User = { name: string; age: number }
			const validator = createAsyncValidator<unknown, User>(
				async (v: unknown) => {
					const obj = v as any
					if (!obj || typeof obj !== 'object') throw new Error('Expected object')
					if (typeof obj.name !== 'string') throw new Error('Expected name')
					if (typeof obj.age !== 'number') throw new Error('Expected age')
					return { name: obj.name, age: obj.age }
				},
				async (v: unknown) => {
					const obj = v as any
					if (!obj || typeof obj !== 'object') return { ok: false as const, error: 'Expected object' }
					if (typeof obj.name !== 'string') return { ok: false as const, error: 'Expected name' }
					if (typeof obj.age !== 'number') return { ok: false as const, error: 'Expected age' }
					return { ok: true as const, value: { name: obj.name, age: obj.age } }
				},
			)

			expect(await validator({ name: 'John', age: 30 })).toEqual({ name: 'John', age: 30 })
			expect(await validator.safe!({ name: 'John', age: 30 })).toEqual({
				ok: true,
				value: { name: 'John', age: 30 },
			})
			expect(await validator.safe!({ name: 123 })).toEqual({ ok: false, error: 'Expected name' })
		})

		test('safe function returns error on exception', async () => {
			const validator = createAsyncValidator(
				async (v: number) => {
					if (v < 0) throw new Error('Must be positive')
					return v
				},
				async (v: number) => {
					if (v < 0) return { ok: false as const, error: 'Must be positive' }
					return { ok: true as const, value: v }
				},
			)

			expect(await validator.safe!(-1)).toEqual({ ok: false, error: 'Must be positive' })
			expect(await validator.safe!(1)).toEqual({ ok: true, value: 1 })
		})

		test('validator is callable', async () => {
			const validator = createAsyncValidator(
				async (v: string) => v,
				async (v: string) => ({ ok: true as const, value: v }),
			)

			expect(typeof validator).toBe('function')
		})

		test('validator has safe property', async () => {
			const validator = createAsyncValidator(
				async (v: string) => v,
				async (v: string) => ({ ok: true as const, value: v }),
			)

			expect(typeof validator.safe).toBe('function')
		})

		test('handles null values correctly', async () => {
			const validator = createAsyncValidator(
				async (v: unknown) => {
					if (v === null) return null
					throw new Error('Expected null')
				},
				async (v: unknown) => {
					if (v === null) return { ok: true as const, value: null }
					return { ok: false as const, error: 'Expected null' }
				},
			)

			expect(await validator(null)).toBe(null)
			expect(await validator.safe!(null)).toEqual({ ok: true, value: null })
			expect(await validator.safe!('not null')).toEqual({ ok: false, error: 'Expected null' })
		})

		test('handles array validation', async () => {
			const validator = createAsyncValidator(
				async (v: unknown) => {
					if (!Array.isArray(v)) throw new Error('Expected array')
					return v.map((x) => x * 2)
				},
				async (v: unknown) => {
					if (!Array.isArray(v)) return { ok: false as const, error: 'Expected array' }
					return { ok: true as const, value: v.map((x) => x * 2) }
				},
			)

			expect(await validator([1, 2, 3])).toEqual([2, 4, 6])
			expect(await validator.safe!([1, 2, 3])).toEqual({ ok: true, value: [2, 4, 6] })
			expect(await validator.safe!('not array')).toEqual({ ok: false, error: 'Expected array' })
		})

		test('preserves this context', async () => {
			const validator = createAsyncValidator(
				async function (this: any, v: string) {
					return v
				},
				async function (this: any, v: string) {
					return { ok: true as const, value: v }
				},
			)

			expect(await validator('test')).toBe('test')
		})
	})

	describe('ValidationError', () => {
		test('is exported from core', () => {
			expect(ValidationError).toBeDefined()
		})

		test('can be instantiated', () => {
			const error = new ValidationError('Test error')
			expect(error).toBeInstanceOf(Error)
			expect(error).toBeInstanceOf(ValidationError)
		})

		test('has message property', () => {
			const error = new ValidationError('Test message')
			expect(error.message).toBe('Test message')
		})

		test('can be thrown and caught', () => {
			expect(() => {
				throw new ValidationError('Test')
			}).toThrow(ValidationError)
		})

		test('is catchable as Error', () => {
			try {
				throw new ValidationError('Test')
			} catch (e) {
				expect(e).toBeInstanceOf(Error)
			}
		})
	})

	describe('edge cases', () => {
		test('asyncErr and asyncOk are symmetric', async () => {
			const errResult = await asyncErr('error')
			const okResult = await asyncOk('value')

			expect(errResult.ok).toBe(false)
			expect(okResult.ok).toBe(true)
			expect('error' in errResult).toBe(true)
			expect('value' in okResult).toBe(true)
		})

		test('multiple concurrent async operations', async () => {
			const results = await Promise.all([asyncOk(1), asyncOk(2), asyncErr('error'), asyncOk(3)])

			expect(results[0]).toEqual({ ok: true, value: 1 })
			expect(results[1]).toEqual({ ok: true, value: 2 })
			expect(results[2]).toEqual({ ok: false, error: 'error' })
			expect(results[3]).toEqual({ ok: true, value: 3 })
		})

		test('validator chains work correctly', async () => {
			const stringValidator = createAsyncValidator(
				async (v: unknown) => {
					if (typeof v !== 'string') throw new Error('Expected string')
					return v
				},
				async (v: unknown) => {
					if (typeof v !== 'string') return { ok: false as const, error: 'Expected string' }
					return { ok: true as const, value: v }
				},
			)

			const lengthValidator = createAsyncValidator(
				async (v: string) => {
					if (v.length < 3) throw new Error('Too short')
					return v
				},
				async (v: string) => {
					if (v.length < 3) return { ok: false as const, error: 'Too short' }
					return { ok: true as const, value: v }
				},
			)

			// Chain validators
			const input = 'hello'
			const step1 = await stringValidator(input)
			const step2 = await lengthValidator(step1)
			expect(step2).toBe('hello')
		})

		test('handles promise rejection in validator', async () => {
			const validator = createAsyncValidator(
				async () => {
					return Promise.reject(new Error('Rejected'))
				},
				async () => {
					return { ok: false as const, error: 'Rejected' }
				},
			)

			await expect(validator('test')).rejects.toThrow('Rejected')
		})
	})
})
