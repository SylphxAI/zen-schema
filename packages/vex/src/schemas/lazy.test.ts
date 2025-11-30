import { describe, expect, test } from 'bun:test'
import type { Parser } from '../core'
import { num, str } from '../validators/primitives'
import { array } from './array'
import { lazy } from './lazy'
import { object } from './object'

describe('Lazy Schema', () => {
	test('lazy enables recursive schemas', () => {
		type Node = { value: number; children: Node[] }
		const nodeValidator: Parser<Node> = lazy(() =>
			object({
				value: num,
				children: array(nodeValidator),
			})
		)

		const tree = {
			value: 1,
			children: [
				{ value: 2, children: [] },
				{ value: 3, children: [{ value: 4, children: [] }] },
			],
		}

		expect(nodeValidator(tree)).toEqual(tree)
	})

	test('lazy validates simple case', () => {
		const lazyStr = lazy(() => str)
		expect(lazyStr('hello')).toBe('hello')
		expect(() => lazyStr(123)).toThrow()
	})

	test('lazy caches validator', () => {
		let callCount = 0
		const lazyStr = lazy(() => {
			callCount++
			return str
		})

		lazyStr('a')
		lazyStr('b')
		lazyStr('c')

		expect(callCount).toBe(1)
	})

	test('lazy safe version', () => {
		type Node = { value: number; children: Node[] }
		const nodeValidator: Parser<Node> = lazy(() =>
			object({
				value: num,
				children: array(nodeValidator),
			})
		)

		expect(nodeValidator.safe!({ value: 1, children: [] })).toEqual({
			ok: true,
			value: { value: 1, children: [] },
		})
		expect(nodeValidator.safe!({ value: 'not a number', children: [] })).toHaveProperty('ok', false)
	})

	test('Standard Schema support', () => {
		const lazyStr = lazy(() => str)
		expect(lazyStr['~standard']).toBeDefined()

		const result = lazyStr['~standard']!.validate('hello')
		expect(result).toEqual({ value: 'hello' })
	})
})
