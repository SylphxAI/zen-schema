// ============================================================
// 🧘 Zen-Zod - Zod compatibility adapter
// ============================================================

import {
	type AnySchema,
	type ArraySchema,
	type BaseSchema,
	type BooleanSchema,
	type EnumSchema,
	type Infer,
	type Input,
	type LiteralSchema,
	type NumberSchema,
	type ObjectSchema,
	type ObjectShape,
	type RecordSchema,
	type RefinedSchema,
	SchemaError,
	type StringSchema,
	type TupleSchema,
	type UnionSchema,
	array as zenArray,
	boolean as zenBoolean,
	coerce as zenCoerce,
	enum_ as zenEnum,
	literal as zenLiteral,
	number as zenNumber,
	object as zenObject,
	record as zenRecord,
	refine as zenRefine,
	string as zenString,
	transform as zenTransform,
	tuple as zenTuple,
	union as zenUnion,
	withDefault as zenDefault,
} from '@sylphx/zen'

// ============================================================
// Zod Compatibility Types
// ============================================================

export type ZodTypeName =
	| 'ZodString'
	| 'ZodNumber'
	| 'ZodBoolean'
	| 'ZodObject'
	| 'ZodArray'
	| 'ZodTuple'
	| 'ZodRecord'
	| 'ZodOptional'
	| 'ZodNullable'
	| 'ZodUnion'
	| 'ZodLiteral'
	| 'ZodEnum'
	| 'ZodAny'
	| 'ZodUnknown'
	| 'ZodEffects'
	| 'ZodDefault'

export interface ZodCompatDef {
	readonly typeName: ZodTypeName
}

// ============================================================
// Zod-Compatible Error
// ============================================================

export class ZodError extends Error {
	readonly name = 'ZodError'
	readonly issues: Array<{
		code: string
		message: string
		path: (string | number)[]
	}>

	constructor(schemaError: SchemaError) {
		super(schemaError.message)
		this.issues = schemaError.issues.map((i) => ({
			code: 'custom',
			message: i.message,
			path: (i.path?.map((p) => (typeof p === 'symbol' ? String(p) : p)) ?? []) as (
				| string
				| number
			)[],
		}))
	}

	get errors() {
		return this.issues
	}

	flatten() {
		const formErrors: string[] = []
		const fieldErrors: Record<string, string[]> = {}

		for (const issue of this.issues) {
			if (issue.path.length === 0) {
				formErrors.push(issue.message)
			} else {
				const key = issue.path.join('.')
				fieldErrors[key] ??= []
				fieldErrors[key].push(issue.message)
			}
		}

		return { formErrors, fieldErrors }
	}
}

// ============================================================
// Schema with Zod compatibility
// ============================================================

type ZodCompatSchema<T extends BaseSchema<unknown, unknown>> = T & {
	readonly _def: ZodCompatDef
	readonly _zod: { def: ZodCompatDef }
}

function addZodCompat<T extends BaseSchema<unknown, unknown>>(
	schema: T,
	typeName: ZodTypeName
): ZodCompatSchema<T> {
	return Object.assign(schema, {
		_def: { typeName },
		_zod: { def: { typeName } },
	}) as ZodCompatSchema<T>
}

// ============================================================
// Wrapped Schema Creators
// ============================================================

export function string(): ZodCompatSchema<StringSchema> {
	return addZodCompat(zenString(), 'ZodString')
}

export function number(): ZodCompatSchema<NumberSchema> {
	return addZodCompat(zenNumber(), 'ZodNumber')
}

export function boolean(): ZodCompatSchema<BooleanSchema> {
	return addZodCompat(zenBoolean(), 'ZodBoolean')
}

export function object<T extends ObjectShape>(shape: T): ZodCompatSchema<ObjectSchema<T>> {
	return addZodCompat(zenObject(shape), 'ZodObject')
}

export function array<T extends AnySchema>(element: T): ZodCompatSchema<ArraySchema<T>> {
	return addZodCompat(zenArray(element), 'ZodArray')
}

export function union<T extends readonly AnySchema[]>(options: T): ZodCompatSchema<UnionSchema<T>> {
	return addZodCompat(zenUnion(options), 'ZodUnion')
}

export function literal<T extends string | number | boolean | null | undefined>(
	value: T
): ZodCompatSchema<LiteralSchema<T>> {
	return addZodCompat(zenLiteral(value), 'ZodLiteral')
}

type EnumValues = readonly [string, ...string[]]
export function enum_<T extends EnumValues>(values: T): ZodCompatSchema<EnumSchema<T>> {
	return addZodCompat(zenEnum(values), 'ZodEnum')
}

type TupleItems = readonly AnySchema[]
export function tuple<T extends TupleItems>(items: T): ZodCompatSchema<TupleSchema<T>> {
	return addZodCompat(zenTuple(items), 'ZodTuple')
}

export function record<TValue extends AnySchema>(
	valueSchema: TValue
): ZodCompatSchema<RecordSchema<BaseSchema<string, string>, TValue>> {
	return addZodCompat(zenRecord(valueSchema), 'ZodRecord')
}

export function refine<TInput, TOutput>(
	schema: BaseSchema<TInput, TOutput>,
	check: (data: TOutput) => boolean,
	message?: string | ((data: TOutput) => string)
): ZodCompatSchema<RefinedSchema<TInput, TOutput>> {
	return addZodCompat(zenRefine(schema, check, message), 'ZodEffects')
}

export function transform<TInput, TOutput, TNew>(
	schema: BaseSchema<TInput, TOutput>,
	fn: (data: TOutput) => TNew
): ZodCompatSchema<RefinedSchema<TInput, TNew>> {
	return addZodCompat(zenTransform(schema, fn), 'ZodEffects')
}

export function withDefault<TInput, TOutput>(
	schema: BaseSchema<TInput, TOutput>,
	defaultValue: TOutput | (() => TOutput)
): ZodCompatSchema<BaseSchema<TInput | undefined, TOutput>> {
	return addZodCompat(zenDefault(schema, defaultValue), 'ZodDefault')
}

export const coerce = {
	string: () => addZodCompat(zenCoerce.string(), 'ZodString'),
	number: () => addZodCompat(zenCoerce.number(), 'ZodNumber'),
	boolean: () => addZodCompat(zenCoerce.boolean(), 'ZodBoolean'),
	date: () => addZodCompat(zenCoerce.date(), 'ZodAny'),
}

// ============================================================
// Exports
// ============================================================

// Re-export types from zen
export type {
	AnySchema,
	BaseSchema,
	Infer,
	Input,
	StringSchema,
	NumberSchema,
	BooleanSchema,
	ObjectSchema,
	ObjectShape,
	ArraySchema,
	TupleSchema,
	RecordSchema,
	UnionSchema,
	LiteralSchema,
	EnumSchema,
	RefinedSchema,
}

// Re-export SchemaError
export { SchemaError }

// Convenience namespace (like zod's `z`)
export const z = {
	// Primitives
	string,
	number,
	boolean,
	// Complex types
	object,
	array,
	tuple,
	record,
	// Union & literal
	union,
	literal,
	enum: enum_,
	// Modifiers
	refine,
	transform,
	default: withDefault,
	coerce,
} as const

// Default export
export default z
