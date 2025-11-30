import { describe, expect, test } from 'bun:test'
import { pipe } from '../composition/pipe'
import type { StandardSchemaV1 } from '../core'
import { int } from '../validators/number'
import { num } from '../validators/primitives'
import { array } from './array'

describe('Array Schema', () => {
	test('array validates items', () => {
		const validateNumbers = array(num)
		expect(validateNumbers([1, 2, 3])).toEqual([1, 2, 3])
		expect(validateNumbers([])).toEqual([])
	})

	test('array with composed validators', () => {
		const validateIntegers = array(pipe(num, int))
		expect(validateIntegers([1, 2, 3])).toEqual([1, 2, 3])
		expect(() => validateIntegers([1, 2.5, 3])).toThrow('[1]: Must be integer')
	})

	test('array throws on invalid input', () => {
		const validateNumbers = array(num)
		expect(() => validateNumbers({})).toThrow('Expected array')
		expect(() => validateNumbers('string')).toThrow('Expected array')
		expect(() => validateNumbers(null)).toThrow('Expected array')
	})

	test('array throws with path', () => {
		const validateNumbers = array(num)
		expect(() => validateNumbers([1, 'two', 3])).toThrow('[1]: Expected number')
	})

	test('array safe version', () => {
		const validateNumbers = array(num)
		expect(validateNumbers.safe!([1, 2, 3])).toEqual({ ok: true, value: [1, 2, 3] })
		expect(validateNumbers.safe!([1, 'two', 3])).toHaveProperty('ok', false)
		expect(validateNumbers.safe!({})).toEqual({ ok: false, error: 'Expected array' })
	})

	test('Standard Schema with path', () => {
		const validateNumbers = array(num)

		const error = validateNumbers['~standard']!.validate([1, 2, 'three', 4])
		expect(error).toHaveProperty('issues')
		const issues = (error as StandardSchemaV1.FailureResult).issues
		expect(issues[0]?.path).toEqual([2])
		expect(issues[0]?.message).toBe('Expected number')
	})

	test('nested array Standard Schema path', () => {
		const validateNestedNumbers = array(array(num))

		const error = validateNestedNumbers['~standard']!.validate([
			[1, 2],
			[3, 'four'],
		])
		expect(error).toHaveProperty('issues')
		const issues = (error as StandardSchemaV1.FailureResult).issues
		expect(issues[0]?.path).toEqual([1, 1])
	})
})
