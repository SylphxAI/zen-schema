import { describe, expect, test } from 'bun:test'
import { ValidationError } from '../core'
import { arr, bigInt, bool, date, num, obj, str } from './primitives'

describe('Primitive Validators', () => {
	test('str validates strings', () => {
		expect(str('hello')).toBe('hello')
		expect(() => str(123)).toThrow(ValidationError)
		expect(() => str(null)).toThrow(ValidationError)
	})

	test('num validates numbers', () => {
		expect(num(42)).toBe(42)
		expect(num(3.14)).toBe(3.14)
		expect(() => num('42')).toThrow(ValidationError)
		expect(() => num(NaN)).toThrow(ValidationError)
	})

	test('bool validates booleans', () => {
		expect(bool(true)).toBe(true)
		expect(bool(false)).toBe(false)
		expect(() => bool('true')).toThrow(ValidationError)
		expect(() => bool(1)).toThrow(ValidationError)
	})

	test('bigInt validates bigints', () => {
		expect(bigInt(BigInt(123))).toBe(BigInt(123))
		expect(() => bigInt(123)).toThrow(ValidationError)
	})

	test('date validates Date objects', () => {
		const d = new Date()
		expect(date(d)).toBe(d)
		expect(() => date('2024-01-01')).toThrow(ValidationError)
		expect(() => date(new Date('invalid'))).toThrow(ValidationError)
	})

	test('arr validates arrays', () => {
		expect(arr([1, 2, 3])).toEqual([1, 2, 3])
		expect(arr([])).toEqual([])
		expect(() => arr({})).toThrow(ValidationError)
		expect(() => arr(null)).toThrow(ValidationError)
	})

	test('obj validates objects', () => {
		expect(obj({ a: 1 })).toEqual({ a: 1 })
		expect(obj({})).toEqual({})
		expect(() => obj(null)).toThrow(ValidationError)
		expect(() => obj([])).toThrow(ValidationError)
		expect(() => obj('string')).toThrow(ValidationError)
	})

	test('safe versions return Result', () => {
		expect(str.safe!('hello')).toEqual({ ok: true, value: 'hello' })
		expect(str.safe!(123)).toEqual({ ok: false, error: 'Expected string' })

		expect(num.safe!(42)).toEqual({ ok: true, value: 42 })
		expect(num.safe!('42')).toEqual({ ok: false, error: 'Expected number' })
	})

	test('Standard Schema support', () => {
		expect(str['~standard']).toBeDefined()
		expect(str['~standard']!.version).toBe(1)
		expect(str['~standard']!.vendor).toBe('vex')

		const result = str['~standard']!.validate('hello')
		expect(result).toEqual({ value: 'hello' })

		const error = str['~standard']!.validate(123)
		expect(error).toHaveProperty('issues')
	})
})
