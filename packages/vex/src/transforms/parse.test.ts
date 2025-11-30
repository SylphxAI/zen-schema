import { describe, expect, test } from 'bun:test'
import { toDate, toFloat, toInt } from './parse'

describe('Parse Transforms', () => {
	describe('toInt', () => {
		test('parses valid integers', () => {
			expect(toInt('42')).toBe(42)
			expect(toInt('-10')).toBe(-10)
			expect(toInt('0')).toBe(0)
		})

		test('truncates decimals', () => {
			expect(toInt('3.14')).toBe(3)
			expect(toInt('3.99')).toBe(3)
		})

		test('throws on invalid', () => {
			expect(() => toInt('abc')).toThrow('Invalid integer')
			expect(() => toInt('')).toThrow('Invalid integer')
		})

		test('safe version', () => {
			expect(toInt.safe!('42')).toEqual({ ok: true, value: 42 })
			expect(toInt.safe!('abc')).toEqual({ ok: false, error: 'Invalid integer' })
		})
	})

	describe('toFloat', () => {
		test('parses valid floats', () => {
			expect(toFloat('3.14')).toBe(3.14)
			expect(toFloat('42')).toBe(42)
			expect(toFloat('-0.5')).toBe(-0.5)
		})

		test('throws on invalid', () => {
			expect(() => toFloat('abc')).toThrow('Invalid number')
			expect(() => toFloat('')).toThrow('Invalid number')
		})

		test('safe version', () => {
			expect(toFloat.safe!('3.14')).toEqual({ ok: true, value: 3.14 })
			expect(toFloat.safe!('abc')).toEqual({ ok: false, error: 'Invalid number' })
		})
	})

	describe('toDate', () => {
		test('parses valid dates', () => {
			const date = toDate('2024-01-15')
			expect(date.toISOString().startsWith('2024-01-15')).toBe(true)
		})

		test('parses ISO dates', () => {
			const date = toDate('2024-01-15T10:30:00Z')
			expect(date instanceof Date).toBe(true)
		})

		test('throws on invalid', () => {
			expect(() => toDate('invalid')).toThrow('Invalid date')
			expect(() => toDate('not-a-date')).toThrow('Invalid date')
		})

		test('safe version', () => {
			const result = toDate.safe!('2024-01-15')
			expect(result.ok).toBe(true)
			expect(toDate.safe!('invalid')).toEqual({ ok: false, error: 'Invalid date' })
		})
	})
})
