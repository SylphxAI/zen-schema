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

// ============================================================
// nativeEnum - TypeScript enum validation
// ============================================================

export function nativeEnum<T extends Record<string, string | number>>(
	enumObj: T
): ExtendedSchema<T[keyof T], T[keyof T]> {
	type TValue = T[keyof T]
	const values = Object.values(enumObj).filter(
		(v) => typeof v === 'string' || typeof v === 'number'
	) as TValue[]
	const valueSet = new Set(values)

	const schema: BaseSchema<TValue, TValue> = {
		_input: undefined as TValue,
		_output: undefined as TValue,
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
			types: undefined as unknown as { input: TValue; output: TValue },
		},
		parse(data: unknown): TValue {
			const result = this.safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse(data: unknown): Result<TValue> {
			if (!valueSet.has(data as TValue)) {
				return {
					success: false,
					issues: [{ message: `Expected one of: ${values.join(', ')}` }],
				}
			}
			return { success: true, data: data as TValue }
		},
		parseAsync: async (data: unknown) => schema.parse(data),
		safeParseAsync: async (data: unknown) => schema.safeParse(data),
	}
	return extendSchema(schema)
}

// ============================================================
// set - Set validation
// ============================================================

export interface SetSchema<T extends BaseSchema<unknown, unknown>>
	extends ExtendedSchema<Set<T['_input']>, Set<T['_output']>> {
	readonly element: T
	min(size: number, message?: string): SetSchema<T>
	max(size: number, message?: string): SetSchema<T>
	size(size: number, message?: string): SetSchema<T>
	nonempty(message?: string): SetSchema<T>
}

export function set<T extends BaseSchema<unknown, unknown>>(element: T): SetSchema<T> {
	type TInput = Set<T['_input']>
	type TOutput = Set<T['_output']>

	interface SetCheck {
		check: (s: Set<unknown>) => boolean
		message: string
	}

	const createSetSchema = (checks: SetCheck[] = []): SetSchema<T> => {
		const baseSchema: BaseSchema<TInput, TOutput> = {
			_input: undefined as TInput,
			_output: undefined as TOutput,
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
				types: undefined as unknown as { input: TInput; output: TOutput },
			},
			parse(data: unknown): TOutput {
				const result = this.safeParse(data)
				if (result.success) return result.data
				throw new SchemaError(result.issues)
			},
			safeParse(data: unknown): Result<TOutput> {
				if (!(data instanceof Set)) {
					return { success: false, issues: [{ message: 'Expected Set' }] }
				}

				for (const check of checks) {
					if (!check.check(data)) {
						return { success: false, issues: [{ message: check.message }] }
					}
				}

				const output = new Set<T['_output']>()
				let index = 0
				for (const item of data) {
					const result = element.safeParse(item)
					if (!result.success) {
						return {
							success: false,
							issues: result.issues.map((i) => ({
								message: i.message,
								path: [index, ...(i.path ?? [])],
							})),
						}
					}
					output.add(result.data as T['_output'])
					index++
				}

				return { success: true, data: output }
			},
			parseAsync: async (data: unknown) => baseSchema.parse(data),
			safeParseAsync: async (data: unknown) => baseSchema.safeParse(data),
		}

		const extended = extendSchema(baseSchema) as SetSchema<T>

		const addCheck = (check: SetCheck): SetSchema<T> => {
			return createSetSchema([...checks, check])
		}

		return Object.assign(extended, {
			element,
			min: (size: number, message?: string) =>
				addCheck({ check: (s) => s.size >= size, message: message ?? `Set must have at least ${size} elements` }),
			max: (size: number, message?: string) =>
				addCheck({ check: (s) => s.size <= size, message: message ?? `Set must have at most ${size} elements` }),
			size: (size: number, message?: string) =>
				addCheck({ check: (s) => s.size === size, message: message ?? `Set must have exactly ${size} elements` }),
			nonempty: (message?: string) =>
				addCheck({ check: (s) => s.size > 0, message: message ?? 'Set must not be empty' }),
		})
	}

	return createSetSchema()
}

// ============================================================
// map - Map validation
// ============================================================

export interface MapSchema<K extends BaseSchema<unknown, unknown>, V extends BaseSchema<unknown, unknown>>
	extends ExtendedSchema<Map<K['_input'], V['_input']>, Map<K['_output'], V['_output']>> {
	readonly keySchema: K
	readonly valueSchema: V
	min(size: number, message?: string): MapSchema<K, V>
	max(size: number, message?: string): MapSchema<K, V>
	size(size: number, message?: string): MapSchema<K, V>
	nonempty(message?: string): MapSchema<K, V>
}

export function map<K extends BaseSchema<unknown, unknown>, V extends BaseSchema<unknown, unknown>>(
	keySchema: K,
	valueSchema: V
): MapSchema<K, V> {
	type TInput = Map<K['_input'], V['_input']>
	type TOutput = Map<K['_output'], V['_output']>

	interface MapCheck {
		check: (m: Map<unknown, unknown>) => boolean
		message: string
	}

	const createMapSchema = (checks: MapCheck[] = []): MapSchema<K, V> => {
		const baseSchema: BaseSchema<TInput, TOutput> = {
			_input: undefined as TInput,
			_output: undefined as TOutput,
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
				types: undefined as unknown as { input: TInput; output: TOutput },
			},
			parse(data: unknown): TOutput {
				const result = this.safeParse(data)
				if (result.success) return result.data
				throw new SchemaError(result.issues)
			},
			safeParse(data: unknown): Result<TOutput> {
				if (!(data instanceof Map)) {
					return { success: false, issues: [{ message: 'Expected Map' }] }
				}

				for (const check of checks) {
					if (!check.check(data)) {
						return { success: false, issues: [{ message: check.message }] }
					}
				}

				const output = new Map<K['_output'], V['_output']>()
				for (const [key, value] of data) {
					const keyResult = keySchema.safeParse(key)
					if (!keyResult.success) {
						return {
							success: false,
							issues: keyResult.issues.map((i) => ({
								message: `Invalid key: ${i.message}`,
								path: i.path,
							})),
						}
					}
					const valueResult = valueSchema.safeParse(value)
					if (!valueResult.success) {
						return {
							success: false,
							issues: valueResult.issues.map((i) => ({
								message: i.message,
								path: [String(key), ...(i.path ?? [])],
							})),
						}
					}
					output.set(keyResult.data as K['_output'], valueResult.data as V['_output'])
				}

				return { success: true, data: output }
			},
			parseAsync: async (data: unknown) => baseSchema.parse(data),
			safeParseAsync: async (data: unknown) => baseSchema.safeParse(data),
		}

		const extended = extendSchema(baseSchema) as MapSchema<K, V>

		const addCheck = (check: MapCheck): MapSchema<K, V> => {
			return createMapSchema([...checks, check])
		}

		return Object.assign(extended, {
			keySchema,
			valueSchema,
			min: (size: number, message?: string) =>
				addCheck({ check: (m) => m.size >= size, message: message ?? `Map must have at least ${size} entries` }),
			max: (size: number, message?: string) =>
				addCheck({ check: (m) => m.size <= size, message: message ?? `Map must have at most ${size} entries` }),
			size: (size: number, message?: string) =>
				addCheck({ check: (m) => m.size === size, message: message ?? `Map must have exactly ${size} entries` }),
			nonempty: (message?: string) =>
				addCheck({ check: (m) => m.size > 0, message: message ?? 'Map must not be empty' }),
		})
	}

	return createMapSchema()
}

// ============================================================
// promise - Promise validation
// ============================================================

export function promise<T extends BaseSchema<unknown, unknown>>(
	schema: T
): ExtendedSchema<Promise<T['_input']>, Promise<T['_output']>> {
	type TInput = Promise<T['_input']>
	type TOutput = Promise<T['_output']>

	const promiseSchema: BaseSchema<TInput, TOutput> = {
		_input: undefined as TInput,
		_output: undefined as TOutput,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: VENDOR,
			validate(value: unknown) {
				const result = promiseSchema.safeParse(value)
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
			if (!(data instanceof Promise)) {
				throw new SchemaError([{ message: 'Expected Promise' }])
			}
			return data.then((v) => schema.parse(v)) as TOutput
		},
		safeParse(data: unknown): Result<TOutput> {
			if (!(data instanceof Promise)) {
				return { success: false, issues: [{ message: 'Expected Promise' }] }
			}
			return {
				success: true,
				data: data.then((v) => schema.parse(v)) as TOutput,
			}
		},
		parseAsync: async (data: unknown) => promiseSchema.parse(data),
		safeParseAsync: async (data: unknown) => promiseSchema.safeParse(data),
	}
	return extendSchema(promiseSchema)
}

// ============================================================
// function - Function validation
// ============================================================

export interface FunctionSchema<
	TArgs extends readonly BaseSchema<unknown, unknown>[],
	TReturn extends BaseSchema<unknown, unknown>
> extends ExtendedSchema<
		(...args: { [K in keyof TArgs]: TArgs[K]['_input'] }) => TReturn['_input'],
		(...args: { [K in keyof TArgs]: TArgs[K]['_output'] }) => TReturn['_output']
	> {
	args<A extends readonly BaseSchema<unknown, unknown>[]>(...args: A): FunctionSchema<A, TReturn>
	returns<R extends BaseSchema<unknown, unknown>>(returnType: R): FunctionSchema<TArgs, R>
	implement(
		fn: (...args: { [K in keyof TArgs]: TArgs[K]['_output'] }) => TReturn['_input']
	): (...args: { [K in keyof TArgs]: TArgs[K]['_input'] }) => TReturn['_output']
}

export function function_<
	TArgs extends readonly BaseSchema<unknown, unknown>[] = [],
	TReturn extends BaseSchema<unknown, unknown> = ExtendedSchema<unknown, unknown>
>(argSchemas?: TArgs, returnSchema?: TReturn): FunctionSchema<TArgs, TReturn> {
	type TInput = (...args: { [K in keyof TArgs]: TArgs[K]['_input'] }) => TReturn['_input']
	type TOutput = (...args: { [K in keyof TArgs]: TArgs[K]['_output'] }) => TReturn['_output']

	const baseSchema: BaseSchema<TInput, TOutput> = {
		_input: undefined as TInput,
		_output: undefined as TOutput,
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
			types: undefined as unknown as { input: TInput; output: TOutput },
		},
		parse(data: unknown): TOutput {
			const result = this.safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse(data: unknown): Result<TOutput> {
			if (typeof data !== 'function') {
				return { success: false, issues: [{ message: 'Expected function' }] }
			}
			return { success: true, data: data as TOutput }
		},
		parseAsync: async (data: unknown) => baseSchema.parse(data),
		safeParseAsync: async (data: unknown) => baseSchema.safeParse(data),
	}

	const extended = extendSchema(baseSchema) as FunctionSchema<TArgs, TReturn>

	return Object.assign(extended, {
		args: <A extends readonly BaseSchema<unknown, unknown>[]>(...args: A) =>
			function_(args, returnSchema),
		returns: <R extends BaseSchema<unknown, unknown>>(ret: R) =>
			function_(argSchemas, ret),
		implement: (fn: (...args: { [K in keyof TArgs]: TArgs[K]['_output'] }) => TReturn['_input']) => {
			return (...args: { [K in keyof TArgs]: TArgs[K]['_input'] }) => {
				// Validate args
				const validatedArgs = (argSchemas ?? []).map((schema, i) => schema.parse(args[i]))
				const result = fn(...(validatedArgs as { [K in keyof TArgs]: TArgs[K]['_output'] }))
				// Validate return
				if (returnSchema) {
					return returnSchema.parse(result) as TReturn['_output']
				}
				return result as TReturn['_output']
			}
		},
	})
}

// ============================================================
// custom - Custom schema
// ============================================================

export function custom<T>(
	check: (data: unknown) => data is T,
	message?: string | { message: string }
): ExtendedSchema<T, T> {
	const msg = typeof message === 'object' ? message.message : message ?? 'Invalid value'

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
				return { success: false, issues: [{ message: msg }] }
			}
			return { success: true, data }
		},
		parseAsync: async (data: unknown) => schema.parse(data),
		safeParseAsync: async (data: unknown) => schema.safeParse(data),
	}
	return extendSchema(schema)
}

// ============================================================
// intersection - Intersection of two schemas
// ============================================================

export function intersection<
	T extends BaseSchema<unknown, unknown>,
	U extends BaseSchema<unknown, unknown>
>(left: T, right: U): ExtendedSchema<T['_input'] & U['_input'], T['_output'] & U['_output']> {
	type TInput = T['_input'] & U['_input']
	type TOutput = T['_output'] & U['_output']

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
			const leftResult = left.safeParse(data)
			if (!leftResult.success) return leftResult as Result<TOutput>
			const rightResult = right.safeParse(data)
			if (!rightResult.success) return rightResult as Result<TOutput>
			// Merge results for objects
			if (typeof leftResult.data === 'object' && typeof rightResult.data === 'object') {
				return {
					success: true,
					data: { ...leftResult.data, ...rightResult.data } as TOutput,
				}
			}
			return leftResult as Result<TOutput>
		},
		parseAsync: async (data: unknown) => schema.parse(data),
		safeParseAsync: async (data: unknown) => schema.safeParse(data),
	}
	return extendSchema(schema)
}

// ============================================================
// pipeline - Chain multiple schemas (alias for pipe)
// ============================================================

export function pipeline<T extends [BaseSchema<unknown, unknown>, ...BaseSchema<unknown, unknown>[]]>(
	schemas: T
): ExtendedSchema<T[0]['_input'], T[number]['_output']> {
	const [first, ...rest] = schemas as [BaseSchema<unknown, unknown>, ...BaseSchema<unknown, unknown>[]]

	let current = extendSchema(first)
	for (const next of rest) {
		current = current.pipe(next as BaseSchema<unknown, unknown>) as ExtendedSchema<unknown, unknown>
	}

	return current as ExtendedSchema<T[0]['_input'], T[number]['_output']>
}
