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
	array,
	boolean,
	coerce,
	enum_,
	literal,
	number,
	object,
	record,
	refine,
	string,
	transform,
	tuple,
	union,
	withDefault,
	type ArraySchema,
	type BooleanSchema,
	type EnumSchema,
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
	array,
	boolean,
	coerce,
	enum_,
	literal,
	number,
	object,
	record,
	refine,
	string,
	transform,
	tuple,
	union,
	withDefault,
} from './schemas'

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

// Alias for zen
export const zen = z

// Default export
export default z
