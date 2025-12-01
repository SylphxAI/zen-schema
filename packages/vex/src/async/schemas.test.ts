import { describe, expect, test } from 'bun:test'
import { createAsyncValidator } from './core'
import {
	arrayAsync,
	intersectAsync,
	lazyAsync,
	looseObjectAsync,
	looseTupleAsync,
	mapAsync,
	objectAsync,
	objectWithRestAsync,
	recordAsync,
	setAsync,
	strictObjectAsync,
	strictTupleAsync,
	tupleAsync,
	tupleWithRestAsync,
	unionAsync,
	variantAsync,
} from './schemas'

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

const numAsync = createAsyncValidator(
	async (v: unknown) => {
		if (typeof v !== 'number') throw new Error('Expected number')
		return v
	},
	async (v: unknown) => {
		if (typeof v !== 'number') return { ok: false, error: 'Expected number' }
		return { ok: true, value: v }
	},
)

describe('async/schemas', () => {
	describe('arrayAsync', () => {
		test('validates array of strings', async () => {
			const validator = arrayAsync(strAsync)
			expect(await validator(['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
		})

		test('throws on non-array', async () => {
			const validator = arrayAsync(strAsync)
			await expect(validator('not array')).rejects.toThrow('Expected array')
		})

		test('throws on invalid item', async () => {
			const validator = arrayAsync(strAsync)
			await expect(validator(['a', 123, 'c'])).rejects.toThrow('[1]: Expected string')
		})

		test('safe version works', async () => {
			const validator = arrayAsync(strAsync)
			expect(await validator.safe!(['a', 'b'])).toEqual({ ok: true, value: ['a', 'b'] })
		})

		test('safe version returns error on non-array', async () => {
			const validator = arrayAsync(strAsync)
			expect(await validator.safe!('not array')).toEqual({
				ok: false,
				error: 'Expected array',
			})
		})

		test('safe version returns error on invalid item', async () => {
			const validator = arrayAsync(strAsync)
			expect(await validator.safe!(['a', 123])).toEqual({
				ok: false,
				error: '[1]: Expected string',
			})
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Expected string')
				return v
			}
			const validator = arrayAsync(noSafe)
			expect(await validator.safe!(['a', 123])).toEqual({
				ok: false,
				error: '[1]: Expected string',
			})
		})
	})

	describe('objectAsync', () => {
		test('validates object', async () => {
			const validator = objectAsync({ name: strAsync, age: numAsync })
			expect(await validator({ name: 'John', age: 30 })).toEqual({ name: 'John', age: 30 })
		})

		test('throws on non-object', async () => {
			const validator = objectAsync({ name: strAsync })
			await expect(validator('not object')).rejects.toThrow('Expected object')
		})

		test('throws on null', async () => {
			const validator = objectAsync({ name: strAsync })
			await expect(validator(null)).rejects.toThrow('Expected object')
		})

		test('throws on array', async () => {
			const validator = objectAsync({ name: strAsync })
			await expect(validator([])).rejects.toThrow('Expected object')
		})

		test('throws on invalid field', async () => {
			const validator = objectAsync({ name: strAsync })
			await expect(validator({ name: 123 })).rejects.toThrow('name: Expected string')
		})

		test('safe version works', async () => {
			const validator = objectAsync({ name: strAsync })
			expect(await validator.safe!({ name: 'John' })).toEqual({
				ok: true,
				value: { name: 'John' },
			})
		})

		test('safe version returns error on non-object', async () => {
			const validator = objectAsync({ name: strAsync })
			expect(await validator.safe!('not object')).toEqual({
				ok: false,
				error: 'Expected object',
			})
		})

		test('safe version returns error on invalid field', async () => {
			const validator = objectAsync({ name: strAsync })
			expect(await validator.safe!({ name: 123 })).toEqual({
				ok: false,
				error: 'name: Expected string',
			})
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Expected string')
				return v
			}
			const validator = objectAsync({ name: noSafe })
			expect(await validator.safe!({ name: 123 })).toEqual({
				ok: false,
				error: 'name: Expected string',
			})
		})
	})

	describe('looseObjectAsync', () => {
		test('validates object and preserves extra fields', async () => {
			const validator = looseObjectAsync({ name: strAsync })
			expect(await validator({ name: 'John', extra: 'field' })).toEqual({
				name: 'John',
				extra: 'field',
			})
		})

		test('throws on non-object', async () => {
			const validator = looseObjectAsync({ name: strAsync })
			await expect(validator('not object')).rejects.toThrow('Expected object')
		})

		test('safe version works', async () => {
			const validator = looseObjectAsync({ name: strAsync })
			expect(await validator.safe!({ name: 'John', extra: 'field' })).toEqual({
				ok: true,
				value: { name: 'John', extra: 'field' },
			})
		})

		test('safe version returns error', async () => {
			const validator = looseObjectAsync({ name: strAsync })
			expect(await validator.safe!('not object')).toEqual({
				ok: false,
				error: 'Expected object',
			})
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Expected string')
				return v
			}
			const validator = looseObjectAsync({ name: noSafe })
			expect(await validator.safe!({ name: 123 })).toEqual({
				ok: false,
				error: 'name: Expected string',
			})
		})
	})

	describe('strictObjectAsync', () => {
		test('is alias for objectAsync', () => {
			expect(strictObjectAsync).toBe(objectAsync)
		})
	})

	describe('objectWithRestAsync', () => {
		test('validates known fields and rest', async () => {
			const validator = objectWithRestAsync({ name: strAsync }, numAsync)
			expect(await validator({ name: 'John', score: 100 })).toEqual({
				name: 'John',
				score: 100,
			})
		})

		test('throws on non-object', async () => {
			const validator = objectWithRestAsync({ name: strAsync }, numAsync)
			await expect(validator('not object')).rejects.toThrow('Expected object')
		})

		test('throws on invalid known field', async () => {
			const validator = objectWithRestAsync({ name: strAsync }, numAsync)
			await expect(validator({ name: 123 })).rejects.toThrow('name: Expected string')
		})

		test('throws on invalid rest field', async () => {
			const validator = objectWithRestAsync({ name: strAsync }, numAsync)
			await expect(validator({ name: 'John', score: 'not number' })).rejects.toThrow('score: Expected number')
		})

		test('safe version works', async () => {
			const validator = objectWithRestAsync({ name: strAsync }, numAsync)
			expect(await validator.safe!({ name: 'John', score: 100 })).toEqual({
				ok: true,
				value: { name: 'John', score: 100 },
			})
		})

		test('safe version returns error on non-object', async () => {
			const validator = objectWithRestAsync({ name: strAsync }, numAsync)
			expect(await validator.safe!('not object')).toEqual({
				ok: false,
				error: 'Expected object',
			})
		})

		test('safe version returns error on invalid rest', async () => {
			const validator = objectWithRestAsync({ name: strAsync }, numAsync)
			expect(await validator.safe!({ name: 'John', score: 'bad' })).toEqual({
				ok: false,
				error: 'score: Expected number',
			})
		})

		test('safe falls back to try-catch for known fields', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Expected string')
				return v
			}
			const validator = objectWithRestAsync({ name: noSafe }, numAsync)
			expect(await validator.safe!({ name: 123 })).toEqual({
				ok: false,
				error: 'name: Expected string',
			})
		})

		test('safe falls back to try-catch for rest fields', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'number') throw new Error('Expected number')
				return v
			}
			const validator = objectWithRestAsync({ name: strAsync }, noSafe as any)
			expect(await validator.safe!({ name: 'John', score: 'bad' })).toEqual({
				ok: false,
				error: 'score: Expected number',
			})
		})
	})

	describe('tupleAsync', () => {
		test('validates tuple', async () => {
			const validator = tupleAsync([strAsync, numAsync])
			expect(await validator(['hello', 42])).toEqual(['hello', 42])
		})

		test('throws on non-array', async () => {
			const validator = tupleAsync([strAsync])
			await expect(validator('not array')).rejects.toThrow('Expected array')
		})

		test('throws on wrong length', async () => {
			const validator = tupleAsync([strAsync, numAsync])
			await expect(validator(['hello'])).rejects.toThrow('Expected 2 items, got 1')
		})

		test('throws on invalid item', async () => {
			const validator = tupleAsync([strAsync, numAsync])
			await expect(validator(['hello', 'not number'])).rejects.toThrow('[1]: Expected number')
		})

		test('safe version works', async () => {
			const validator = tupleAsync([strAsync, numAsync])
			expect(await validator.safe!(['hello', 42])).toEqual({
				ok: true,
				value: ['hello', 42],
			})
		})

		test('safe version returns error on non-array', async () => {
			const validator = tupleAsync([strAsync])
			expect(await validator.safe!('not array')).toEqual({
				ok: false,
				error: 'Expected array',
			})
		})

		test('safe version returns error on wrong length', async () => {
			const validator = tupleAsync([strAsync, numAsync])
			expect(await validator.safe!(['hello'])).toEqual({
				ok: false,
				error: 'Expected 2 items, got 1',
			})
		})

		test('safe version returns error on invalid item', async () => {
			const validator = tupleAsync([strAsync, numAsync])
			expect(await validator.safe!(['hello', 'bad'])).toEqual({
				ok: false,
				error: '[1]: Expected number',
			})
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Expected string')
				return v
			}
			const validator = tupleAsync([noSafe as any])
			expect(await validator.safe!([123])).toEqual({
				ok: false,
				error: '[0]: Expected string',
			})
		})
	})

	describe('strictTupleAsync', () => {
		test('is alias for tupleAsync', () => {
			expect(strictTupleAsync).toBe(tupleAsync)
		})
	})

	describe('looseTupleAsync', () => {
		test('validates tuple with extra items ignored', async () => {
			const validator = looseTupleAsync([strAsync, numAsync])
			expect(await validator(['hello', 42, 'extra'])).toEqual(['hello', 42])
		})

		test('throws on non-array', async () => {
			const validator = looseTupleAsync([strAsync])
			await expect(validator('not array')).rejects.toThrow('Expected array')
		})

		test('throws on too few items', async () => {
			const validator = looseTupleAsync([strAsync, numAsync])
			await expect(validator(['hello'])).rejects.toThrow('Expected at least 2 items, got 1')
		})

		test('safe version works', async () => {
			const validator = looseTupleAsync([strAsync])
			expect(await validator.safe!(['hello', 'extra'])).toEqual({
				ok: true,
				value: ['hello'],
			})
		})

		test('safe version returns error', async () => {
			const validator = looseTupleAsync([strAsync])
			expect(await validator.safe!('not array')).toEqual({
				ok: false,
				error: 'Expected array',
			})
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Expected string')
				return v
			}
			const validator = looseTupleAsync([noSafe as any])
			expect(await validator.safe!([123])).toEqual({
				ok: false,
				error: '[0]: Expected string',
			})
		})
	})

	describe('tupleWithRestAsync', () => {
		test('validates tuple with rest', async () => {
			const validator = tupleWithRestAsync([strAsync], numAsync)
			expect(await validator(['hello', 1, 2, 3])).toEqual(['hello', 1, 2, 3])
		})

		test('throws on non-array', async () => {
			const validator = tupleWithRestAsync([strAsync], numAsync)
			await expect(validator('not array')).rejects.toThrow('Expected array')
		})

		test('throws on too few items', async () => {
			const validator = tupleWithRestAsync([strAsync, numAsync], numAsync)
			await expect(validator(['hello'])).rejects.toThrow('Expected at least 2 items, got 1')
		})

		test('throws on invalid rest item', async () => {
			const validator = tupleWithRestAsync([strAsync], numAsync)
			await expect(validator(['hello', 'not number'])).rejects.toThrow('[1]: Expected number')
		})

		test('safe version works', async () => {
			const validator = tupleWithRestAsync([strAsync], numAsync)
			expect(await validator.safe!(['hello', 1, 2])).toEqual({
				ok: true,
				value: ['hello', 1, 2],
			})
		})

		test('safe version returns error on non-array', async () => {
			const validator = tupleWithRestAsync([strAsync], numAsync)
			expect(await validator.safe!('not array')).toEqual({
				ok: false,
				error: 'Expected array',
			})
		})

		test('safe version returns error on invalid rest', async () => {
			const validator = tupleWithRestAsync([strAsync], numAsync)
			expect(await validator.safe!(['hello', 'bad'])).toEqual({
				ok: false,
				error: '[1]: Expected number',
			})
		})

		test('safe falls back to try-catch for tuple items', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Expected string')
				return v
			}
			const validator = tupleWithRestAsync([noSafe as any], numAsync)
			expect(await validator.safe!([123])).toEqual({
				ok: false,
				error: '[0]: Expected string',
			})
		})

		test('safe falls back to try-catch for rest items', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'number') throw new Error('Expected number')
				return v
			}
			const validator = tupleWithRestAsync([strAsync], noSafe as any)
			expect(await validator.safe!(['hello', 'bad'])).toEqual({
				ok: false,
				error: '[1]: Expected number',
			})
		})
	})

	describe('mapAsync', () => {
		test('validates Map', async () => {
			const validator = mapAsync(strAsync, numAsync)
			const input = new Map([
				['a', 1],
				['b', 2],
			])
			const result = await validator(input)
			expect(result.get('a')).toBe(1)
			expect(result.get('b')).toBe(2)
		})

		test('throws on non-Map', async () => {
			const validator = mapAsync(strAsync, numAsync)
			await expect(validator({})).rejects.toThrow('Expected Map')
		})

		test('safe version works', async () => {
			const validator = mapAsync(strAsync, numAsync)
			const input = new Map([['a', 1]])
			const result = await validator.safe!(input)
			expect(result.ok).toBe(true)
		})

		test('safe version returns error on non-Map', async () => {
			const validator = mapAsync(strAsync, numAsync)
			expect(await validator.safe!({})).toEqual({ ok: false, error: 'Expected Map' })
		})

		test('safe version returns error on invalid key', async () => {
			const validator = mapAsync(strAsync, numAsync)
			const input = new Map([[123, 1] as any])
			const result = await validator.safe!(input)
			expect(result.ok).toBe(false)
		})

		test('safe version returns error on invalid value', async () => {
			const validator = mapAsync(strAsync, numAsync)
			const input = new Map([['a', 'not number'] as any])
			const result = await validator.safe!(input)
			expect(result.ok).toBe(false)
		})
	})

	describe('setAsync', () => {
		test('validates Set', async () => {
			const validator = setAsync(strAsync)
			const input = new Set(['a', 'b', 'c'])
			const result = await validator(input)
			expect(result.has('a')).toBe(true)
			expect(result.size).toBe(3)
		})

		test('throws on non-Set', async () => {
			const validator = setAsync(strAsync)
			await expect(validator([])).rejects.toThrow('Expected Set')
		})

		test('safe version works', async () => {
			const validator = setAsync(strAsync)
			const input = new Set(['a'])
			const result = await validator.safe!(input)
			expect(result.ok).toBe(true)
		})

		test('safe version returns error on non-Set', async () => {
			const validator = setAsync(strAsync)
			expect(await validator.safe!([])).toEqual({ ok: false, error: 'Expected Set' })
		})

		test('safe version returns error on invalid item', async () => {
			const validator = setAsync(strAsync)
			const input = new Set([123] as any)
			const result = await validator.safe!(input)
			expect(result.ok).toBe(false)
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Expected string')
				return v
			}
			const validator = setAsync(noSafe as any)
			const input = new Set([123] as any)
			const result = await validator.safe!(input)
			expect(result.ok).toBe(false)
		})
	})

	describe('recordAsync', () => {
		test('validates record', async () => {
			const validator = recordAsync(numAsync)
			expect(await validator({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 })
		})

		test('throws on non-object', async () => {
			const validator = recordAsync(numAsync)
			await expect(validator('not object')).rejects.toThrow('Expected object')
		})

		test('throws on null', async () => {
			const validator = recordAsync(numAsync)
			await expect(validator(null)).rejects.toThrow('Expected object')
		})

		test('throws on array', async () => {
			const validator = recordAsync(numAsync)
			await expect(validator([])).rejects.toThrow('Expected object')
		})

		test('throws on invalid value', async () => {
			const validator = recordAsync(numAsync)
			await expect(validator({ a: 'not number' })).rejects.toThrow('Expected number')
		})

		test('safe version works', async () => {
			const validator = recordAsync(numAsync)
			expect(await validator.safe!({ a: 1 })).toEqual({ ok: true, value: { a: 1 } })
		})

		test('safe version returns error on non-object', async () => {
			const validator = recordAsync(numAsync)
			expect(await validator.safe!('not object')).toEqual({
				ok: false,
				error: 'Expected object',
			})
		})

		test('safe version returns error on invalid value', async () => {
			const validator = recordAsync(numAsync)
			expect(await validator.safe!({ a: 'bad' })).toEqual({
				ok: false,
				error: 'a: Expected number',
			})
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'number') throw new Error('Expected number')
				return v
			}
			const validator = recordAsync(noSafe as any)
			expect(await validator.safe!({ a: 'bad' })).toEqual({
				ok: false,
				error: 'a: Expected number',
			})
		})
	})

	describe('intersectAsync', () => {
		test('intersects schemas', async () => {
			const a = createAsyncValidator(
				async (v: unknown) => ({ ...(v as object), a: 1 }),
				async (v: unknown) => ({ ok: true, value: { ...(v as object), a: 1 } }),
			)
			const b = createAsyncValidator(
				async (v: unknown) => ({ ...(v as object), b: 2 }),
				async (v: unknown) => ({ ok: true, value: { ...(v as object), b: 2 } }),
			)
			const validator = intersectAsync([a, b])
			expect(await validator({})).toEqual({ a: 1, b: 2 })
		})

		test('safe version works', async () => {
			const a = createAsyncValidator(
				async (v: unknown) => ({ ...(v as object), a: 1 }),
				async (v: unknown) => ({ ok: true, value: { ...(v as object), a: 1 } }),
			)
			const validator = intersectAsync([a])
			expect(await validator.safe!({})).toEqual({ ok: true, value: { a: 1 } })
		})

		test('safe version returns error', async () => {
			const fails = createAsyncValidator(
				async () => {
					throw new Error('Failed')
				},
				async () => ({ ok: false, error: 'Failed' }),
			)
			const validator = intersectAsync([fails])
			expect(await validator.safe!({})).toEqual({ ok: false, error: 'Failed' })
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async () => {
				throw new Error('Failed')
			}
			const validator = intersectAsync([noSafe as any])
			expect(await validator.safe!({})).toEqual({ ok: false, error: 'Failed' })
		})
	})

	describe('unionAsync', () => {
		test('validates first matching schema', async () => {
			const validator = unionAsync([strAsync, numAsync])
			expect(await validator('hello')).toBe('hello')
			expect(await validator(42)).toBe(42)
		})

		test('throws when no schema matches', async () => {
			const validator = unionAsync([strAsync, numAsync])
			await expect(validator(true)).rejects.toThrow('No matching schema in union')
		})

		test('safe version works', async () => {
			const validator = unionAsync([strAsync, numAsync])
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})

		test('safe version returns error when no match', async () => {
			const validator = unionAsync([strAsync, numAsync])
			expect(await validator.safe!(true)).toEqual({
				ok: false,
				error: 'No matching schema in union',
			})
		})

		test('handles validator without safe method', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'boolean') throw new Error('Expected boolean')
				return v
			}
			const validator = unionAsync([strAsync, noSafe as any])
			expect(await validator(true)).toBe(true)
		})

		test('safe handles validator without safe method', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'boolean') throw new Error('Expected boolean')
				return v
			}
			const validator = unionAsync([strAsync, noSafe as any])
			expect(await validator.safe!(true)).toEqual({ ok: true, value: true })
		})
	})

	describe('variantAsync', () => {
		test('validates discriminated union', async () => {
			const catAsync = objectAsync({
				type: createAsyncValidator(
					async (v: unknown) => {
						if (v !== 'cat') throw new Error('Not cat')
						return v as 'cat'
					},
					async (v: unknown) => (v === 'cat' ? { ok: true, value: v as 'cat' } : { ok: false, error: 'Not cat' }),
				),
				name: strAsync,
			})
			const dogAsync = objectAsync({
				type: createAsyncValidator(
					async (v: unknown) => {
						if (v !== 'dog') throw new Error('Not dog')
						return v as 'dog'
					},
					async (v: unknown) => (v === 'dog' ? { ok: true, value: v as 'dog' } : { ok: false, error: 'Not dog' }),
				),
				name: strAsync,
			})

			const validator = variantAsync('type', [catAsync, dogAsync])
			expect(await validator({ type: 'cat', name: 'Whiskers' })).toEqual({
				type: 'cat',
				name: 'Whiskers',
			})
		})

		test('throws on non-object', async () => {
			const catAsync = objectAsync({ type: strAsync })
			const validator = variantAsync('type', [catAsync])
			await expect(validator('not object')).rejects.toThrow('Expected object')
		})

		test('throws when no variant matches', async () => {
			const catAsync = objectAsync({
				type: createAsyncValidator(
					async (v: unknown) => {
						if (v !== 'cat') throw new Error('Not cat')
						return v as 'cat'
					},
					async (v: unknown) => (v === 'cat' ? { ok: true, value: v as 'cat' } : { ok: false, error: 'Not cat' }),
				),
			})
			const validator = variantAsync('type', [catAsync])
			await expect(validator({ type: 'dog' })).rejects.toThrow('No matching variant')
		})

		test('safe version works', async () => {
			const catAsync = objectAsync({
				type: createAsyncValidator(
					async (v: unknown) => {
						if (v !== 'cat') throw new Error('Not cat')
						return v as 'cat'
					},
					async (v: unknown) => (v === 'cat' ? { ok: true, value: v as 'cat' } : { ok: false, error: 'Not cat' }),
				),
				name: strAsync,
			})
			const validator = variantAsync('type', [catAsync])
			expect(await validator.safe!({ type: 'cat', name: 'Whiskers' })).toEqual({
				ok: true,
				value: { type: 'cat', name: 'Whiskers' },
			})
		})

		test('safe version returns error on non-object', async () => {
			const catAsync = objectAsync({ type: strAsync })
			const validator = variantAsync('type', [catAsync])
			expect(await validator.safe!('not object')).toEqual({
				ok: false,
				error: 'Expected object',
			})
		})

		test('safe handles validator without safe method', async () => {
			const noSafe = async (v: unknown) => {
				const obj = v as { type: string }
				if (obj.type !== 'test') throw new Error('Not test')
				return obj
			}
			const validator = variantAsync('type', [noSafe as any])
			expect(await validator.safe!({ type: 'test' })).toEqual({
				ok: true,
				value: { type: 'test' },
			})
		})
	})

	describe('lazyAsync', () => {
		test('lazily evaluates schema', async () => {
			const validator = lazyAsync(() => strAsync)
			expect(await validator('hello')).toBe('hello')
		})

		test('safe version works', async () => {
			const validator = lazyAsync(() => strAsync)
			expect(await validator.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})

		test('safe version returns error', async () => {
			const validator = lazyAsync(() => strAsync)
			expect(await validator.safe!(123)).toEqual({ ok: false, error: 'Expected string' })
		})

		test('safe falls back to try-catch', async () => {
			const noSafe = async (v: unknown) => {
				if (typeof v !== 'string') throw new Error('Expected string')
				return v
			}
			const validator = lazyAsync(() => noSafe as any)
			expect(await validator.safe!(123)).toEqual({ ok: false, error: 'Expected string' })
		})
	})
})
