// ============================================================
// 🧘 Zen Fluent Builder - Zero-allocation schema building
// ============================================================
//
// This module provides a mutable, lazy schema builder that:
// 1. Collects all checks without creating intermediate schemas
// 2. Only creates the final schema when .done() is called
// 3. Avoids array spreading and object allocation during chaining
//
// Usage:
//   import { $ } from '@sylphx/zen-full'
//   const schema = $.string.min(1).max(100).email.done()
//
// ============================================================

import type { BaseSchema, Check } from './types'
import { createSchema } from './core'

// ============================================================
// Types
// ============================================================

type SchemaType = 'string' | 'number' | 'boolean' | 'bigint' | 'date' | 'symbol'

interface FluentString {
	// Length validators
	min(length: number, message?: string): FluentString
	max(length: number, message?: string): FluentString
	length(length: number, message?: string): FluentString
	nonempty(message?: string): FluentString
	// Format validators (property syntax - no parentheses needed)
	readonly email: FluentString
	readonly url: FluentString
	readonly uuid: FluentString
	readonly ipv4: FluentString
	readonly ipv6: FluentString
	readonly datetime: FluentString
	readonly date: FluentString
	readonly hex: FluentString
	readonly base64: FluentString
	// Pattern
	regex(pattern: RegExp, message?: string): FluentString
	startsWith(prefix: string, message?: string): FluentString
	endsWith(suffix: string, message?: string): FluentString
	includes(search: string, message?: string): FluentString
	// Finalize
	done(): BaseSchema<string, string>
}

interface FluentNumber {
	min(value: number, message?: string): FluentNumber
	max(value: number, message?: string): FluentNumber
	readonly int: FluentNumber
	readonly positive: FluentNumber
	readonly negative: FluentNumber
	readonly finite: FluentNumber
	multipleOf(value: number, message?: string): FluentNumber
	done(): BaseSchema<number, number>
}

// ============================================================
// Validators (same as string.ts but as inline functions)
// ============================================================

const VALIDATORS: Record<string, (v: string) => boolean> = {
	email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
	url: (v) => /^https?:\/\/.+/.test(v),
	uuid: (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v),
	ipv4: (v) => /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v),
	ipv6: (v) => /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/.test(v),
	datetime: (v) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v),
	date: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
	hex: (v) => /^[0-9a-fA-F]+$/.test(v),
	base64: (v) => /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(v),
}

const MESSAGES: Record<string, string> = {
	email: 'Invalid email',
	url: 'Invalid URL',
	uuid: 'Invalid UUID',
	ipv4: 'Invalid IPv4',
	ipv6: 'Invalid IPv6',
	datetime: 'Invalid datetime',
	date: 'Invalid date',
	hex: 'Invalid hex',
	base64: 'Invalid base64',
}

// ============================================================
// Fluent String Builder
// ============================================================

function createFluentString(): FluentString {
	// Mutable array - no copying!
	const checks: Check<string>[] = []

	const addCheck = (check: Check<string>) => {
		checks.push(check) // Mutate in place
		return builder
	}

	const builder: FluentString = {
		min(length: number, message?: string) {
			return addCheck({
				name: 'min',
				check: (v) => v.length >= length,
				message: message ?? `Min ${length} chars`,
			})
		},

		max(length: number, message?: string) {
			return addCheck({
				name: 'max',
				check: (v) => v.length <= length,
				message: message ?? `Max ${length} chars`,
			})
		},

		length(len: number, message?: string) {
			return addCheck({
				name: 'length',
				check: (v) => v.length === len,
				message: message ?? `Must be ${len} chars`,
			})
		},

		nonempty(message?: string) {
			return addCheck({
				name: 'nonempty',
				check: (v) => v.length > 0,
				message: message ?? 'Required',
			})
		},

		regex(pattern: RegExp, message?: string) {
			return addCheck({
				name: 'regex',
				check: (v) => pattern.test(v),
				message: message ?? 'Invalid format',
			})
		},

		startsWith(prefix: string, message?: string) {
			return addCheck({
				name: 'startsWith',
				check: (v) => v.startsWith(prefix),
				message: message ?? `Must start with "${prefix}"`,
			})
		},

		endsWith(suffix: string, message?: string) {
			return addCheck({
				name: 'endsWith',
				check: (v) => v.endsWith(suffix),
				message: message ?? `Must end with "${suffix}"`,
			})
		},

		includes(search: string, message?: string) {
			return addCheck({
				name: 'includes',
				check: (v) => v.includes(search),
				message: message ?? `Must include "${search}"`,
			})
		},

		// Getters for no-arg validators (cleaner syntax)
		get email() {
			return addCheck({ name: 'email', check: VALIDATORS.email!, message: MESSAGES.email! })
		},
		get url() {
			return addCheck({ name: 'url', check: VALIDATORS.url!, message: MESSAGES.url! })
		},
		get uuid() {
			return addCheck({ name: 'uuid', check: VALIDATORS.uuid!, message: MESSAGES.uuid! })
		},
		get ipv4() {
			return addCheck({ name: 'ipv4', check: VALIDATORS.ipv4!, message: MESSAGES.ipv4! })
		},
		get ipv6() {
			return addCheck({ name: 'ipv6', check: VALIDATORS.ipv6!, message: MESSAGES.ipv6! })
		},
		get datetime() {
			return addCheck({ name: 'datetime', check: VALIDATORS.datetime!, message: MESSAGES.datetime! })
		},
		get date() {
			return addCheck({ name: 'date', check: VALIDATORS.date!, message: MESSAGES.date! })
		},
		get hex() {
			return addCheck({ name: 'hex', check: VALIDATORS.hex!, message: MESSAGES.hex! })
		},
		get base64() {
			return addCheck({ name: 'base64', check: VALIDATORS.base64!, message: MESSAGES.base64! })
		},

		done() {
			return createSchema<string>('string', (v): v is string => typeof v === 'string', checks)
		},
	}

	return builder
}

// ============================================================
// Fluent Number Builder
// ============================================================

function createFluentNumber(): FluentNumber {
	const checks: Check<number>[] = []

	const addCheck = (check: Check<number>) => {
		checks.push(check)
		return builder
	}

	const builder: FluentNumber = {
		min(value: number, message?: string) {
			return addCheck({
				name: 'min',
				check: (v) => v >= value,
				message: message ?? `Min ${value}`,
			})
		},

		max(value: number, message?: string) {
			return addCheck({
				name: 'max',
				check: (v) => v <= value,
				message: message ?? `Max ${value}`,
			})
		},

		get int() {
			return addCheck({
				name: 'int',
				check: (v) => Number.isInteger(v),
				message: 'Must be integer',
			})
		},

		get positive() {
			return addCheck({
				name: 'positive',
				check: (v) => v > 0,
				message: 'Must be positive',
			})
		},

		get negative() {
			return addCheck({
				name: 'negative',
				check: (v) => v < 0,
				message: 'Must be negative',
			})
		},

		get finite() {
			return addCheck({
				name: 'finite',
				check: (v) => Number.isFinite(v),
				message: 'Must be finite',
			})
		},

		multipleOf(value: number, message?: string) {
			return addCheck({
				name: 'multipleOf',
				check: (v) => v % value === 0,
				message: message ?? `Must be multiple of ${value}`,
			})
		},

		done() {
			return createSchema<number>(
				'number',
				(v): v is number => typeof v === 'number' && !Number.isNaN(v),
				checks
			)
		},
	}

	return builder
}

// ============================================================
// Fluent Builder Entry Point
// ============================================================

/**
 * Fluent schema builder with zero-allocation chaining
 *
 * @example
 * // Property syntax for common validators (no parentheses!)
 * const emailSchema = $.string.email.done()
 * const idSchema = $.string.uuid.done()
 *
 * // Method syntax for parameterized validators
 * const nameSchema = $.string.min(1).max(100).done()
 *
 * // Mix both
 * const schema = $.string.min(5).email.done()
 *
 * // Numbers
 * const ageSchema = $.number.int.positive.done()
 */
export const $ = {
	/** Start building a string schema */
	get string(): FluentString {
		return createFluentString()
	},

	/** Start building a number schema */
	get number(): FluentNumber {
		return createFluentNumber()
	},
} as const

// Also export individual builders
export { createFluentString, createFluentNumber }
export type { FluentString, FluentNumber }
