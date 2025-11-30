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
	nullish,
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
export {
	array,
	exactLength,
	extend,
	lazy,
	maxLength,
	merge,
	minLength,
	nonemptyArray,
	object,
	omit,
	partial,
	passthrough,
	pick,
	record,
	strict,
	strip,
	tuple,
} from './schemas'

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
	base64,
	bigInt,
	bool,
	cuid,
	cuid2,
	date,
	dateOnly,
	datetime,
	email,
	endsWith,
	enum_,
	enumType,
	finite,
	gt,
	gte,
	includes,
	int,
	ip,
	ipv4,
	ipv6,
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
	nonnegative,
	nonpositive,
	nullType,
	num,
	obj,
	pattern,
	positive,
	safe,
	startsWith,
	str,
	time,
	ulid,
	undefinedType,
	unknown,
	url,
	uuid,
	voidType,
} from './validators'
