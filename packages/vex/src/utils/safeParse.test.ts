import { describe, expect, test } from 'bun:test'
import { pipe } from '../composition/pipe'
import { num, str } from '../validators/primitives'
import { email } from '../validators/string'
import { safeParse, tryParse } from './safeParse'

describe('Safe Parse Utilities', () => {
	describe('tryParse', () => {
		test('returns value on success', () => {
			const tryEmail = tryParse(pipe(str, email))
			expect(tryEmail('test@example.com')).toBe('test@example.com')
		})

		test('returns null on error', () => {
			const tryEmail = tryParse(pipe(str, email))
			expect(tryEmail('invalid')).toBeNull()
			expect(tryEmail(123 as unknown as string)).toBeNull()
		})

		test('works with simple validators', () => {
			const tryNum = tryParse(num)
			expect(tryNum(42)).toBe(42)
			expect(tryNum('not a number')).toBeNull()
		})
	})

	describe('safeParse', () => {
		test('returns success result', () => {
			const safeEmail = safeParse(pipe(str, email))
			const result = safeEmail('test@example.com')
			expect(result).toEqual({ success: true, data: 'test@example.com' })
		})

		test('returns error result', () => {
			const safeEmail = safeParse(pipe(str, email))
			const result = safeEmail('invalid')
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error).toBe('Invalid email')
			}
		})

		test('includes error message', () => {
			const safeNum = safeParse(num)
			const result = safeNum('not a number')
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error).toBe('Expected number')
			}
		})

		test('works with simple validators', () => {
			const safeStr = safeParse(str)
			expect(safeStr('hello')).toEqual({ success: true, data: 'hello' })
			expect(safeStr(123).success).toBe(false)
		})
	})
})
