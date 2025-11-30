// ============================================================
// Special Type Validators
// ============================================================

import type { Parser } from '../core'
import { createValidator, ValidationError } from '../core'

/** any - accepts any value */
export const any: Parser<unknown> = createValidator(
	(v) => v,
	(v) => ({ ok: true, value: v })
)

/** unknown - accepts any value (same as any but stricter type) */
export const unknown: Parser<unknown> = any

/** never - always fails */
export const never: Parser<never> = createValidator(
	() => {
		throw new ValidationError('Value not allowed')
	},
	() => ({ ok: false, error: 'Value not allowed' })
)

/** void - accepts undefined */
export const voidType: Parser<void> = createValidator(
	(v) => {
		if (v !== undefined) throw new ValidationError('Expected undefined')
		return undefined
	},
	(v) =>
		v === undefined ? { ok: true, value: undefined } : { ok: false, error: 'Expected undefined' }
)

/** null - accepts null */
export const nullType: Parser<null> = createValidator(
	(v) => {
		if (v !== null) throw new ValidationError('Expected null')
		return null
	},
	(v) => (v === null ? { ok: true, value: null } : { ok: false, error: 'Expected null' })
)

/** undefined - accepts undefined */
export const undefinedType: Parser<undefined> = createValidator(
	(v) => {
		if (v !== undefined) throw new ValidationError('Expected undefined')
		return undefined
	},
	(v) =>
		v === undefined ? { ok: true, value: undefined } : { ok: false, error: 'Expected undefined' }
)
