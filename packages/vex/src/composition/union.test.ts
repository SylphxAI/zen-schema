import { describe, expect, test } from 'bun:test'
import { object } from '../schemas/object'
import { literal } from '../validators/literal'
import { bool, num, str } from '../validators/primitives'
import { discriminatedUnion, union } from './union'

describe('Union', () => {
	test('union validates one of schemas', () => {
		const validateStringOrNumber = union([str, num])
		expect(validateStringOrNumber('hello')).toBe('hello')
		expect(validateStringOrNumber(42)).toBe(42)
		expect(() => validateStringOrNumber(true)).toThrow()
	})

	test('union tries schemas in order', () => {
		const validateStrOrNum = union([str, num])
		// String should match first
		expect(validateStrOrNum('42')).toBe('42')
	})

	test('union with three types', () => {
		const validate = union([str, num, bool])
		expect(validate('hello')).toBe('hello')
		expect(validate(42)).toBe(42)
		expect(validate(true)).toBe(true)
		expect(() => validate(null)).toThrow()
	})

	test('safe version returns Result', () => {
		const validate = union([str, num])
		expect(validate.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		expect(validate.safe!(42)).toEqual({ ok: true, value: 42 })
		expect(validate.safe!(true)).toHaveProperty('ok', false)
	})

	test('Standard Schema support', () => {
		const validate = union([str, num])
		expect(validate['~standard']).toBeDefined()

		const result = validate['~standard']!.validate('hello')
		expect(result).toEqual({ value: 'hello' })

		const error = validate['~standard']!.validate(true)
		expect(error).toHaveProperty('issues')
	})
})

describe('Discriminated Union', () => {
	test('discriminatedUnion validates based on discriminator', () => {
		const validateShape = discriminatedUnion('type', [
			object({ type: literal('circle'), radius: num }),
			object({ type: literal('square'), side: num }),
		])

		expect(validateShape({ type: 'circle', radius: 10 })).toEqual({ type: 'circle', radius: 10 })
		expect(validateShape({ type: 'square', side: 5 })).toEqual({ type: 'square', side: 5 })
		expect(() => validateShape({ type: 'triangle', base: 10 })).toThrow()
	})

	test('discriminatedUnion rejects non-objects', () => {
		const validate = discriminatedUnion('type', [object({ type: literal('a'), value: num })])
		expect(() => validate('not an object')).toThrow()
		expect(() => validate(null)).toThrow()
		expect(() => validate([1, 2, 3])).toThrow()
	})

	test('safe version returns Result', () => {
		const validate = discriminatedUnion('type', [object({ type: literal('success'), data: str })])

		expect(validate.safe!({ type: 'success', data: 'ok' })).toEqual({
			ok: true,
			value: { type: 'success', data: 'ok' },
		})
		expect(validate.safe!({ type: 'error' })).toHaveProperty('ok', false)
	})
})
