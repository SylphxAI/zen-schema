import { describe, expect, test } from 'bun:test'
import { coerce, coerceBigInt, coerceBoolean, coerceDate, coerceNumber, coerceString } from './coerce'

describe('Coerce Transforms', () => {
	describe('coerceString', () => {
		test('coerces to string', () => {
			expect(coerceString(123)).toBe('123')
			expect(coerceString(true)).toBe('true')
			expect(coerceString(null)).toBe('null')
			expect(coerceString(undefined)).toBe('undefined')
		})

		test('safe version', () => {
			expect(coerceString.safe!(123)).toEqual({ ok: true, value: '123' })
		})
	})

	describe('coerceNumber', () => {
		test('coerces to number', () => {
			expect(coerceNumber('42')).toBe(42)
			expect(coerceNumber('3.14')).toBe(3.14)
			expect(coerceNumber(true)).toBe(1)
			expect(coerceNumber(false)).toBe(0)
		})

		test('throws on invalid', () => {
			expect(() => coerceNumber('abc')).toThrow('Cannot coerce to number')
			expect(() => coerceNumber({})).toThrow('Cannot coerce to number')
		})

		test('safe version', () => {
			expect(coerceNumber.safe!('42')).toEqual({ ok: true, value: 42 })
			expect(coerceNumber.safe!('abc')).toEqual({ ok: false, error: 'Cannot coerce to number' })
		})
	})

	describe('coerceBoolean', () => {
		test('coerces to boolean', () => {
			expect(coerceBoolean(1)).toBe(true)
			expect(coerceBoolean(0)).toBe(false)
			expect(coerceBoolean('')).toBe(false)
			expect(coerceBoolean('hello')).toBe(true)
			expect(coerceBoolean(null)).toBe(false)
			expect(coerceBoolean({})).toBe(true)
		})

		test('safe version', () => {
			expect(coerceBoolean.safe!(1)).toEqual({ ok: true, value: true })
			expect(coerceBoolean.safe!(0)).toEqual({ ok: true, value: false })
		})
	})

	describe('coerceDate', () => {
		test('coerces string to Date', () => {
			const date = coerceDate('2024-01-15')
			expect(date.toISOString().startsWith('2024-01-15')).toBe(true)
		})

		test('passes through Date', () => {
			const original = new Date()
			const result = coerceDate(original)
			expect(result).toBe(original)
		})

		test('coerces timestamp', () => {
			const date = coerceDate(1705276800000)
			expect(date instanceof Date).toBe(true)
		})

		test('throws on invalid', () => {
			expect(() => coerceDate('invalid')).toThrow('Cannot coerce to Date')
		})

		test('safe version', () => {
			const result = coerceDate.safe!('2024-01-15')
			expect(result.ok).toBe(true)
			expect(coerceDate.safe!('invalid')).toEqual({ ok: false, error: 'Cannot coerce to Date' })
		})
	})

	describe('coerceBigInt', () => {
		test('coerces to BigInt', () => {
			expect(coerceBigInt(123)).toBe(BigInt(123))
			expect(coerceBigInt('456')).toBe(BigInt(456))
			expect(coerceBigInt(true)).toBe(BigInt(1))
		})

		test('throws on invalid', () => {
			expect(() => coerceBigInt('abc')).toThrow('Cannot coerce to BigInt')
			expect(() => coerceBigInt(3.14)).toThrow('Cannot coerce to BigInt')
		})

		test('safe version', () => {
			expect(coerceBigInt.safe!(123)).toEqual({ ok: true, value: BigInt(123) })
			expect(coerceBigInt.safe!('abc')).toEqual({ ok: false, error: 'Cannot coerce to BigInt' })
		})
	})

	describe('coerce namespace', () => {
		test('has all coercions', () => {
			expect(coerce.string).toBe(coerceString)
			expect(coerce.number).toBe(coerceNumber)
			expect(coerce.boolean).toBe(coerceBoolean)
			expect(coerce.date).toBe(coerceDate)
			expect(coerce.bigint).toBe(coerceBigInt)
		})
	})
})
