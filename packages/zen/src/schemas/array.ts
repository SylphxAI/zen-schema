import { SchemaError } from '../errors'
import { extendSchema, type ExtendedSchema } from '../schema-methods'
import type { BaseSchema, Check, Issue, Result } from '../types'

const VENDOR = 'zen'

// ============================================================
// Array Schema Types
// ============================================================

type AnySchema = BaseSchema<unknown, unknown>

// ============================================================
// Array Schema Interface
// ============================================================

export interface ArraySchema<T extends AnySchema>
	extends ExtendedSchema<T['_input'][], T['_output'][]> {
	readonly element: T
	min(length: number, message?: string): ArraySchema<T>
	max(length: number, message?: string): ArraySchema<T>
	length(length: number, message?: string): ArraySchema<T>
	nonempty(message?: string): ArraySchema<T>
}

// ============================================================
// Implementation
// ============================================================

interface ArrayCheck<T> {
	name: string
	check: (v: T[]) => boolean
	message: string
}

function createArraySchema<T extends AnySchema>(
	element: T,
	checks: ArrayCheck<T['_input']>[] = []
): ArraySchema<T> {
	type TInput = T['_input'][]
	type TOutput = T['_output'][]

	const isArray = (v: unknown): v is TInput => Array.isArray(v)

	const baseSchema: BaseSchema<TInput, TOutput> = {
		_input: undefined as TInput,
		_output: undefined as TOutput,
		_checks: checks as Check<TInput>[],
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
			types: undefined as unknown as { input: TInput; output: TOutput },
		},
		parse(data: unknown): TOutput {
			const result = this.safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse(data: unknown): Result<TOutput> {
			if (!isArray(data)) {
				return { success: false, issues: [{ message: 'Expected array' }] }
			}

			// Run array-level checks
			for (const check of checks) {
				if (!check.check(data)) {
					return { success: false, issues: [{ message: check.message }] }
				}
			}

			// Validate each element - lazy allocate issues and output
			let issues: Issue[] | null = null
			let output: T['_output'][] | null = null
			let hasTransform = false

			for (let i = 0; i < data.length; i++) {
				const item = data[i]
				const result = element.safeParse(item)
				if (result.success) {
					if (result.data !== item || hasTransform) {
						if (!output) {
							output = data.slice(0, i) as T['_output'][]
						}
						output.push(result.data)
						hasTransform = true
					} else if (output) {
						output.push(result.data)
					}
				} else {
					if (!issues) issues = []
					for (const issue of result.issues) {
						issues.push({
							message: issue.message,
							path: [i, ...(issue.path ?? [])],
						})
					}
				}
			}

			if (issues) {
				return { success: false, issues }
			}

			return { success: true, data: (output ?? data) as TOutput }
		},
		parseAsync: async (data: unknown) => baseSchema.parse(data),
		safeParseAsync: async (data: unknown) => baseSchema.safeParse(data),
	}

	const extended = extendSchema(baseSchema)

	const addCheck = (check: ArrayCheck<T['_input']>): ArraySchema<T> => {
		return createArraySchema(element, [...checks, check])
	}

	const schema: ArraySchema<T> = Object.assign(extended, {
		element,

		min(length: number, message?: string) {
			return addCheck({
				name: 'min',
				check: (v) => v.length >= length,
				message: message ?? `Array must have at least ${length} elements`,
			})
		},

		max(length: number, message?: string) {
			return addCheck({
				name: 'max',
				check: (v) => v.length <= length,
				message: message ?? `Array must have at most ${length} elements`,
			})
		},

		length(len: number, message?: string) {
			return addCheck({
				name: 'length',
				check: (v) => v.length === len,
				message: message ?? `Array must have exactly ${len} elements`,
			})
		},

		nonempty(message?: string) {
			return this.min(1, message ?? 'Array must not be empty')
		},
	})

	return schema
}

/**
 * Create an array schema
 */
export function array<T extends AnySchema>(element: T): ArraySchema<T> {
	return createArraySchema(element)
}
