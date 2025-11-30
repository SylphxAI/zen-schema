import { describe, expect, test } from 'bun:test'
import type { StandardSchemaV1 } from '../core'
import { bool, num, str } from '../validators/primitives'
import { tuple } from './tuple'

describe('Tuple Schema', () => {
	test('tuple validates fixed-length array', () => {
		const validatePoint = tuple([num, num])
		expect(validatePoint([1, 2])).toEqual([1, 2])
		expect(validatePoint([0, 0])).toEqual([0, 0])
	})

	test('tuple validates different types', () => {
		const validateEntry = tuple([str, num, bool])
		expect(validateEntry(['name', 42, true])).toEqual(['name', 42, true])
	})

	test('tuple throws on wrong length', () => {
		const validatePoint = tuple([num, num])
		expect(() => validatePoint([1])).toThrow('Expected 2 items, got 1')
		expect(() => validatePoint([1, 2, 3])).toThrow('Expected 2 items, got 3')
	})

	test('tuple throws on invalid types', () => {
		const validatePoint = tuple([num, num])
		expect(() => validatePoint(['1', 2])).toThrow('[0]: Expected number')
		expect(() => validatePoint([1, '2'])).toThrow('[1]: Expected number')
	})

	test('tuple throws on non-array', () => {
		const validatePoint = tuple([num, num])
		expect(() => validatePoint({})).toThrow('Expected array')
		expect(() => validatePoint(null)).toThrow('Expected array')
	})

	test('tuple safe version', () => {
		const validatePoint = tuple([num, num])
		expect(validatePoint.safe!([1, 2])).toEqual({ ok: true, value: [1, 2] })
		expect(validatePoint.safe!([1])).toHaveProperty('ok', false)
		expect(validatePoint.safe!([1, 'two'])).toHaveProperty('ok', false)
	})

	test('Standard Schema with path', () => {
		const validateEntry = tuple([str, num, bool])

		const error = validateEntry['~standard']!.validate(['name', 'not a number', true])
		expect(error).toHaveProperty('issues')
		const issues = (error as StandardSchemaV1.FailureResult).issues
		expect(issues[0]?.path).toEqual([1])
		expect(issues[0]?.message).toBe('Expected number')
	})
})
