import { describe, expect, test } from 'bun:test'
import { pipe } from '../composition/pipe'
import { str } from '../validators/primitives'
import { email } from '../validators/string'
import { lower, trim, upper } from './string'

describe('String Transforms', () => {
	test('trim removes whitespace', () => {
		expect(trim('  hello  ')).toBe('hello')
		expect(trim('\n\thello\n\t')).toBe('hello')
		expect(trim('hello')).toBe('hello')
	})

	test('lower converts to lowercase', () => {
		expect(lower('HELLO')).toBe('hello')
		expect(lower('HeLLo WoRLd')).toBe('hello world')
		expect(lower('hello')).toBe('hello')
	})

	test('upper converts to uppercase', () => {
		expect(upper('hello')).toBe('HELLO')
		expect(upper('HeLLo WoRLd')).toBe('HELLO WORLD')
		expect(upper('HELLO')).toBe('HELLO')
	})

	test('transforms in pipe', () => {
		const normalizeEmail = pipe(str, trim, lower, email)
		expect(normalizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com')
	})

	test('safe versions work', () => {
		expect(trim.safe!('  hello  ')).toEqual({ ok: true, value: 'hello' })
		expect(lower.safe!('HELLO')).toEqual({ ok: true, value: 'hello' })
		expect(upper.safe!('hello')).toEqual({ ok: true, value: 'HELLO' })
	})
})
