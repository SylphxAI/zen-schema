import { describe, expect, test } from 'bun:test'
import { num, str } from '../validators/primitives'
import { catchError, refine, transform } from './refine'

describe('Refine', () => {
	test('refine adds custom validation', () => {
		const evenNumber = refine(num, (n) => n % 2 === 0, 'Must be even')
		expect(evenNumber(4)).toBe(4)
		expect(evenNumber(0)).toBe(0)
		expect(() => evenNumber(3)).toThrow('Must be even')
	})

	test('refine with default message', () => {
		const positive = refine(num, (n) => n > 0)
		expect(positive(5)).toBe(5)
		expect(() => positive(-1)).toThrow('Validation failed')
	})

	test('refine safe version', () => {
		const evenNumber = refine(num, (n) => n % 2 === 0, 'Must be even')
		expect(evenNumber.safe!(4)).toEqual({ ok: true, value: 4 })
		expect(evenNumber.safe!(3)).toEqual({ ok: false, error: 'Must be even' })
		expect(evenNumber.safe!('not a number')).toHaveProperty('ok', false)
	})
})

describe('Transform', () => {
	test('transform modifies value', () => {
		const doubled = transform(num, (n) => n * 2)
		expect(doubled(5)).toBe(10)
		expect(doubled(0)).toBe(0)
	})

	test('transform with string', () => {
		const upperStr = transform(str, (s) => s.toUpperCase())
		expect(upperStr('hello')).toBe('HELLO')
	})

	test('transform changes type', () => {
		const numToStr = transform(num, (n) => n.toString())
		expect(numToStr(42)).toBe('42')
	})

	test('transform safe version', () => {
		const doubled = transform(num, (n) => n * 2)
		expect(doubled.safe!(5)).toEqual({ ok: true, value: 10 })
		expect(doubled.safe!('not a number')).toHaveProperty('ok', false)
	})

	test('transform handles transform errors', () => {
		const willThrow = transform(num, () => {
			throw new Error('Transform error')
		})
		expect(willThrow.safe!(5)).toEqual({ ok: false, error: 'Transform error' })
	})
})

describe('CatchError', () => {
	test('catchError provides fallback on error', () => {
		const safeNum = catchError(num, 0)
		expect(safeNum(42)).toBe(42)
		expect(safeNum('invalid')).toBe(0)
		expect(safeNum(null)).toBe(0)
	})

	test('catchError safe version always succeeds', () => {
		const safeNum = catchError(num, 0)
		expect(safeNum.safe!(42)).toEqual({ ok: true, value: 42 })
		expect(safeNum.safe!('invalid')).toEqual({ ok: true, value: 0 })
	})

	test('catchError with string default', () => {
		const safeStr = catchError(str, 'fallback')
		expect(safeStr('hello')).toBe('hello')
		expect(safeStr(123)).toBe('fallback')
	})
})
