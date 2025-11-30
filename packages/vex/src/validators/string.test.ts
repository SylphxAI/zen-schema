import { describe, expect, test } from 'bun:test'
import { email, endsWith, includes, len, max, min, nonempty, pattern, startsWith, url, uuid } from './string'

describe('String Validators', () => {
	describe('length validators', () => {
		test('min validates minimum length', () => {
			expect(min(3)('abc')).toBe('abc')
			expect(min(3)('abcd')).toBe('abcd')
			expect(() => min(3)('ab')).toThrow()
		})

		test('max validates maximum length', () => {
			expect(max(3)('abc')).toBe('abc')
			expect(max(3)('ab')).toBe('ab')
			expect(() => max(3)('abcd')).toThrow()
		})

		test('len validates exact length', () => {
			expect(len(3)('abc')).toBe('abc')
			expect(() => len(3)('ab')).toThrow()
			expect(() => len(3)('abcd')).toThrow()
		})

		test('nonempty validates non-empty string', () => {
			expect(nonempty('hello')).toBe('hello')
			expect(() => nonempty('')).toThrow()
		})
	})

	describe('format validators', () => {
		test('email validates email format', () => {
			expect(email('test@example.com')).toBe('test@example.com')
			expect(email('user.name@domain.org')).toBe('user.name@domain.org')
			expect(() => email('invalid')).toThrow()
			expect(() => email('missing@domain')).toThrow()
		})

		test('url validates URL format', () => {
			expect(url('https://example.com')).toBe('https://example.com')
			expect(url('http://localhost:3000')).toBe('http://localhost:3000')
			expect(() => url('not-a-url')).toThrow()
			expect(() => url('ftp://invalid')).toThrow()
		})

		test('uuid validates UUID format', () => {
			expect(uuid('123e4567-e89b-12d3-a456-426614174000')).toBeTruthy()
			expect(() => uuid('invalid')).toThrow()
			expect(() => uuid('123e4567-e89b-12d3-a456')).toThrow()
		})

		test('pattern validates regex pattern', () => {
			expect(pattern(/^[A-Z]+$/)('ABC')).toBe('ABC')
			expect(() => pattern(/^[A-Z]+$/)('abc')).toThrow()

			const customMsg = pattern(/^\d+$/, 'Must be digits only')
			expect(customMsg('123')).toBe('123')
			expect(() => customMsg('abc')).toThrow('Must be digits only')
		})
	})

	describe('substring validators', () => {
		test('startsWith validates prefix', () => {
			expect(startsWith('hello')('hello world')).toBe('hello world')
			expect(() => startsWith('hello')('hi world')).toThrow()
		})

		test('endsWith validates suffix', () => {
			expect(endsWith('world')('hello world')).toBe('hello world')
			expect(() => endsWith('world')('hello there')).toThrow()
		})

		test('includes validates substring', () => {
			expect(includes('o w')('hello world')).toBe('hello world')
			expect(() => includes('xyz')('hello world')).toThrow()
		})
	})
})
