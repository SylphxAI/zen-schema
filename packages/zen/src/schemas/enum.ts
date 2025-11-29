import { SchemaError } from '../errors'
import type { BaseSchema, Result } from '../types'

// ============================================================
// Enum Schema
// ============================================================

type EnumValues = readonly [string, ...string[]]

export interface EnumSchema<T extends EnumValues> extends BaseSchema<T[number], T[number]> {
	readonly options: T
	readonly enum: { [K in T[number]]: K }
	exclude<U extends T[number]>(values: readonly U[]): EnumSchema<Exclude<T[number], U>[]>
	extract<U extends T[number]>(values: readonly U[]): EnumSchema<U[]>
	optional(): BaseSchema<T[number] | undefined, T[number] | undefined>
	nullable(): BaseSchema<T[number] | null, T[number] | null>
}

const isString = (v: unknown): v is string => typeof v === 'string'

export function enumSchema<T extends EnumValues>(values: T): EnumSchema<T> {
	const valuesSet = new Set<string>(values)
	const enumObj = Object.fromEntries(values.map((v) => [v, v])) as { [K in T[number]]: K }

	const safeParse = (data: unknown): Result<T[number]> => {
		if (!isString(data)) {
			return { success: false, issues: [{ message: 'Expected string' }] }
		}
		if (!valuesSet.has(data)) {
			return {
				success: false,
				issues: [{ message: `Expected one of: ${values.join(', ')}` }],
			}
		}
		return { success: true, data: data as T[number] }
	}

	const schema: EnumSchema<T> = {
		_input: undefined as T[number],
		_output: undefined as T[number],
		_checks: [],
		options: values,
		enum: enumObj,

		'~standard': {
			version: 1,
			vendor: 'zen',
			validate(value: unknown) {
				const result = safeParse(value)
				if (result.success) return { value: result.data }
				return { issues: result.issues }
			},
			types: undefined as unknown as { input: T[number]; output: T[number] },
		},

		parse(data: unknown): T[number] {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},

		safeParse,

		async parseAsync(data: unknown): Promise<T[number]> {
			return this.parse(data)
		},

		async safeParseAsync(data: unknown): Promise<Result<T[number]>> {
			return safeParse(data)
		},

		exclude<U extends T[number]>(excludeValues: readonly U[]) {
			const excludeSet = new Set(excludeValues)
			const newValues = values.filter((v) => !excludeSet.has(v as U)) as Exclude<T[number], U>[]
			return enumSchema(newValues as unknown as EnumValues) as EnumSchema<Exclude<T[number], U>[]>
		},

		extract<U extends T[number]>(extractValues: readonly U[]) {
			return enumSchema(extractValues as unknown as EnumValues) as EnumSchema<U[]>
		},

		optional() {
			return {
				_input: undefined as T[number] | undefined,
				_output: undefined as T[number] | undefined,
				_checks: [],
				'~standard': {
					version: 1 as const,
					vendor: 'zen',
					validate: (v: unknown) => {
						if (v === undefined) return { value: undefined }
						const result = safeParse(v)
						if (result.success) return { value: result.data }
						return { issues: result.issues }
					},
					types: undefined as unknown as {
						input: T[number] | undefined
						output: T[number] | undefined
					},
				},
				parse: (v: unknown) => (v === undefined ? undefined : schema.parse(v)),
				safeParse: (v: unknown): Result<T[number] | undefined> =>
					v === undefined ? { success: true, data: undefined } : safeParse(v),
				parseAsync: async (v: unknown) => (v === undefined ? undefined : schema.parse(v)),
				safeParseAsync: async (v: unknown): Promise<Result<T[number] | undefined>> =>
					v === undefined ? { success: true, data: undefined } : safeParse(v),
			}
		},

		nullable() {
			return {
				_input: undefined as T[number] | null,
				_output: undefined as T[number] | null,
				_checks: [],
				'~standard': {
					version: 1 as const,
					vendor: 'zen',
					validate: (v: unknown) => {
						if (v === null) return { value: null }
						const result = safeParse(v)
						if (result.success) return { value: result.data }
						return { issues: result.issues }
					},
					types: undefined as unknown as { input: T[number] | null; output: T[number] | null },
				},
				parse: (v: unknown) => (v === null ? null : schema.parse(v)),
				safeParse: (v: unknown): Result<T[number] | null> =>
					v === null ? { success: true, data: null } : safeParse(v),
				parseAsync: async (v: unknown) => (v === null ? null : schema.parse(v)),
				safeParseAsync: async (v: unknown): Promise<Result<T[number] | null>> =>
					v === null ? { success: true, data: null } : safeParse(v),
			}
		},
	}

	return schema
}

export { enumSchema as enum_ }
