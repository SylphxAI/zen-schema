import { SchemaError } from '../errors'
import { extendSchema, type ExtendedSchema } from '../schema-methods'
import type { BaseSchema, Result } from '../types'

const VENDOR = 'zen'

// Type guard
const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean'

// ============================================================
// Boolean Schema Interface
// ============================================================

export interface BooleanSchema extends ExtendedSchema<boolean, boolean> {}

// ============================================================
// Implementation
// ============================================================

function createBooleanSchema(): BooleanSchema {
	const baseSchema: BaseSchema<boolean, boolean> = {
		_input: undefined as boolean,
		_output: undefined as boolean,
		_checks: [],
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
			types: undefined as unknown as { input: boolean; output: boolean },
		},
		parse(data: unknown): boolean {
			const result = this.safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse(data: unknown): Result<boolean> {
			if (!isBoolean(data)) {
				return { success: false, issues: [{ message: 'Expected boolean' }] }
			}
			return { success: true, data }
		},
		parseAsync: async (data: unknown) => baseSchema.parse(data),
		safeParseAsync: async (data: unknown) => baseSchema.safeParse(data),
	}

	return extendSchema(baseSchema) as BooleanSchema
}

/**
 * Create a boolean schema
 */
export function boolean(): BooleanSchema {
	return createBooleanSchema()
}
