import { SchemaError } from './errors'
import type { BaseSchema, Issue, Result } from './types'

const VENDOR = 'zen'

// ============================================================
// Extended Schema with chainable methods
// ============================================================

export interface ExtendedSchema<TInput, TOutput> extends BaseSchema<TInput, TOutput> {
	/** Make schema optional (undefined allowed) */
	optional(): ExtendedSchema<TInput | undefined, TOutput | undefined>
	/** Make schema nullable (null allowed) */
	nullable(): ExtendedSchema<TInput | null, TOutput | null>
	/** Make schema nullish (null or undefined allowed) */
	nullish(): ExtendedSchema<TInput | null | undefined, TOutput | null | undefined>
	/** Provide default value for undefined */
	default(value: TOutput | (() => TOutput)): ExtendedSchema<TInput | undefined, TOutput>
	/** Add custom validation */
	refine(
		check: (value: TOutput) => boolean,
		message?: string | { message: string }
	): ExtendedSchema<TInput, TOutput>
	/** Transform output */
	transform<TNew>(fn: (value: TOutput) => TNew): ExtendedSchema<TInput, TNew>
	/** Catch errors and return default */
	catch(defaultValue: TOutput | (() => TOutput)): ExtendedSchema<TInput, TOutput>
	/** Add description */
	describe(description: string): ExtendedSchema<TInput, TOutput>
	/** Union shorthand */
	or<T extends BaseSchema<unknown, unknown>>(
		schema: T
	): ExtendedSchema<TInput | T['_input'], TOutput | T['_output']>
	/** Description (Zod compat) */
	readonly description?: string
}

// ============================================================
// Wrap schema with chainable methods
// ============================================================

export function extendSchema<TInput, TOutput>(
	schema: BaseSchema<TInput, TOutput>
): ExtendedSchema<TInput, TOutput> {
	const extended: ExtendedSchema<TInput, TOutput> = {
		_input: schema._input,
		_output: schema._output,
		_checks: schema._checks,
		'~standard': schema['~standard'],
		description: undefined,

		parse(data: unknown): TOutput {
			return schema.parse(data)
		},

		safeParse(data: unknown): Result<TOutput> {
			return schema.safeParse(data)
		},

		parseAsync(data: unknown): Promise<TOutput> {
			return schema.parseAsync(data)
		},

		safeParseAsync(data: unknown): Promise<Result<TOutput>> {
			return schema.safeParseAsync(data)
		},

		optional() {
			const optSchema: BaseSchema<TInput | undefined, TOutput | undefined> = {
				_input: undefined as TInput | undefined,
				_output: undefined as TOutput | undefined,
				_checks: [],
				'~standard': {
					version: 1,
					vendor: VENDOR,
					validate: (v: unknown) => {
						const result = optSchema.safeParse(v)
						if (result.success) return { value: result.data }
						return { issues: result.issues }
					},
					types: undefined as unknown as {
						input: TInput | undefined
						output: TOutput | undefined
					},
				},
				parse: (v: unknown) => (v === undefined ? undefined : schema.parse(v)),
				safeParse: (v: unknown) =>
					v === undefined
						? { success: true, data: undefined }
						: (schema.safeParse(v) as Result<TOutput | undefined>),
				parseAsync: async (v: unknown) => (v === undefined ? undefined : schema.parse(v)),
				safeParseAsync: async (v: unknown) =>
					v === undefined
						? { success: true, data: undefined }
						: (schema.safeParse(v) as Result<TOutput | undefined>),
			}
			return extendSchema(optSchema)
		},

		nullable() {
			const nullSchema: BaseSchema<TInput | null, TOutput | null> = {
				_input: undefined as TInput | null,
				_output: undefined as TOutput | null,
				_checks: [],
				'~standard': {
					version: 1,
					vendor: VENDOR,
					validate: (v: unknown) => {
						const result = nullSchema.safeParse(v)
						if (result.success) return { value: result.data }
						return { issues: result.issues }
					},
					types: undefined as unknown as { input: TInput | null; output: TOutput | null },
				},
				parse: (v: unknown) => (v === null ? null : schema.parse(v)),
				safeParse: (v: unknown) =>
					v === null
						? { success: true, data: null }
						: (schema.safeParse(v) as Result<TOutput | null>),
				parseAsync: async (v: unknown) => (v === null ? null : schema.parse(v)),
				safeParseAsync: async (v: unknown) =>
					v === null
						? { success: true, data: null }
						: (schema.safeParse(v) as Result<TOutput | null>),
			}
			return extendSchema(nullSchema)
		},

		nullish() {
			const nullishSchema: BaseSchema<TInput | null | undefined, TOutput | null | undefined> = {
				_input: undefined as TInput | null | undefined,
				_output: undefined as TOutput | null | undefined,
				_checks: [],
				'~standard': {
					version: 1,
					vendor: VENDOR,
					validate: (v: unknown) => {
						const result = nullishSchema.safeParse(v)
						if (result.success) return { value: result.data }
						return { issues: result.issues }
					},
					types: undefined as unknown as {
						input: TInput | null | undefined
						output: TOutput | null | undefined
					},
				},
				parse: (v: unknown) => (v == null ? (v as null | undefined) : schema.parse(v)),
				safeParse: (v: unknown) =>
					v == null
						? { success: true, data: v as null | undefined }
						: (schema.safeParse(v) as Result<TOutput | null | undefined>),
				parseAsync: async (v: unknown) =>
					v == null ? (v as null | undefined) : schema.parse(v),
				safeParseAsync: async (v: unknown) =>
					v == null
						? { success: true, data: v as null | undefined }
						: (schema.safeParse(v) as Result<TOutput | null | undefined>),
			}
			return extendSchema(nullishSchema)
		},

		default(defaultValue: TOutput | (() => TOutput)) {
			const getDefault = (): TOutput =>
				typeof defaultValue === 'function' ? (defaultValue as () => TOutput)() : defaultValue

			const defSchema: BaseSchema<TInput | undefined, TOutput> = {
				_input: undefined as TInput | undefined,
				_output: undefined as TOutput,
				_checks: [],
				'~standard': {
					version: 1,
					vendor: VENDOR,
					validate: (v: unknown) => {
						const result = defSchema.safeParse(v)
						if (result.success) return { value: result.data }
						return { issues: result.issues }
					},
					types: undefined as unknown as { input: TInput | undefined; output: TOutput },
				},
				parse: (v: unknown) => (v === undefined ? getDefault() : schema.parse(v)),
				safeParse: (v: unknown) =>
					v === undefined ? { success: true, data: getDefault() } : schema.safeParse(v),
				parseAsync: async (v: unknown) => (v === undefined ? getDefault() : schema.parse(v)),
				safeParseAsync: async (v: unknown) =>
					v === undefined ? { success: true, data: getDefault() } : schema.safeParse(v),
			}
			return extendSchema(defSchema)
		},

		refine(
			check: (value: TOutput) => boolean,
			message?: string | { message: string }
		) {
			const msg = typeof message === 'object' ? message.message : message ?? 'Invalid value'

			const refineSchema: BaseSchema<TInput, TOutput> = {
				_input: undefined as TInput,
				_output: undefined as TOutput,
				_checks: schema._checks,
				'~standard': {
					version: 1,
					vendor: VENDOR,
					validate: (v: unknown) => {
						const result = refineSchema.safeParse(v)
						if (result.success) return { value: result.data }
						return { issues: result.issues }
					},
					types: undefined as unknown as { input: TInput; output: TOutput },
				},
				parse(data: unknown): TOutput {
					const result = this.safeParse(data)
					if (result.success) return result.data
					throw new SchemaError(result.issues)
				},
				safeParse(data: unknown): Result<TOutput> {
					const result = schema.safeParse(data)
					if (!result.success) return result
					if (!check(result.data)) {
						return { success: false, issues: [{ message: msg }] }
					}
					return result
				},
				parseAsync: async (data: unknown) => refineSchema.parse(data),
				safeParseAsync: async (data: unknown) => refineSchema.safeParse(data),
			}
			return extendSchema(refineSchema)
		},

		transform<TNew>(fn: (value: TOutput) => TNew) {
			const transformSchema: BaseSchema<TInput, TNew> = {
				_input: undefined as TInput,
				_output: undefined as TNew,
				_checks: schema._checks,
				'~standard': {
					version: 1,
					vendor: VENDOR,
					validate: (v: unknown) => {
						const result = transformSchema.safeParse(v)
						if (result.success) return { value: result.data }
						return { issues: result.issues }
					},
					types: undefined as unknown as { input: TInput; output: TNew },
				},
				parse(data: unknown): TNew {
					const result = this.safeParse(data)
					if (result.success) return result.data
					throw new SchemaError(result.issues)
				},
				safeParse(data: unknown): Result<TNew> {
					const result = schema.safeParse(data)
					if (!result.success) return result as unknown as Result<TNew>
					try {
						return { success: true, data: fn(result.data) }
					} catch (e) {
						const message = e instanceof Error ? e.message : 'Transform failed'
						return { success: false, issues: [{ message }] }
					}
				},
				parseAsync: async (data: unknown) => transformSchema.parse(data),
				safeParseAsync: async (data: unknown) => transformSchema.safeParse(data),
			}
			return extendSchema(transformSchema)
		},

		catch(defaultValue: TOutput | (() => TOutput)) {
			const getDefault = (): TOutput =>
				typeof defaultValue === 'function' ? (defaultValue as () => TOutput)() : defaultValue

			const catchSchema: BaseSchema<TInput, TOutput> = {
				_input: undefined as TInput,
				_output: undefined as TOutput,
				_checks: [],
				'~standard': {
					version: 1,
					vendor: VENDOR,
					validate: (v: unknown) => {
						const result = catchSchema.safeParse(v)
						if (result.success) return { value: result.data }
						return { issues: result.issues }
					},
					types: undefined as unknown as { input: TInput; output: TOutput },
				},
				parse: (v: unknown) => {
					const result = schema.safeParse(v)
					return result.success ? result.data : getDefault()
				},
				safeParse: (v: unknown) => {
					const result = schema.safeParse(v)
					return result.success ? result : { success: true, data: getDefault() }
				},
				parseAsync: async (v: unknown) => catchSchema.parse(v),
				safeParseAsync: async (v: unknown) => catchSchema.safeParse(v),
			}
			return extendSchema(catchSchema)
		},

		describe(description: string) {
			const described = extendSchema(schema)
			;(described as { description: string }).description = description
			return described
		},

		or<T extends BaseSchema<unknown, unknown>>(other: T) {
			type CombinedInput = TInput | T['_input']
			type CombinedOutput = TOutput | T['_output']

			const orSchema: BaseSchema<CombinedInput, CombinedOutput> = {
				_input: undefined as CombinedInput,
				_output: undefined as CombinedOutput,
				_checks: [],
				'~standard': {
					version: 1,
					vendor: VENDOR,
					validate: (v: unknown) => {
						const result = orSchema.safeParse(v)
						if (result.success) return { value: result.data }
						return { issues: result.issues }
					},
					types: undefined as unknown as { input: CombinedInput; output: CombinedOutput },
				},
				parse(data: unknown): CombinedOutput {
					const result = this.safeParse(data)
					if (result.success) return result.data
					throw new SchemaError(result.issues)
				},
				safeParse(data: unknown): Result<CombinedOutput> {
					const result1 = schema.safeParse(data)
					if (result1.success) return result1 as Result<CombinedOutput>
					const result2 = other.safeParse(data)
					if (result2.success) return result2 as Result<CombinedOutput>
					return {
						success: false,
						issues: [{ message: 'Value does not match any type in union' }],
					}
				},
				parseAsync: async (data: unknown) => orSchema.parse(data),
				safeParseAsync: async (data: unknown) => orSchema.safeParse(data),
			}
			return extendSchema(orSchema)
		},
	}

	return extended
}
