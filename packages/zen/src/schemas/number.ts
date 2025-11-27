import { SchemaError } from '../errors'
import { extendSchema, type ExtendedSchema } from '../schema-methods'
import type { BaseSchema, Check, Issue, Result } from '../types'

const VENDOR = 'zen'

// Type guard
const isNumber = (v: unknown): v is number => typeof v === 'number' && !Number.isNaN(v)

// ============================================================
// Number Schema Interface
// ============================================================

export interface NumberSchema extends ExtendedSchema<number, number> {
	min(value: number, message?: string): NumberSchema
	max(value: number, message?: string): NumberSchema
	int(message?: string): NumberSchema
	positive(message?: string): NumberSchema
	negative(message?: string): NumberSchema
	nonnegative(message?: string): NumberSchema
	nonpositive(message?: string): NumberSchema
	multipleOf(value: number, message?: string): NumberSchema
	finite(message?: string): NumberSchema
	safe(message?: string): NumberSchema
	gt(value: number, message?: string): NumberSchema
	gte(value: number, message?: string): NumberSchema
	lt(value: number, message?: string): NumberSchema
	lte(value: number, message?: string): NumberSchema
	step(value: number, message?: string): NumberSchema
}

// ============================================================
// Implementation
// ============================================================

interface NumberCheck {
	name: string
	check: (v: number) => boolean
	message: string
}

function createNumberSchema(checks: NumberCheck[] = []): NumberSchema {
	const baseSchema: BaseSchema<number, number> = {
		_input: undefined as number,
		_output: undefined as number,
		_checks: checks as Check<number>[],
		'~standard': {
			version: 1,
			vendor: VENDOR,
			validate(value: unknown) {
				const result = baseSchema.safeParse(value)
				if (result.success) return { value: result.data }
				return {
					issues: result.issues.map((i) => ({
						message: i.message,
						path: i.path ? [...i.path] : undefined,
					})),
				}
			},
			types: undefined as unknown as { input: number; output: number },
		},
		parse(data: unknown): number {
			const result = this.safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse(data: unknown): Result<number> {
			if (!isNumber(data)) {
				return { success: false, issues: [{ message: 'Expected number' }] }
			}

			let issues: Issue[] | null = null
			for (const check of checks) {
				if (!check.check(data)) {
					if (!issues) issues = []
					issues.push({ message: check.message })
				}
			}

			if (issues) return { success: false, issues }
			return { success: true, data }
		},
		parseAsync: async (data: unknown) => baseSchema.parse(data),
		safeParseAsync: async (data: unknown) => baseSchema.safeParse(data),
	}

	const extended = extendSchema(baseSchema)

	const addCheck = (check: NumberCheck): NumberSchema => {
		return createNumberSchema([...checks, check])
	}

	const schema: NumberSchema = Object.assign(extended, {
		min(value: number, message?: string) {
			return addCheck({
				name: 'min',
				check: (v) => v >= value,
				message: message ?? `Must be at least ${value}`,
			})
		},

		max(value: number, message?: string) {
			return addCheck({
				name: 'max',
				check: (v) => v <= value,
				message: message ?? `Must be at most ${value}`,
			})
		},

		gt(value: number, message?: string) {
			return addCheck({
				name: 'gt',
				check: (v) => v > value,
				message: message ?? `Must be greater than ${value}`,
			})
		},

		gte(value: number, message?: string) {
			return this.min(value, message)
		},

		lt(value: number, message?: string) {
			return addCheck({
				name: 'lt',
				check: (v) => v < value,
				message: message ?? `Must be less than ${value}`,
			})
		},

		lte(value: number, message?: string) {
			return this.max(value, message)
		},

		int(message?: string) {
			return addCheck({
				name: 'int',
				check: (v) => Number.isInteger(v),
				message: message ?? 'Must be an integer',
			})
		},

		positive(message?: string) {
			return addCheck({
				name: 'positive',
				check: (v) => v > 0,
				message: message ?? 'Must be positive',
			})
		},

		negative(message?: string) {
			return addCheck({
				name: 'negative',
				check: (v) => v < 0,
				message: message ?? 'Must be negative',
			})
		},

		nonnegative(message?: string) {
			return addCheck({
				name: 'nonnegative',
				check: (v) => v >= 0,
				message: message ?? 'Must be non-negative',
			})
		},

		nonpositive(message?: string) {
			return addCheck({
				name: 'nonpositive',
				check: (v) => v <= 0,
				message: message ?? 'Must be non-positive',
			})
		},

		multipleOf(value: number, message?: string) {
			return addCheck({
				name: 'multipleOf',
				check: (v) => v % value === 0,
				message: message ?? `Must be a multiple of ${value}`,
			})
		},

		step(value: number, message?: string) {
			return this.multipleOf(value, message)
		},

		finite(message?: string) {
			return addCheck({
				name: 'finite',
				check: (v) => Number.isFinite(v),
				message: message ?? 'Must be finite',
			})
		},

		safe(message?: string) {
			return addCheck({
				name: 'safe',
				check: (v) => Number.isSafeInteger(v),
				message: message ?? 'Must be a safe integer',
			})
		},
	})

	return schema
}

/**
 * Create a number schema
 */
export function number(): NumberSchema {
	return createNumberSchema()
}
