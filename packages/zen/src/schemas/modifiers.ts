import { SchemaError } from '../errors'
import type { AnySchema, BaseSchema, Result } from '../types'

// ============================================================
// Refine - Add custom validation
// ============================================================

export interface RefinedSchema<TInput, TOutput> extends BaseSchema<TInput, TOutput> {
	refine(
		check: (data: TOutput) => boolean,
		message?: string | ((data: TOutput) => string)
	): RefinedSchema<TInput, TOutput>
	transform<TNew>(fn: (data: TOutput) => TNew): RefinedSchema<TInput, TNew>
}

export function refine<TInput, TOutput>(
	schema: BaseSchema<TInput, TOutput>,
	check: (data: TOutput) => boolean,
	message: string | ((data: TOutput) => string) = 'Validation failed'
): RefinedSchema<TInput, TOutput> {
	const safeParse = (data: unknown): Result<TOutput> => {
		const result = schema.safeParse(data)
		if (!result.success) return result

		if (!check(result.data)) {
			const msg = typeof message === 'function' ? message(result.data) : message
			return { success: false, issues: [{ message: msg }] }
		}

		return result
	}

	const refined: RefinedSchema<TInput, TOutput> = {
		_input: undefined as TInput,
		_output: undefined as TOutput,
		_checks: [],

		'~standard': {
			version: 1,
			vendor: 'zen',
			validate(value: unknown) {
				const result = safeParse(value)
				if (result.success) return { value: result.data }
				return { issues: result.issues }
			},
			types: undefined as unknown as { input: TInput; output: TOutput },
		},

		parse(data: unknown): TOutput {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},

		safeParse,

		async parseAsync(data: unknown): Promise<TOutput> {
			return this.parse(data)
		},

		async safeParseAsync(data: unknown): Promise<Result<TOutput>> {
			return safeParse(data)
		},

		refine(
			newCheck: (data: TOutput) => boolean,
			newMessage?: string | ((data: TOutput) => string)
		): RefinedSchema<TInput, TOutput> {
			return refine(refined, newCheck, newMessage)
		},

		transform<TNew>(fn: (data: TOutput) => TNew): RefinedSchema<TInput, TNew> {
			return transform(refined, fn)
		},
	}

	return refined
}

// ============================================================
// Transform - Transform output value
// ============================================================

export function transform<TInput, TOutput, TNew>(
	schema: BaseSchema<TInput, TOutput>,
	fn: (data: TOutput) => TNew
): RefinedSchema<TInput, TNew> {
	const safeParse = (data: unknown): Result<TNew> => {
		const result = schema.safeParse(data)
		if (!result.success) return result as unknown as Result<TNew>

		try {
			const transformed = fn(result.data)
			return { success: true, data: transformed }
		} catch (e) {
			return {
				success: false,
				issues: [{ message: e instanceof Error ? e.message : 'Transform failed' }],
			}
		}
	}

	const transformed: RefinedSchema<TInput, TNew> = {
		_input: undefined as TInput,
		_output: undefined as TNew,
		_checks: [],

		'~standard': {
			version: 1,
			vendor: 'zen',
			validate(value: unknown) {
				const result = safeParse(value)
				if (result.success) return { value: result.data }
				return { issues: result.issues }
			},
			types: undefined as unknown as { input: TInput; output: TNew },
		},

		parse(data: unknown): TNew {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},

		safeParse,

		async parseAsync(data: unknown): Promise<TNew> {
			return this.parse(data)
		},

		async safeParseAsync(data: unknown): Promise<Result<TNew>> {
			return safeParse(data)
		},

		refine(
			check: (data: TNew) => boolean,
			message?: string | ((data: TNew) => string)
		): RefinedSchema<TInput, TNew> {
			return refine(transformed, check, message)
		},

		transform<TNext>(nextFn: (data: TNew) => TNext): RefinedSchema<TInput, TNext> {
			return transform(transformed, nextFn)
		},
	}

	return transformed
}

// ============================================================
// Default - Provide default value
// ============================================================

export function withDefault<TInput, TOutput>(
	schema: BaseSchema<TInput, TOutput>,
	defaultValue: TOutput | (() => TOutput)
): BaseSchema<TInput | undefined, TOutput> {
	const getDefault = (): TOutput =>
		typeof defaultValue === 'function' ? (defaultValue as () => TOutput)() : defaultValue

	const safeParse = (data: unknown): Result<TOutput> => {
		if (data === undefined) {
			return { success: true, data: getDefault() }
		}
		return schema.safeParse(data)
	}

	return {
		_input: undefined as TInput | undefined,
		_output: undefined as TOutput,
		_checks: [],

		'~standard': {
			version: 1,
			vendor: 'zen',
			validate(value: unknown) {
				const result = safeParse(value)
				if (result.success) return { value: result.data }
				return { issues: result.issues }
			},
			types: undefined as unknown as { input: TInput | undefined; output: TOutput },
		},

		parse(data: unknown): TOutput {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},

		safeParse,

		async parseAsync(data: unknown): Promise<TOutput> {
			return this.parse(data)
		},

		async safeParseAsync(data: unknown): Promise<Result<TOutput>> {
			return safeParse(data)
		},
	}
}

// ============================================================
// Coerce - Coerce input to target type
// ============================================================

export const coerce = {
	string(): BaseSchema<unknown, string> {
		const safeParse = (data: unknown): Result<string> => {
			try {
				return { success: true, data: String(data) }
			} catch {
				return { success: false, issues: [{ message: 'Failed to coerce to string' }] }
			}
		}

		return {
			_input: undefined as unknown,
			_output: undefined as string,
			_checks: [],
			'~standard': {
				version: 1,
				vendor: 'zen',
				validate: (v) => {
					const result = safeParse(v)
					if (result.success) return { value: result.data }
					return { issues: result.issues }
				},
				types: undefined as unknown as { input: unknown; output: string },
			},
			parse: (data) => {
				const result = safeParse(data)
				if (result.success) return result.data
				throw new SchemaError(result.issues)
			},
			safeParse,
			parseAsync: async (data) => safeParse(data).data!,
			safeParseAsync: async (data) => safeParse(data),
		}
	},

	number(): BaseSchema<unknown, number> {
		const safeParse = (data: unknown): Result<number> => {
			const num = Number(data)
			if (Number.isNaN(num)) {
				return { success: false, issues: [{ message: 'Failed to coerce to number' }] }
			}
			return { success: true, data: num }
		}

		return {
			_input: undefined as unknown,
			_output: undefined as number,
			_checks: [],
			'~standard': {
				version: 1,
				vendor: 'zen',
				validate: (v) => {
					const result = safeParse(v)
					if (result.success) return { value: result.data }
					return { issues: result.issues }
				},
				types: undefined as unknown as { input: unknown; output: number },
			},
			parse: (data) => {
				const result = safeParse(data)
				if (result.success) return result.data
				throw new SchemaError(result.issues)
			},
			safeParse,
			parseAsync: async (data) => safeParse(data).data!,
			safeParseAsync: async (data) => safeParse(data),
		}
	},

	boolean(): BaseSchema<unknown, boolean> {
		const safeParse = (data: unknown): Result<boolean> => {
			if (typeof data === 'boolean') return { success: true, data }
			if (data === 'true' || data === 1) return { success: true, data: true }
			if (data === 'false' || data === 0) return { success: true, data: false }
			return { success: false, issues: [{ message: 'Failed to coerce to boolean' }] }
		}

		return {
			_input: undefined as unknown,
			_output: undefined as boolean,
			_checks: [],
			'~standard': {
				version: 1,
				vendor: 'zen',
				validate: (v) => {
					const result = safeParse(v)
					if (result.success) return { value: result.data }
					return { issues: result.issues }
				},
				types: undefined as unknown as { input: unknown; output: boolean },
			},
			parse: (data) => {
				const result = safeParse(data)
				if (result.success) return result.data
				throw new SchemaError(result.issues)
			},
			safeParse,
			parseAsync: async (data) => safeParse(data).data!,
			safeParseAsync: async (data) => safeParse(data),
		}
	},

	date(): BaseSchema<unknown, Date> {
		const safeParse = (data: unknown): Result<Date> => {
			if (data instanceof Date) {
				if (Number.isNaN(data.getTime())) {
					return { success: false, issues: [{ message: 'Invalid date' }] }
				}
				return { success: true, data }
			}
			const date = new Date(data as string | number)
			if (Number.isNaN(date.getTime())) {
				return { success: false, issues: [{ message: 'Failed to coerce to date' }] }
			}
			return { success: true, data: date }
		}

		return {
			_input: undefined as unknown,
			_output: undefined as Date,
			_checks: [],
			'~standard': {
				version: 1,
				vendor: 'zen',
				validate: (v) => {
					const result = safeParse(v)
					if (result.success) return { value: result.data }
					return { issues: result.issues }
				},
				types: undefined as unknown as { input: unknown; output: Date },
			},
			parse: (data) => {
				const result = safeParse(data)
				if (result.success) return result.data
				throw new SchemaError(result.issues)
			},
			safeParse,
			parseAsync: async (data) => safeParse(data).data!,
			safeParseAsync: async (data) => safeParse(data),
		}
	},
}
