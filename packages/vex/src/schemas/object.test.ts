import { describe, expect, test } from 'bun:test'
import { optional } from '../composition/optional'
import { pipe } from '../composition/pipe'
import type { StandardSchemaV1 } from '../core'
import { gte, int } from '../validators/number'
import { num, str } from '../validators/primitives'
import { email, nonempty } from '../validators/string'
import { object, partial, passthrough, strict } from './object'

describe('Object Schema', () => {
	test('object validates shape', () => {
		const validateUser = object({
			name: pipe(str, nonempty),
			age: pipe(num, int, gte(0)),
			email: pipe(str, email),
		})

		const user = validateUser({ name: 'Alice', age: 30, email: 'alice@example.com' })
		expect(user).toEqual({ name: 'Alice', age: 30, email: 'alice@example.com' })
	})

	test('object throws on invalid input', () => {
		const validateUser = object({
			name: str,
			age: num,
		})

		expect(() => validateUser(null)).toThrow('Expected object')
		expect(() => validateUser([])).toThrow('Expected object')
		expect(() => validateUser('string')).toThrow('Expected object')
	})

	test('object throws with path', () => {
		const validateUser = object({
			name: pipe(str, nonempty),
			age: pipe(num, int),
		})

		expect(() => validateUser({ name: '', age: 30 })).toThrow('name: Required')
		expect(() => validateUser({ name: 'Alice', age: '30' })).toThrow('age: Expected number')
	})

	test('object with optional fields', () => {
		const validateUser = object({
			name: str,
			nickname: optional(str),
		})

		expect(validateUser({ name: 'Alice' })).toEqual({ name: 'Alice', nickname: undefined })
		expect(validateUser({ name: 'Alice', nickname: 'Ali' })).toEqual({
			name: 'Alice',
			nickname: 'Ali',
		})
	})

	test('object safe version', () => {
		const validateUser = object({ name: str })
		expect(validateUser.safe!({ name: 'Alice' })).toEqual({ ok: true, value: { name: 'Alice' } })
		expect(validateUser.safe!({ name: 123 })).toHaveProperty('ok', false)
	})

	test('Standard Schema with path', () => {
		const validateUser = object({
			name: str,
			age: num,
		})

		const error = validateUser['~standard']!.validate({ name: 'Alice', age: 'not a number' })
		expect(error).toHaveProperty('issues')
		const issues = (error as StandardSchemaV1.FailureResult).issues
		expect(issues[0]?.path).toEqual(['age'])
		expect(issues[0]?.message).toBe('Expected number')
	})
})

describe('Object Utilities', () => {
	test('partial makes properties optional', () => {
		const validateUser = object({ name: str, age: num })
		const validatePartialUser = partial(validateUser)

		expect(validatePartialUser({})).toEqual({})
		expect(validatePartialUser({ name: 'Alice' })).toEqual({ name: 'Alice' })
	})

	test('passthrough allows extra properties', () => {
		const validateUser = object({ name: str })
		const validateLooseUser = passthrough(validateUser)

		expect(validateLooseUser({ name: 'Alice', extra: 'data' })).toEqual({
			name: 'Alice',
			extra: 'data',
		})
	})

	test('strict is same as base validator', () => {
		const validateUser = object({ name: str })
		const validateStrictUser = strict(validateUser)

		expect(validateStrictUser({ name: 'Alice' })).toEqual({ name: 'Alice' })
	})
})
