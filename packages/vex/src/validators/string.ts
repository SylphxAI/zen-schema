// ============================================================
// String Validators
// ============================================================

import type { Result, Validator } from '../core'
import { createValidator, ValidationError } from '../core'

const ERR_REQUIRED: Result<never> = { ok: false, error: 'Required' }
const ERR_EMAIL: Result<never> = { ok: false, error: 'Invalid email' }
const ERR_URL: Result<never> = { ok: false, error: 'Invalid URL' }
const ERR_UUID: Result<never> = { ok: false, error: 'Invalid UUID' }

/** Minimum length */
export const min = (n: number): Validator<string> => {
	const err: Result<never> = { ok: false, error: `Min ${n} chars` }
	return createValidator(
		(v) => {
			if (v.length < n) throw new ValidationError(`Min ${n} chars`)
			return v
		},
		(v) => (v.length >= n ? { ok: true, value: v } : err)
	)
}

/** Maximum length */
export const max = (n: number): Validator<string> => {
	const err: Result<never> = { ok: false, error: `Max ${n} chars` }
	return createValidator(
		(v) => {
			if (v.length > n) throw new ValidationError(`Max ${n} chars`)
			return v
		},
		(v) => (v.length <= n ? { ok: true, value: v } : err)
	)
}

/** Exact length */
export const len = (n: number): Validator<string> => {
	const err: Result<never> = { ok: false, error: `Must be ${n} chars` }
	return createValidator(
		(v) => {
			if (v.length !== n) throw new ValidationError(`Must be ${n} chars`)
			return v
		},
		(v) => (v.length === n ? { ok: true, value: v } : err)
	)
}

/** Non-empty string */
export const nonempty: Validator<string> = createValidator(
	(v) => {
		if (v.length === 0) throw new ValidationError('Required')
		return v
	},
	(v) => (v.length > 0 ? { ok: true, value: v } : ERR_REQUIRED)
)

/** Email format */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const email: Validator<string> = createValidator(
	(v) => {
		if (!EMAIL_RE.test(v)) throw new ValidationError('Invalid email')
		return v
	},
	(v) => (EMAIL_RE.test(v) ? { ok: true, value: v } : ERR_EMAIL)
)

/** URL format */
const URL_RE = /^https?:\/\/.+/
export const url: Validator<string> = createValidator(
	(v) => {
		if (!URL_RE.test(v)) throw new ValidationError('Invalid URL')
		return v
	},
	(v) => (URL_RE.test(v) ? { ok: true, value: v } : ERR_URL)
)

/** UUID format */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const uuid: Validator<string> = createValidator(
	(v) => {
		if (!UUID_RE.test(v)) throw new ValidationError('Invalid UUID')
		return v
	},
	(v) => (UUID_RE.test(v) ? { ok: true, value: v } : ERR_UUID)
)

/** Regex pattern */
export const pattern = (re: RegExp, msg = 'Invalid format'): Validator<string> => {
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (!re.test(v)) throw new ValidationError(msg)
			return v
		},
		(v) => (re.test(v) ? { ok: true, value: v } : err)
	)
}

/** Starts with prefix */
export const startsWith = (prefix: string): Validator<string> => {
	const msg = `Must start with "${prefix}"`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (!v.startsWith(prefix)) throw new ValidationError(msg)
			return v
		},
		(v) => (v.startsWith(prefix) ? { ok: true, value: v } : err)
	)
}

/** Ends with suffix */
export const endsWith = (suffix: string): Validator<string> => {
	const msg = `Must end with "${suffix}"`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (!v.endsWith(suffix)) throw new ValidationError(msg)
			return v
		},
		(v) => (v.endsWith(suffix) ? { ok: true, value: v } : err)
	)
}

/** Contains substring */
export const includes = (search: string): Validator<string> => {
	const msg = `Must include "${search}"`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (!v.includes(search)) throw new ValidationError(msg)
			return v
		},
		(v) => (v.includes(search) ? { ok: true, value: v } : err)
	)
}
