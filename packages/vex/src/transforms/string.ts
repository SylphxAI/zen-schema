// ============================================================
// String Transforms
// ============================================================

import type { Validator } from '../core'
import { createValidator } from '../core'

/** Trim whitespace */
export const trim: Validator<string> = createValidator(
	(v) => v.trim(),
	(v) => ({ ok: true, value: v.trim() }),
)

/** To lowercase */
export const lower: Validator<string> = createValidator(
	(v) => v.toLowerCase(),
	(v) => ({ ok: true, value: v.toLowerCase() }),
)

/** To uppercase */
export const upper: Validator<string> = createValidator(
	(v) => v.toUpperCase(),
	(v) => ({ ok: true, value: v.toUpperCase() }),
)

/** Trim start whitespace */
export const trimStart: Validator<string> = createValidator(
	(v) => v.trimStart(),
	(v) => ({ ok: true, value: v.trimStart() }),
)

/** Trim end whitespace */
export const trimEnd: Validator<string> = createValidator(
	(v) => v.trimEnd(),
	(v) => ({ ok: true, value: v.trimEnd() }),
)

/**
 * Unicode normalization
 * @param form - NFC, NFD, NFKC, or NFKD (default: NFC)
 */
export const normalize = (form: 'NFC' | 'NFD' | 'NFKC' | 'NFKD' = 'NFC'): Validator<string> =>
	createValidator(
		(v) => v.normalize(form),
		(v) => ({ ok: true, value: v.normalize(form) }),
	)

/** Alias: toLowerCase (Valibot compatibility) */
export { lower as toLowerCase }

/** Alias: toUpperCase (Valibot compatibility) */
export { upper as toUpperCase }
