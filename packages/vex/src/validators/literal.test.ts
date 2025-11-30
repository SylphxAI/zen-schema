import { describe, expect, test } from 'bun:test'
import { enum_, literal } from './literal'

describe('Literal Validators', () => {
	test('literal validates exact string value', () => {
		const validateAdmin = literal('admin')
		expect(validateAdmin('admin')).toBe('admin')
		expect(() => validateAdmin('user')).toThrow()
		expect(() => validateAdmin('Admin')).toThrow()
	})

	test('literal validates exact boolean value', () => {
		const validateTrue = literal(true)
		expect(validateTrue(true)).toBe(true)
		expect(() => validateTrue(false)).toThrow()
		expect(() => validateTrue('true')).toThrow()
	})

	test('literal validates exact number value', () => {
		const validate42 = literal(42)
		expect(validate42(42)).toBe(42)
		expect(() => validate42(43)).toThrow()
		expect(() => validate42('42')).toThrow()
	})

	test('literal validates null', () => {
		const validateNull = literal(null)
		expect(validateNull(null)).toBe(null)
		expect(() => validateNull(undefined)).toThrow()
	})

	test('literal validates undefined', () => {
		const validateUndefined = literal(undefined)
		expect(validateUndefined(undefined)).toBe(undefined)
		expect(() => validateUndefined(null)).toThrow()
	})
})

describe('Enum Validators', () => {
	test('enum_ validates one of values', () => {
		const validateRole = enum_(['admin', 'user', 'guest'] as const)
		expect(validateRole('admin')).toBe('admin')
		expect(validateRole('user')).toBe('user')
		expect(validateRole('guest')).toBe('guest')
		expect(() => validateRole('superuser')).toThrow()
	})

	test('enum_ with numbers', () => {
		const validateStatus = enum_([200, 404, 500] as const)
		expect(validateStatus(200)).toBe(200)
		expect(validateStatus(404)).toBe(404)
		expect(() => validateStatus(201)).toThrow()
	})

	test('enum_ with mixed types', () => {
		const validateMixed = enum_([1, 'two', true] as const)
		expect(validateMixed(1)).toBe(1)
		expect(validateMixed('two')).toBe('two')
		expect(validateMixed(true)).toBe(true)
		expect(() => validateMixed(false)).toThrow()
	})

	test('safe version returns Result', () => {
		const validateRole = enum_(['admin', 'user'] as const)
		expect(validateRole.safe!('admin')).toEqual({ ok: true, value: 'admin' })
		expect(validateRole.safe!('invalid')).toHaveProperty('ok', false)
	})
})
