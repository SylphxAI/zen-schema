import { describe, expect, test } from 'bun:test'
import { gte, int, lte } from '../validators/number'
import { num, str } from '../validators/primitives'
import { email } from '../validators/string'
import { pipe } from './pipe'

describe('Pipe Composition', () => {
	test('pipe combines validators', () => {
		const validateEmail = pipe(str, email)
		expect(validateEmail('test@example.com')).toBe('test@example.com')
		expect(() => validateEmail(123)).toThrow()
		expect(() => validateEmail('invalid')).toThrow()
	})

	test('pipe chains multiple validators', () => {
		const validateAge = pipe(num, int, gte(0), lte(150))
		expect(validateAge(25)).toBe(25)
		expect(validateAge(0)).toBe(0)
		expect(validateAge(150)).toBe(150)
		expect(() => validateAge(-1)).toThrow()
		expect(() => validateAge(200)).toThrow()
		expect(() => validateAge(25.5)).toThrow()
	})

	test('pipe with single validator', () => {
		const validateStr = pipe(str)
		expect(validateStr('hello')).toBe('hello')
		expect(() => validateStr(123)).toThrow()
	})

	test('safe version works', () => {
		const validateEmail = pipe(str, email)
		expect(validateEmail.safe!('test@example.com')).toEqual({
			ok: true,
			value: 'test@example.com',
		})
		expect(validateEmail.safe!('invalid')).toHaveProperty('ok', false)
		expect(validateEmail.safe!(123)).toHaveProperty('ok', false)
	})

	test('Standard Schema support', () => {
		const validateEmail = pipe(str, email)
		expect(validateEmail['~standard']).toBeDefined()
		expect(validateEmail['~standard']!.version).toBe(1)

		const result = validateEmail['~standard']!.validate('test@example.com')
		expect(result).toEqual({ value: 'test@example.com' })

		const error = validateEmail['~standard']!.validate('invalid')
		expect(error).toHaveProperty('issues')
	})
})
