import { describe, expect, test } from 'bun:test'
import { str } from '../validators/primitives'
import { email } from '../validators/string'
import { nullable, optional, withDefault } from './optional'
import { pipe } from './pipe'

describe('Optional Modifiers', () => {
	describe('optional', () => {
		test('allows undefined', () => {
			const optionalEmail = optional(pipe(str, email))
			expect(optionalEmail('test@example.com')).toBe('test@example.com')
			expect(optionalEmail(undefined)).toBeUndefined()
		})

		test('validates non-undefined values', () => {
			const optionalEmail = optional(pipe(str, email))
			expect(() => optionalEmail('invalid' as unknown)).toThrow()
		})

		test('safe version works', () => {
			const optionalStr = optional(str)
			expect(optionalStr.safe!(undefined)).toEqual({ ok: true, value: undefined })
			expect(optionalStr.safe!('hello')).toEqual({ ok: true, value: 'hello' })
			expect(optionalStr.safe!(123 as unknown)).toHaveProperty('ok', false)
		})

		test('Standard Schema support', () => {
			const optionalStr = optional(str)
			expect(optionalStr['~standard']).toBeDefined()

			const result = optionalStr['~standard']!.validate(undefined)
			expect(result).toEqual({ value: undefined })
		})
	})

	describe('nullable', () => {
		test('allows null', () => {
			const nullableEmail = nullable(pipe(str, email))
			expect(nullableEmail('test@example.com')).toBe('test@example.com')
			expect(nullableEmail(null)).toBeNull()
		})

		test('validates non-null values', () => {
			const nullableEmail = nullable(pipe(str, email))
			expect(() => nullableEmail('invalid' as unknown)).toThrow()
		})

		test('safe version works', () => {
			const nullableStr = nullable(str)
			expect(nullableStr.safe!(null)).toEqual({ ok: true, value: null })
			expect(nullableStr.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})
	})

	describe('withDefault', () => {
		test('provides default for undefined', () => {
			const emailWithDefault = withDefault(pipe(str, email), 'default@example.com')
			expect(emailWithDefault('test@example.com')).toBe('test@example.com')
			expect(emailWithDefault(undefined)).toBe('default@example.com')
		})

		test('validates non-undefined values', () => {
			const emailWithDefault = withDefault(pipe(str, email), 'default@example.com')
			expect(() => emailWithDefault('invalid' as unknown)).toThrow()
		})

		test('safe version works', () => {
			const strWithDefault = withDefault(str, 'fallback')
			expect(strWithDefault.safe!(undefined)).toEqual({ ok: true, value: 'fallback' })
			expect(strWithDefault.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		})
	})
})
