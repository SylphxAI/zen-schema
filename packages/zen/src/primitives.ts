import { SchemaError } from './errors'
import type { BaseSchema, Result } from './types'
import { extendSchema, type ExtendedSchema } from './schema-methods'

const VENDOR = 'zen'

// ============================================================
// Primitive Schemas
// ============================================================

function createPrimitiveSchema<T>(
	name: string,
	check: (v: unknown) => v is T
): ExtendedSchema<T, T> {
	const schema: BaseSchema<T, T> = {
		_input: undefined as T,
		_output: undefined as T,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: VENDOR,
			validate(value: unknown) {
				const result = schema.safeParse(value)
				if (result.success) return { value: result.data }
				return {
					issues: result.issues.map((i) => ({
						message: i.message,
						path: i.path ? [...i.path] : undefined,
					})),
				}
			},
			types: undefined as unknown as { input: T; output: T },
		},
		parse(data: unknown): T {
			const result = this.safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse(data: unknown): Result<T> {
			if (!check(data)) {
				return { success: false, issues: [{ message: `Expected ${name}` }] }
			}
			return { success: true, data }
		},
		parseAsync: async (data: unknown) => schema.parse(data),
		safeParseAsync: async (data: unknown) => schema.safeParse(data),
	}
	return extendSchema(schema)
}

/** Schema that accepts any value */
export function any(): ExtendedSchema<unknown, unknown> {
	return createPrimitiveSchema('any', (_v): _v is unknown => true)
}

/** Schema that accepts unknown values */
export function unknown(): ExtendedSchema<unknown, unknown> {
	return createPrimitiveSchema('unknown', (_v): _v is unknown => true)
}

/** Schema that never matches */
export function never(): ExtendedSchema<never, never> {
	const schema: BaseSchema<never, never> = {
		_input: undefined as never,
		_output: undefined as never,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: VENDOR,
			validate() {
				return { issues: [{ message: 'Expected never' }] }
			},
			types: undefined as unknown as { input: never; output: never },
		},
		parse(): never {
			throw new SchemaError([{ message: 'Expected never' }])
		},
		safeParse(): Result<never> {
			return { success: false, issues: [{ message: 'Expected never' }] }
		},
		parseAsync: async () => schema.parse(),
		safeParseAsync: async () => schema.safeParse(),
	}
	return extendSchema(schema)
}

/** Schema for void (undefined) */
export function void_(): ExtendedSchema<void, void> {
	return createPrimitiveSchema('void', (v): v is void => v === undefined)
}

/** Schema for null */
export function null_(): ExtendedSchema<null, null> {
	return createPrimitiveSchema('null', (v): v is null => v === null)
}

/** Schema for undefined */
export function undefined_(): ExtendedSchema<undefined, undefined> {
	return createPrimitiveSchema('undefined', (v): v is undefined => v === undefined)
}

/** Schema for NaN */
export function nan(): ExtendedSchema<number, number> {
	return createPrimitiveSchema('nan', (v): v is number => typeof v === 'number' && Number.isNaN(v))
}

/** Schema for bigint */
export function bigint(): ExtendedSchema<bigint, bigint> {
	return createPrimitiveSchema('bigint', (v): v is bigint => typeof v === 'bigint')
}

/** Schema for symbol */
export function symbol(): ExtendedSchema<symbol, symbol> {
	return createPrimitiveSchema('symbol', (v): v is symbol => typeof v === 'symbol')
}

// ============================================================
// Date Schema
// ============================================================

export interface DateSchema extends ExtendedSchema<Date, Date> {
	min(date: Date, message?: string): DateSchema
	max(date: Date, message?: string): DateSchema
}

export function date(): DateSchema {
	const isDate = (v: unknown): v is Date => v instanceof Date && !Number.isNaN(v.getTime())

	const createDateSchema = (checks: Array<{ check: (d: Date) => boolean; message: string }> = []): DateSchema => {
		const baseSchema: BaseSchema<Date, Date> = {
			_input: undefined as Date,
			_output: undefined as Date,
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
				types: undefined as unknown as { input: Date; output: Date },
			},
			parse(data: unknown): Date {
				const result = this.safeParse(data)
				if (result.success) return result.data
				throw new SchemaError(result.issues)
			},
			safeParse(data: unknown): Result<Date> {
				if (!isDate(data)) {
					return { success: false, issues: [{ message: 'Expected valid Date' }] }
				}
				for (const check of checks) {
					if (!check.check(data)) {
						return { success: false, issues: [{ message: check.message }] }
					}
				}
				return { success: true, data }
			},
			parseAsync: async (data: unknown) => baseSchema.parse(data),
			safeParseAsync: async (data: unknown) => baseSchema.safeParse(data),
		}

		const extended = extendSchema(baseSchema) as DateSchema

		extended.min = (minDate: Date, message?: string) => {
			return createDateSchema([
				...checks,
				{
					check: (d) => d >= minDate,
					message: message ?? `Date must be after ${minDate.toISOString()}`,
				},
			])
		}

		extended.max = (maxDate: Date, message?: string) => {
			return createDateSchema([
				...checks,
				{
					check: (d) => d <= maxDate,
					message: message ?? `Date must be before ${maxDate.toISOString()}`,
				},
			])
		}

		return extended
	}

	return createDateSchema()
}

// ============================================================
// Lazy Schema (for recursive types)
// ============================================================

export function lazy<T extends BaseSchema<unknown, unknown>>(
	getter: () => T
): ExtendedSchema<T['_input'], T['_output']> {
	type TInput = T['_input']
	type TOutput = T['_output']

	const schema: BaseSchema<TInput, TOutput> = {
		_input: undefined as TInput,
		_output: undefined as TOutput,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: VENDOR,
			validate(value: unknown) {
				const result = schema.safeParse(value)
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
			return getter().parse(data) as TOutput
		},
		safeParse(data: unknown): Result<TOutput> {
			return getter().safeParse(data) as Result<TOutput>
		},
		parseAsync: async (data: unknown) => getter().parse(data) as TOutput,
		safeParseAsync: async (data: unknown) => getter().safeParse(data) as Result<TOutput>,
	}
	return extendSchema(schema)
}

// ============================================================
// Discriminated Union
// ============================================================

type AnySchema = BaseSchema<unknown, unknown>

export function discriminatedUnion<
	K extends string,
	T extends readonly [AnySchema, AnySchema, ...AnySchema[]]
>(
	discriminator: K,
	options: T
): ExtendedSchema<T[number]['_input'], T[number]['_output']> {
	type TInput = T[number]['_input']
	type TOutput = T[number]['_output']

	// Build a map of discriminator value -> schema for O(1) lookup
	const schemaMap = new Map<unknown, AnySchema>()
	for (const opt of options) {
		// Try to extract the discriminator value from the schema's shape
		const shape = (opt as { shape?: Record<string, AnySchema> }).shape
		if (shape && shape[discriminator]) {
			const discSchema = shape[discriminator]
			const value = (discSchema as { value?: unknown }).value
			if (value !== undefined) {
				schemaMap.set(value, opt)
			}
		}
	}

	const schema: BaseSchema<TInput, TOutput> = {
		_input: undefined as TInput,
		_output: undefined as TOutput,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: VENDOR,
			validate(value: unknown) {
				const result = schema.safeParse(value)
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
			if (typeof data !== 'object' || data === null) {
				return { success: false, issues: [{ message: 'Expected object' }] }
			}

			const discValue = (data as Record<string, unknown>)[discriminator]
			const matchedSchema = schemaMap.get(discValue)

			if (matchedSchema) {
				return matchedSchema.safeParse(data) as Result<TOutput>
			}

			// Fallback: try each schema
			for (const opt of options) {
				const result = opt.safeParse(data)
				if (result.success) return result as Result<TOutput>
			}

			return {
				success: false,
				issues: [{ message: `Invalid discriminator value for "${discriminator}"` }],
			}
		},
		parseAsync: async (data: unknown) => schema.parse(data),
		safeParseAsync: async (data: unknown) => schema.safeParse(data),
	}
	return extendSchema(schema)
}

// ============================================================
// instanceof
// ============================================================

export function instanceof_<T extends abstract new (...args: unknown[]) => unknown>(
	cls: T
): ExtendedSchema<InstanceType<T>, InstanceType<T>> {
	type TInstance = InstanceType<T>
	return createPrimitiveSchema(
		cls.name,
		(v): v is TInstance => v instanceof cls
	)
}

// ============================================================
// Preprocess
// ============================================================

export function preprocess<T extends BaseSchema<unknown, unknown>>(
	preprocessor: (data: unknown) => unknown,
	schema: T
): ExtendedSchema<unknown, T['_output']> {
	type TOutput = T['_output']

	const ppSchema: BaseSchema<unknown, TOutput> = {
		_input: undefined as unknown,
		_output: undefined as TOutput,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: VENDOR,
			validate(value: unknown) {
				const result = ppSchema.safeParse(value)
				if (result.success) return { value: result.data }
				return {
					issues: result.issues.map((i) => ({
						message: i.message,
						path: i.path ? [...i.path] : undefined,
					})),
				}
			},
			types: undefined as unknown as { input: unknown; output: TOutput },
		},
		parse(data: unknown): TOutput {
			return schema.parse(preprocessor(data)) as TOutput
		},
		safeParse(data: unknown): Result<TOutput> {
			try {
				const processed = preprocessor(data)
				return schema.safeParse(processed) as Result<TOutput>
			} catch (e) {
				const message = e instanceof Error ? e.message : 'Preprocess failed'
				return { success: false, issues: [{ message }] }
			}
		},
		parseAsync: async (data: unknown) => ppSchema.parse(data),
		safeParseAsync: async (data: unknown) => ppSchema.safeParse(data),
	}
	return extendSchema(ppSchema)
}
