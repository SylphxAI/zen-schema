// ============================================================
// 🧘 Zen - Calm, minimal schema validation
// ============================================================

// Core
export { SchemaError } from './errors'
export type {
	AnySchema,
	BaseSchema,
	Check,
	Infer,
	InferInput,
	InferOutput,
	Input,
	Issue,
	Result,
	StandardSchemaV1,
} from './types'

// Schemas
export {
	// Core schemas
	array,
	boolean,
	enum_,
	literal,
	number,
	object,
	record,
	string,
	tuple,
	union,
	// Advanced schemas
	discriminatedUnion,
	lazy,
	// Primitive types
	any,
	unknown,
	null as null_,
	undefined as undefined_,
	void as void_,
	never,
	nan,
	date,
	bigint,
	symbol,
	// Modifiers
	coerce,
	refine,
	transform,
	withDefault,
	// Types
	type ArraySchema,
	type BooleanSchema,
	type DiscriminatedUnionSchema,
	type EnumSchema,
	type LazySchema,
	type LiteralSchema,
	type NumberSchema,
	type ObjectSchema,
	type ObjectShape,
	type RecordSchema,
	type RefinedSchema,
	type StringSchema,
	type TupleSchema,
	type UnionSchema,
} from './schemas'

// Convenience namespace (like zod's `z`)
import {
	// Core schemas
	array,
	boolean,
	enum_,
	literal,
	number,
	object,
	record,
	string,
	tuple,
	union,
	// Advanced schemas
	discriminatedUnion,
	lazy,
	// Primitive types
	any,
	unknown,
	null as null_,
	undefined as undefined_,
	void as void_,
	never,
	nan,
	date,
	bigint,
	symbol,
	// Modifiers
	coerce,
	refine,
	transform,
	withDefault,
} from './schemas'

export const z = {
	// Primitives
	string,
	number,
	boolean,
	bigint,
	symbol,
	date,
	// Special types
	any,
	unknown,
	null: null_,
	undefined: undefined_,
	void: void_,
	never,
	nan,
	// Complex types
	object,
	array,
	tuple,
	record,
	// Union & literal
	union,
	discriminatedUnion,
	literal,
	enum: enum_,
	// Recursion
	lazy,
	// Modifiers
	refine,
	transform,
	default: withDefault,
	coerce,
} as const

// Alias for zen
export const zen = z

// Default export
export default z
