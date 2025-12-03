// ============================================================
// Coercion Transforms
// ============================================================

import type { Parser } from '../core'
import { createValidator, ValidationError } from '../core'

/** Coerce value to string */
export const coerceString: Parser<string> = createValidator(
	(v) => String(v),
	(v) => ({ ok: true, value: String(v) }),
)

/** Coerce value to number */
export const coerceNumber: Parser<number> = createValidator(
	(v) => {
		const n = Number(v)
		if (Number.isNaN(n)) throw new ValidationError('Cannot coerce to number')
		return n
	},
	(v) => {
		const n = Number(v)
		return Number.isNaN(n)
			? { ok: false, error: 'Cannot coerce to number' }
			: { ok: true, value: n }
	},
)

/** Coerce value to boolean */
export const coerceBoolean: Parser<boolean> = createValidator(
	(v) => Boolean(v),
	(v) => ({ ok: true, value: Boolean(v) }),
)

/** Coerce value to Date */
export const coerceDate: Parser<Date> = createValidator(
	(v) => {
		const d = v instanceof Date ? v : new Date(v as string | number)
		if (Number.isNaN(d.getTime())) throw new ValidationError('Cannot coerce to Date')
		return d
	},
	(v) => {
		const d = v instanceof Date ? v : new Date(v as string | number)
		return Number.isNaN(d.getTime())
			? { ok: false, error: 'Cannot coerce to Date' }
			: { ok: true, value: d }
	},
)

/** Coerce value to BigInt */
export const coerceBigInt: Parser<bigint> = createValidator(
	(v) => {
		try {
			return BigInt(v as string | number | bigint | boolean)
		} catch {
			throw new ValidationError('Cannot coerce to BigInt')
		}
	},
	(v) => {
		try {
			return { ok: true, value: BigInt(v as string | number | bigint | boolean) }
		} catch {
			return { ok: false, error: 'Cannot coerce to BigInt' }
		}
	},
)

/** Coercion namespace */
export const coerce: {
	string: Parser<string>
	number: Parser<number>
	boolean: Parser<boolean>
	date: Parser<Date>
	bigint: Parser<bigint>
} = {
	string: coerceString,
	number: coerceNumber,
	boolean: coerceBoolean,
	date: coerceDate,
	bigint: coerceBigInt,
}

// Valibot-style aliases
export { coerceString as toString_ }
export { coerceNumber as toNumber }
export { coerceBoolean as toBoolean }
export { coerceBigInt as toBigint }
