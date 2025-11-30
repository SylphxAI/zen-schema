import { describe, expect, test } from 'bun:test'
import { pipe } from '../composition/pipe'
import { ValidationError } from '../core'
import { int, positive } from './number'
import { arr, bigInt, bool, date, num, obj, str } from './primitives'

describe('Primitive Validators', () => {
	describe('str', () => {
		test('validates strings', () => {
			expect(str('hello')).toBe('hello')
			expect(str('')).toBe('')
			expect(str('   ')).toBe('   ')
		})

		test('throws on non-strings', () => {
			expect(() => str(123)).toThrow(ValidationError)
			expect(() => str(null)).toThrow(ValidationError)
			expect(() => str(undefined)).toThrow(ValidationError)
			expect(() => str({})).toThrow(ValidationError)
			expect(() => str([])).toThrow(ValidationError)
			expect(() => str(true)).toThrow(ValidationError)
		})

		test('safe version returns success', () => {
			expect(str.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})

		test('safe version returns error', () => {
			expect(str.safe!(123)).toEqual({ ok: false, error: 'Expected string' })
		})

		test('safe version with various types', () => {
			expect(str.safe!(null)).toEqual({ ok: false, error: 'Expected string' })
			expect(str.safe!(undefined)).toEqual({ ok: false, error: 'Expected string' })
			expect(str.safe!({})).toEqual({ ok: false, error: 'Expected string' })
			expect(str.safe!([])).toEqual({ ok: false, error: 'Expected string' })
		})

		test('Standard Schema support', () => {
			expect(str['~standard']).toBeDefined()
			expect(str['~standard']!.version).toBe(1)
			expect(str['~standard']!.vendor).toBe('vex')
		})

		test('Standard Schema validate success', () => {
			const result = str['~standard']!.validate('hello')
			expect(result).toEqual({ value: 'hello' })
		})

		test('Standard Schema validate failure', () => {
			const result = str['~standard']!.validate(123)
			expect(result).toHaveProperty('issues')
			expect(result.issues![0].message).toBe('Expected string')
		})

		test('works in pipe', () => {
			const pipeline = pipe(str)
			expect(pipeline('hello')).toBe('hello')
			expect(() => pipeline(123)).toThrow()
		})

		test('handles unicode strings', () => {
			expect(str('你好')).toBe('你好')
			expect(str('👋')).toBe('👋')
			expect(str('é')).toBe('é')
		})

		test('handles string with special characters', () => {
			expect(str('\n\t\r')).toBe('\n\t\r')
			expect(str('\0')).toBe('\0')
		})
	})

	describe('num', () => {
		test('validates numbers', () => {
			expect(num(42)).toBe(42)
			expect(num(3.14)).toBe(3.14)
			expect(num(-42)).toBe(-42)
			expect(num(0)).toBe(0)
		})

		test('throws on NaN', () => {
			expect(() => num(NaN)).toThrow(ValidationError)
		})

		test('throws on non-numbers', () => {
			expect(() => num('42')).toThrow(ValidationError)
			expect(() => num(null)).toThrow(ValidationError)
			expect(() => num(undefined)).toThrow(ValidationError)
			expect(() => num({})).toThrow(ValidationError)
		})

		test('accepts Infinity', () => {
			expect(num(Infinity)).toBe(Infinity)
			expect(num(-Infinity)).toBe(-Infinity)
		})

		test('safe version returns success', () => {
			expect(num.safe!(42)).toEqual({ ok: true, value: 42 })
		})

		test('safe version returns error for NaN', () => {
			expect(num.safe!(NaN)).toEqual({ ok: false, error: 'Expected number' })
		})

		test('safe version returns error for string', () => {
			expect(num.safe!('42')).toEqual({ ok: false, error: 'Expected number' })
		})

		test('Standard Schema support', () => {
			expect(num['~standard']).toBeDefined()
			expect(num['~standard']!.validate(42)).toEqual({ value: 42 })
		})

		test('Standard Schema returns issues for NaN', () => {
			const result = num['~standard']!.validate(NaN)
			expect(result.issues![0].message).toBe('Expected number')
		})

		test('works in pipe', () => {
			const validate = pipe(num, positive, int)
			expect(validate(42)).toBe(42)
			expect(() => validate(-1)).toThrow()
		})

		test('handles negative zero', () => {
			expect(num(-0)).toBe(-0)
		})

		test('handles very large numbers', () => {
			expect(num(Number.MAX_VALUE)).toBe(Number.MAX_VALUE)
			expect(num(Number.MIN_VALUE)).toBe(Number.MIN_VALUE)
		})
	})

	describe('bool', () => {
		test('validates booleans', () => {
			expect(bool(true)).toBe(true)
			expect(bool(false)).toBe(false)
		})

		test('throws on non-booleans', () => {
			expect(() => bool('true')).toThrow(ValidationError)
			expect(() => bool(1)).toThrow(ValidationError)
			expect(() => bool(0)).toThrow(ValidationError)
			expect(() => bool(null)).toThrow(ValidationError)
			expect(() => bool(undefined)).toThrow(ValidationError)
		})

		test('safe version returns success', () => {
			expect(bool.safe!(true)).toEqual({ ok: true, value: true })
			expect(bool.safe!(false)).toEqual({ ok: true, value: false })
		})

		test('safe version returns error', () => {
			expect(bool.safe!('true')).toEqual({ ok: false, error: 'Expected boolean' })
			expect(bool.safe!(1)).toEqual({ ok: false, error: 'Expected boolean' })
		})

		test('Standard Schema support', () => {
			expect(bool['~standard']).toBeDefined()
			expect(bool['~standard']!.validate(true)).toEqual({ value: true })
			expect(bool['~standard']!.validate(false)).toEqual({ value: false })
		})

		test('Standard Schema returns issues', () => {
			const result = bool['~standard']!.validate('true')
			expect(result.issues![0].message).toBe('Expected boolean')
		})

		test('works in pipe', () => {
			const validate = pipe(bool)
			expect(validate(true)).toBe(true)
			expect(() => validate('true')).toThrow()
		})
	})

	describe('bigInt', () => {
		test('validates bigints', () => {
			expect(bigInt(BigInt(123))).toBe(BigInt(123))
			expect(bigInt(BigInt(-123))).toBe(BigInt(-123))
			expect(bigInt(BigInt(0))).toBe(BigInt(0))
		})

		test('throws on non-bigints', () => {
			expect(() => bigInt(123)).toThrow(ValidationError)
			expect(() => bigInt('123')).toThrow(ValidationError)
			expect(() => bigInt(null)).toThrow(ValidationError)
		})

		test('safe version returns success', () => {
			expect(bigInt.safe!(BigInt(123))).toEqual({ ok: true, value: BigInt(123) })
		})

		test('safe version returns error', () => {
			expect(bigInt.safe!(123)).toEqual({ ok: false, error: 'Expected bigint' })
		})

		test('Standard Schema support', () => {
			expect(bigInt['~standard']).toBeDefined()
			expect(bigInt['~standard']!.validate(BigInt(123))).toEqual({ value: BigInt(123) })
		})

		test('Standard Schema returns issues', () => {
			const result = bigInt['~standard']!.validate(123)
			expect(result.issues![0].message).toBe('Expected bigint')
		})

		test('works in pipe', () => {
			const validate = pipe(bigInt)
			expect(validate(BigInt(42))).toBe(BigInt(42))
			expect(() => validate(42)).toThrow()
		})

		test('handles very large bigints', () => {
			const large = BigInt('999999999999999999999999999999')
			expect(bigInt(large)).toBe(large)
		})
	})

	describe('date', () => {
		test('validates Date objects', () => {
			const d = new Date()
			expect(date(d)).toBe(d)
		})

		test('validates specific dates', () => {
			const d = new Date('2024-01-01')
			expect(date(d)).toBe(d)
		})

		test('throws on invalid Date', () => {
			expect(() => date(new Date('invalid'))).toThrow(ValidationError)
		})

		test('throws on non-Date', () => {
			expect(() => date('2024-01-01')).toThrow(ValidationError)
			expect(() => date(Date.now())).toThrow(ValidationError)
			expect(() => date(null)).toThrow(ValidationError)
		})

		test('safe version returns success', () => {
			const d = new Date()
			expect(date.safe!(d)).toEqual({ ok: true, value: d })
		})

		test('safe version returns error for string', () => {
			expect(date.safe!('2024-01-01')).toEqual({ ok: false, error: 'Expected Date' })
		})

		test('safe version returns error for invalid date', () => {
			expect(date.safe!(new Date('invalid'))).toEqual({ ok: false, error: 'Expected Date' })
		})

		test('Standard Schema support', () => {
			expect(date['~standard']).toBeDefined()
			const d = new Date()
			expect(date['~standard']!.validate(d)).toEqual({ value: d })
		})

		test('Standard Schema returns issues', () => {
			const result = date['~standard']!.validate('2024-01-01')
			expect(result.issues![0].message).toBe('Expected Date')
		})

		test('works in pipe', () => {
			const validate = pipe(date)
			const d = new Date()
			expect(validate(d)).toBe(d)
			expect(() => validate('2024-01-01')).toThrow()
		})

		test('handles epoch date', () => {
			const epoch = new Date(0)
			expect(date(epoch)).toBe(epoch)
		})

		test('handles future dates', () => {
			const future = new Date('3000-01-01')
			expect(date(future)).toBe(future)
		})
	})

	describe('arr', () => {
		test('validates arrays', () => {
			expect(arr([1, 2, 3])).toEqual([1, 2, 3])
			expect(arr([])).toEqual([])
			expect(arr(['a', 'b'])).toEqual(['a', 'b'])
		})

		test('throws on non-arrays', () => {
			expect(() => arr({})).toThrow(ValidationError)
			expect(() => arr(null)).toThrow(ValidationError)
			expect(() => arr(undefined)).toThrow(ValidationError)
			expect(() => arr('array')).toThrow(ValidationError)
		})

		test('safe version returns success', () => {
			expect(arr.safe!([1, 2])).toEqual({ ok: true, value: [1, 2] })
		})

		test('safe version returns error', () => {
			expect(arr.safe!({})).toEqual({ ok: false, error: 'Expected array' })
		})

		test('safe version with null', () => {
			expect(arr.safe!(null)).toEqual({ ok: false, error: 'Expected array' })
		})

		test('Standard Schema support', () => {
			expect(arr['~standard']).toBeDefined()
			expect(arr['~standard']!.validate([1, 2])).toEqual({ value: [1, 2] })
		})

		test('Standard Schema returns issues', () => {
			const result = arr['~standard']!.validate({})
			expect(result.issues![0].message).toBe('Expected array')
		})

		test('works in pipe', () => {
			const validate = pipe(arr)
			expect(validate([1, 2, 3])).toEqual([1, 2, 3])
			expect(() => validate({})).toThrow()
		})

		test('handles nested arrays', () => {
			expect(
				arr([
					[1, 2],
					[3, 4],
				])
			).toEqual([
				[1, 2],
				[3, 4],
			])
		})

		test('handles mixed type arrays', () => {
			expect(arr([1, 'two', true, null])).toEqual([1, 'two', true, null])
		})

		test('handles sparse arrays', () => {
			const sparse = [1, , 3]
			expect(arr(sparse)).toEqual(sparse)
		})
	})

	describe('obj', () => {
		test('validates objects', () => {
			expect(obj({ a: 1 })).toEqual({ a: 1 })
			expect(obj({})).toEqual({})
			expect(obj({ nested: { value: true } })).toEqual({ nested: { value: true } })
		})

		test('throws on null', () => {
			expect(() => obj(null)).toThrow(ValidationError)
		})

		test('throws on arrays', () => {
			expect(() => obj([])).toThrow(ValidationError)
		})

		test('throws on primitives', () => {
			expect(() => obj('string')).toThrow(ValidationError)
			expect(() => obj(123)).toThrow(ValidationError)
			expect(() => obj(true)).toThrow(ValidationError)
		})

		test('safe version returns success', () => {
			expect(obj.safe!({ a: 1 })).toEqual({ ok: true, value: { a: 1 } })
		})

		test('safe version returns error for null', () => {
			expect(obj.safe!(null)).toEqual({ ok: false, error: 'Expected object' })
		})

		test('safe version returns error for array', () => {
			expect(obj.safe!([])).toEqual({ ok: false, error: 'Expected object' })
		})

		test('safe version returns error for string', () => {
			expect(obj.safe!('string')).toEqual({ ok: false, error: 'Expected object' })
		})

		test('Standard Schema support', () => {
			expect(obj['~standard']).toBeDefined()
			expect(obj['~standard']!.validate({ a: 1 })).toEqual({ value: { a: 1 } })
		})

		test('Standard Schema returns issues', () => {
			const result = obj['~standard']!.validate(null)
			expect(result.issues![0].message).toBe('Expected object')
		})

		test('works in pipe', () => {
			const validate = pipe(obj)
			expect(validate({ a: 1 })).toEqual({ a: 1 })
			expect(() => validate(null)).toThrow()
		})

		test('handles complex nested objects', () => {
			const complex = {
				name: 'test',
				nested: {
					deep: {
						value: 42,
					},
				},
				array: [1, 2, 3],
			}
			expect(obj(complex)).toEqual(complex)
		})

		test('handles objects with symbol keys', () => {
			const sym = Symbol('test')
			const o = { [sym]: 'value' }
			expect(obj(o)).toBe(o)
		})
	})

	describe('cross-type interactions', () => {
		test('string looks like number', () => {
			expect(() => num('42')).toThrow()
			expect(str('42')).toBe('42')
		})

		test('boolean looks like string', () => {
			expect(() => str(true)).toThrow()
			expect(bool(true)).toBe(true)
		})

		test('array vs object', () => {
			expect(() => obj([1, 2, 3])).toThrow()
			expect(arr([1, 2, 3])).toEqual([1, 2, 3])
		})

		test('null vs object', () => {
			expect(() => obj(null)).toThrow()
		})

		test('date vs string', () => {
			expect(() => str(new Date())).toThrow()
			expect(date(new Date())).toBeInstanceOf(Date)
		})
	})
})
