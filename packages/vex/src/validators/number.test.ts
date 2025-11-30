import { describe, expect, test } from 'bun:test'
import { finite, gt, gte, int, lt, lte, multipleOf, negative, positive } from './number'

describe('Number Validators', () => {
	describe('type validators', () => {
		test('int validates integers', () => {
			expect(int(42)).toBe(42)
			expect(int(-10)).toBe(-10)
			expect(int(0)).toBe(0)
			expect(() => int(3.14)).toThrow()
			expect(() => int(1.1)).toThrow()
		})

		test('positive validates positive numbers', () => {
			expect(positive(1)).toBe(1)
			expect(positive(0.1)).toBe(0.1)
			expect(() => positive(0)).toThrow()
			expect(() => positive(-1)).toThrow()
		})

		test('negative validates negative numbers', () => {
			expect(negative(-1)).toBe(-1)
			expect(negative(-0.1)).toBe(-0.1)
			expect(() => negative(0)).toThrow()
			expect(() => negative(1)).toThrow()
		})

		test('finite validates finite numbers', () => {
			expect(finite(42)).toBe(42)
			expect(finite(0)).toBe(0)
			expect(() => finite(Infinity)).toThrow()
			expect(() => finite(-Infinity)).toThrow()
		})
	})

	describe('comparison validators', () => {
		test('gte validates >= n', () => {
			expect(gte(5)(5)).toBe(5)
			expect(gte(5)(10)).toBe(10)
			expect(() => gte(5)(4)).toThrow()
		})

		test('lte validates <= n', () => {
			expect(lte(5)(5)).toBe(5)
			expect(lte(5)(0)).toBe(0)
			expect(() => lte(5)(6)).toThrow()
		})

		test('gt validates > n', () => {
			expect(gt(5)(6)).toBe(6)
			expect(() => gt(5)(5)).toThrow()
			expect(() => gt(5)(4)).toThrow()
		})

		test('lt validates < n', () => {
			expect(lt(5)(4)).toBe(4)
			expect(() => lt(5)(5)).toThrow()
			expect(() => lt(5)(6)).toThrow()
		})

		test('multipleOf validates divisibility', () => {
			expect(multipleOf(5)(10)).toBe(10)
			expect(multipleOf(5)(0)).toBe(0)
			expect(multipleOf(3)(9)).toBe(9)
			expect(() => multipleOf(5)(7)).toThrow()
		})
	})
})
