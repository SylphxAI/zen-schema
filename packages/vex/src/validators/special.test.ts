import { describe, expect, test } from 'bun:test'
import { any, never, nullType, undefinedType, unknown, voidType } from './special'

describe('Special Validators', () => {
	test('any accepts anything', () => {
		expect(any(123)).toBe(123)
		expect(any('hello')).toBe('hello')
		expect(any(null)).toBe(null)
		expect(any(undefined)).toBe(undefined)
		expect(any({ foo: 'bar' })).toEqual({ foo: 'bar' })
	})

	test('unknown accepts anything', () => {
		expect(unknown(123)).toBe(123)
		expect(unknown('hello')).toBe('hello')
		expect(unknown(null)).toBe(null)
	})

	test('never always fails', () => {
		expect(() => never('anything')).toThrow('Value not allowed')
		expect(() => never(null)).toThrow()
		expect(() => never(undefined)).toThrow()
	})

	test('voidType accepts undefined only', () => {
		expect(voidType(undefined)).toBe(undefined)
		expect(() => voidType(null)).toThrow()
		expect(() => voidType('')).toThrow()
		expect(() => voidType(0)).toThrow()
	})

	test('nullType accepts null only', () => {
		expect(nullType(null)).toBe(null)
		expect(() => nullType(undefined)).toThrow()
		expect(() => nullType('')).toThrow()
	})

	test('undefinedType accepts undefined only', () => {
		expect(undefinedType(undefined)).toBe(undefined)
		expect(() => undefinedType(null)).toThrow()
		expect(() => undefinedType('')).toThrow()
	})

	test('safe versions work correctly', () => {
		expect(any.safe!(123)).toEqual({ ok: true, value: 123 })
		expect(never.safe!('test')).toEqual({ ok: false, error: 'Value not allowed' })
		expect(nullType.safe!(null)).toEqual({ ok: true, value: null })
		expect(nullType.safe!(undefined)).toHaveProperty('ok', false)
	})
})
