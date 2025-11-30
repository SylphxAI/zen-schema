import { describe, expect, test } from 'bun:test'
import { pipe } from '../composition/pipe'
import type { StandardSchemaV1 } from '../core'
import { int } from '../validators/number'
import { num } from '../validators/primitives'
import { array, exactLength, maxLength, minLength, nonemptyArray } from './array'

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

describe('Array Length Validators', () => {
	test('minLength validates minimum array length', () => {
		const validate = pipe(array(num), minLength(2))
		expect(validate([1, 2])).toEqual([1, 2])
		expect(validate([1, 2, 3])).toEqual([1, 2, 3])
		expect(() => validate([1])).toThrow('Array must have at least 2 items')
		expect(() => validate([])).toThrow()
	})

	test('maxLength validates maximum array length', () => {
		const validate = pipe(array(num), maxLength(3))
		expect(validate([1, 2, 3])).toEqual([1, 2, 3])
		expect(validate([1, 2])).toEqual([1, 2])
		expect(validate([])).toEqual([])
		expect(() => validate([1, 2, 3, 4])).toThrow('Array must have at most 3 items')
	})

	test('exactLength validates exact array length', () => {
		const validate = pipe(array(num), exactLength(3))
		expect(validate([1, 2, 3])).toEqual([1, 2, 3])
		expect(() => validate([1, 2])).toThrow('Array must have exactly 3 items')
		expect(() => validate([1, 2, 3, 4])).toThrow()
	})

	test('nonemptyArray validates non-empty arrays', () => {
		const validate = pipe(array(num), nonemptyArray())
		expect(validate([1])).toEqual([1])
		expect(validate([1, 2, 3])).toEqual([1, 2, 3])
		expect(() => validate([])).toThrow('Array must not be empty')
	})

	test('safe versions work', () => {
		const validate = pipe(array(num), minLength(2))
		expect(validate.safe!([1, 2])).toEqual({ ok: true, value: [1, 2] })
		expect(validate.safe!([1])).toHaveProperty('ok', false)
	})
})
