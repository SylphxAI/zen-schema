// ============================================================
// Parse Transforms
// ============================================================

import type { Validator } from '../core'
import { createValidator, ValidationError } from '../core'

/** Parse to integer */
export const toInt: Validator<string, number> = createValidator(
	(v) => {
		const n = Number.parseInt(v, 10)
		if (Number.isNaN(n)) throw new ValidationError('Invalid integer')
		return n
	},
	(v) => {
		const n = Number.parseInt(v, 10)
		return Number.isNaN(n) ? { ok: false, error: 'Invalid integer' } : { ok: true, value: n }
	}
)

/** Parse to float */
export const toFloat: Validator<string, number> = createValidator(
	(v) => {
		const n = Number.parseFloat(v)
		if (Number.isNaN(n)) throw new ValidationError('Invalid number')
		return n
	},
	(v) => {
		const n = Number.parseFloat(v)
		return Number.isNaN(n) ? { ok: false, error: 'Invalid number' } : { ok: true, value: n }
	}
)

/** Parse to Date */
export const toDate: Validator<string, Date> = createValidator(
	(v) => {
		const d = new Date(v)
		if (Number.isNaN(d.getTime())) throw new ValidationError('Invalid date')
		return d
	},
	(v) => {
		const d = new Date(v)
		return Number.isNaN(d.getTime()) ? { ok: false, error: 'Invalid date' } : { ok: true, value: d }
	}
)
