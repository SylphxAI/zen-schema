import { describe, expect, test } from 'bun:test'
import { $ } from '../src'

describe('Fluent Builder ($)', () => {
	describe('$.string', () => {
		test('basic string validation', () => {
			const schema = $.string.done()
			expect(schema.parse('hello')).toBe('hello')
			expect(() => schema.parse(123)).toThrow()
		})

		test('min/max length', () => {
			const schema = $.string.min(2).max(5).done()
			expect(schema.parse('abc')).toBe('abc')
			expect(() => schema.parse('a')).toThrow()
			expect(() => schema.parse('abcdef')).toThrow()
		})

		test('email (property syntax)', () => {
			const schema = $.string.email.done()
			expect(schema.parse('test@example.com')).toBe('test@example.com')
			expect(() => schema.parse('invalid')).toThrow()
		})

		test('uuid (property syntax)', () => {
			const schema = $.string.uuid.done()
			expect(schema.parse('123e4567-e89b-12d3-a456-426614174000')).toBe('123e4567-e89b-12d3-a456-426614174000')
			expect(() => schema.parse('not-a-uuid')).toThrow()
		})

		test('chained validators', () => {
			const schema = $.string.min(10).email.done()
			expect(schema.parse('test@example.com')).toBe('test@example.com')
			expect(() => schema.parse('a@b.co')).toThrow() // too short (6 chars < 10)
		})

		test('nonempty', () => {
			const schema = $.string.nonempty().done()
			expect(schema.parse('x')).toBe('x')
			expect(() => schema.parse('')).toThrow()
		})

		test('regex', () => {
			const schema = $.string.regex(/^[A-Z]+$/).done()
			expect(schema.parse('ABC')).toBe('ABC')
			expect(() => schema.parse('abc')).toThrow()
		})

		test('startsWith/endsWith/includes', () => {
			const schema = $.string.startsWith('hello').endsWith('world').includes(' ').done()
			expect(schema.parse('hello beautiful world')).toBe('hello beautiful world')
			expect(() => schema.parse('hello world')).not.toThrow()
			expect(() => schema.parse('hi world')).toThrow()
		})
	})

	describe('$.number', () => {
		test('basic number validation', () => {
			const schema = $.number.done()
			expect(schema.parse(42)).toBe(42)
			expect(() => schema.parse('42')).toThrow()
		})

		test('int (property syntax)', () => {
			const schema = $.number.int.done()
			expect(schema.parse(42)).toBe(42)
			expect(() => schema.parse(3.14)).toThrow()
		})

		test('positive/negative (property syntax)', () => {
			const posSchema = $.number.positive.done()
			expect(posSchema.parse(1)).toBe(1)
			expect(() => posSchema.parse(-1)).toThrow()

			const negSchema = $.number.negative.done()
			expect(negSchema.parse(-1)).toBe(-1)
			expect(() => negSchema.parse(1)).toThrow()
		})

		test('min/max', () => {
			const schema = $.number.min(0).max(100).done()
			expect(schema.parse(50)).toBe(50)
			expect(() => schema.parse(-1)).toThrow()
			expect(() => schema.parse(101)).toThrow()
		})

		test('chained validators', () => {
			const schema = $.number.int.positive.max(100).done()
			expect(schema.parse(50)).toBe(50)
			expect(() => schema.parse(3.14)).toThrow()
			expect(() => schema.parse(-1)).toThrow()
			expect(() => schema.parse(101)).toThrow()
		})

		test('multipleOf', () => {
			const schema = $.number.multipleOf(5).done()
			expect(schema.parse(10)).toBe(10)
			expect(() => schema.parse(7)).toThrow()
		})
	})

	describe('Performance', () => {
		const ITERATIONS = 100_000

		test('fluent builder is faster than z.string() chaining', () => {
			// Fluent builder - mutable, no copying
			const fluentStart = performance.now()
			for (let i = 0; i < ITERATIONS; i++) {
				$.string.min(1).max(100).email.done()
			}
			const fluentTime = performance.now() - fluentStart

			// Regular z.string() - immutable, copying arrays
			const { z } = require('../src')
			const zStart = performance.now()
			for (let i = 0; i < ITERATIONS; i++) {
				z.string().min(1).max(100).email()
			}
			const zTime = performance.now() - zStart

			console.log(`Schema creation: z.string() ${zTime.toFixed(2)}ms vs $.string ${fluentTime.toFixed(2)}ms (${(zTime / fluentTime).toFixed(2)}x faster)`)

			// Fluent should be faster
			expect(fluentTime).toBeLessThan(zTime)
		})
	})
})
