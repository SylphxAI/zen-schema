import { describe, expect, test } from 'bun:test'
import { pipe } from '../composition/pipe'
import type { StandardSchemaV1 } from '../core'
import { positive } from '../validators/number'
import { num, str } from '../validators/primitives'
import { nonempty } from '../validators/string'
import { record } from './record'

describe('Record Schema', () => {
	test('record validates dynamic keys', () => {
		const validateScores = record(str, num)
		expect(validateScores({ alice: 100, bob: 90 })).toEqual({ alice: 100, bob: 90 })
		expect(validateScores({})).toEqual({})
	})

	test('record validates values', () => {
		const validateScores = record(str, num)
		expect(() => validateScores({ alice: 'hundred' })).toThrow('[alice]: Expected number')
	})

	test('record with composed validators', () => {
		const validateData = record(pipe(str, nonempty), pipe(num, positive))
		expect(validateData({ score: 100 })).toEqual({ score: 100 })
		expect(() => validateData({ score: -1 })).toThrow('[score]: Must be positive')
	})

	test('record throws on non-object', () => {
		const validateScores = record(str, num)
		expect(() => validateScores(null)).toThrow('Expected object')
		expect(() => validateScores([])).toThrow('Expected object')
		expect(() => validateScores('string')).toThrow('Expected object')
	})

	test('record safe version', () => {
		const validateScores = record(str, num)
		expect(validateScores.safe!({ a: 1, b: 2 })).toEqual({ ok: true, value: { a: 1, b: 2 } })
		expect(validateScores.safe!({ a: 'one' })).toHaveProperty('ok', false)
		expect(validateScores.safe!(null)).toEqual({ ok: false, error: 'Expected object' })
	})

	test('Standard Schema with path', () => {
		const validateScores = record(str, num)

		const error = validateScores['~standard']!.validate({ alice: 100, bob: 'not a number' })
		expect(error).toHaveProperty('issues')
		const issues = (error as StandardSchemaV1.FailureResult).issues
		expect(issues[0]?.path).toEqual(['bob'])
		expect(issues[0]?.message).toBe('Expected number')
	})
})
