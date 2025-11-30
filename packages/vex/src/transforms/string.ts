// ============================================================
// String Transforms
// ============================================================

import type { Validator } from '../core'
import { createValidator } from '../core'

/** Trim whitespace */
export const trim: Validator<string> = createValidator(
	(v) => v.trim(),
	(v) => ({ ok: true, value: v.trim() })
)

/** To lowercase */
export const lower: Validator<string> = createValidator(
	(v) => v.toLowerCase(),
	(v) => ({ ok: true, value: v.toLowerCase() })
)

/** To uppercase */
export const upper: Validator<string> = createValidator(
	(v) => v.toUpperCase(),
	(v) => ({ ok: true, value: v.toUpperCase() })
)
