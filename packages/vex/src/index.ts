// ============================================================
// ⚡ Vex - Ultra-fast schema validation
// ============================================================
//
// Pure functional API - composable, tree-shakeable, blazing fast
//
// Usage:
//   import { pipe, str, email, object } from '@sylphx/vex'
//
//   const validateEmail = pipe(str, email)
//   const validateUser = object({
//     name: pipe(str, nonempty),
//     email: pipe(str, email),
//   })
//
// ============================================================

// Composition
export {
	catchError,
	discriminatedUnion,
	nullable,
	optional,
	pipe,
	refine,
	transform,
	union,
	withDefault,
} from './composition'
// Core types
export type { Parser, Result, StandardSchemaV1, StandardValidator, Validator } from './core'
export { ValidationError } from './core'
// Schemas
export { array, lazy, object, partial, passthrough, record, strict, strip, tuple } from './schemas'
// Transforms
export {
	coerce,
	coerceBigInt,
	coerceBoolean,
	coerceDate,
	coerceNumber,
	coerceString,
	lower,
	toDate,
	toFloat,
	toInt,
	trim,
	upper,
} from './transforms'
// Utils
export { safeParse, tryParse } from './utils'
// Type validators
// String validators
// Number validators
// Literal & Enum
export {
	any,
	arr,
	bigInt,
	bool,
	date,
	email,
	endsWith,
	enum_,
	enumType,
	finite,
	gt,
	gte,
	includes,
	int,
	len,
	literal,
	lt,
	lte,
	max,
	min,
	multipleOf,
	negative,
	never,
	nonempty,
	nullType,
	num,
	obj,
	pattern,
	positive,
	startsWith,
	str,
	undefinedType,
	unknown,
	url,
	uuid,
	voidType,
} from './validators'
