// ============================================================
// 🧘 Zen - Calm, minimal schema validation
// ============================================================

// Core
export { SchemaError } from './errors'
export type {
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

// Schema methods
export { extendSchema, type ExtendedSchema } from './schema-methods'

// Transforms (standalone functions)
export {
	refine,
	transform,
	withDefault,
	coerceNumber,
	coerceString,
	coerceBoolean,
} from './transforms'

// Primitives
export {
	any,
	unknown,
	never,
	void_ as void,
	null_ as null,
	undefined_ as undefined,
	nan,
	bigint,
	symbol,
	date,
	lazy,
	discriminatedUnion,
	instanceof_ as instanceof,
	preprocess,
	type DateSchema,
} from './primitives'

// Schemas
export {
	array,
	boolean,
	literal,
	number,
	object,
	string,
	union,
	enumSchema,
	enum_,
	tuple,
	record,
	type ArraySchema,
	type BooleanSchema,
	type LiteralSchema,
	type NumberSchema,
	type ObjectSchema,
	type ObjectShape,
	type StringSchema,
	type UnionSchema,
	type EnumSchema,
	type TupleSchema,
	type RecordSchema,
} from './schemas'

// ============================================================
// z namespace (Zod-compatible API)
// ============================================================

import {
	array,
	boolean,
	literal,
	number,
	object,
	string,
	union,
	enumSchema,
	tuple,
	record,
} from './schemas'
import {
	any,
	unknown,
	never,
	void_,
	null_,
	undefined_,
	nan,
	bigint,
	symbol,
	date,
	lazy,
	discriminatedUnion,
	instanceof_,
	preprocess,
} from './primitives'
import { coerceNumber, coerceString, coerceBoolean } from './transforms'

export const z = {
	// Schema creators with chainable methods
	string,
	number,
	boolean,
	object,
	array,
	union,
	literal,
	enum: enumSchema,
	tuple,
	record,
	// Primitives
	any,
	unknown,
	never,
	void: void_,
	null: null_,
	undefined: undefined_,
	nan,
	bigint,
	symbol,
	date,
	// Advanced
	lazy,
	discriminatedUnion,
	instanceof: instanceof_,
	preprocess,
	// Coercion
	coerce: {
		string: () => coerceString(string()),
		number: () => coerceNumber(number()),
		boolean: () => coerceBoolean(boolean()),
	},
} as const

// Alias for zen
export const zen = z

// Default export
export default z
