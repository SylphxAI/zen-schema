// ============================================================
// String Validators
// ============================================================

import type { Result, Validator } from '../core'
import { createValidator, ValidationError } from '../core'

const ERR_REQUIRED: Result<never> = { ok: false, error: 'Required' }
const ERR_EMAIL: Result<never> = { ok: false, error: 'Invalid email' }
const ERR_URL: Result<never> = { ok: false, error: 'Invalid URL' }
const ERR_UUID: Result<never> = { ok: false, error: 'Invalid UUID' }
const ERR_DATETIME: Result<never> = { ok: false, error: 'Invalid datetime' }
const ERR_DATE_ONLY: Result<never> = { ok: false, error: 'Invalid date' }
const ERR_TIME: Result<never> = { ok: false, error: 'Invalid time' }
const ERR_IPV4: Result<never> = { ok: false, error: 'Invalid IPv4 address' }
const ERR_IPV6: Result<never> = { ok: false, error: 'Invalid IPv6 address' }
const ERR_IP: Result<never> = { ok: false, error: 'Invalid IP address' }
const ERR_CUID: Result<never> = { ok: false, error: 'Invalid CUID' }
const ERR_CUID2: Result<never> = { ok: false, error: 'Invalid CUID2' }
const ERR_ULID: Result<never> = { ok: false, error: 'Invalid ULID' }
const ERR_BASE64: Result<never> = { ok: false, error: 'Invalid base64' }

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

// ============================================================
// DateTime Validators
// ============================================================

/** ISO 8601 datetime (e.g., 2024-01-15T10:30:00Z) */
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/
export const datetime: Validator<string> = createValidator(
	(v) => {
		if (!DATETIME_RE.test(v) || Number.isNaN(Date.parse(v)))
			throw new ValidationError('Invalid datetime')
		return v
	},
	(v) =>
		DATETIME_RE.test(v) && !Number.isNaN(Date.parse(v)) ? { ok: true, value: v } : ERR_DATETIME
)

/** ISO 8601 date only (e.g., 2024-01-15) */
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/
export const dateOnly: Validator<string> = createValidator(
	(v) => {
		if (!DATE_ONLY_RE.test(v) || Number.isNaN(Date.parse(v)))
			throw new ValidationError('Invalid date')
		return v
	},
	(v) =>
		DATE_ONLY_RE.test(v) && !Number.isNaN(Date.parse(v)) ? { ok: true, value: v } : ERR_DATE_ONLY
)

/** ISO 8601 time only (e.g., 10:30:00) */
const TIME_RE = /^\d{2}:\d{2}:\d{2}(\.\d+)?$/
const isValidTime = (v: string): boolean => {
	if (!TIME_RE.test(v)) return false
	const parts = v.split(':').map(Number)
	const h = parts[0] ?? 99
	const m = parts[1] ?? 99
	const s = parts[2] ?? 99
	return h <= 23 && m <= 59 && s <= 59
}
export const time: Validator<string> = createValidator(
	(v) => {
		if (!isValidTime(v)) throw new ValidationError('Invalid time')
		return v
	},
	(v) => (isValidTime(v) ? { ok: true, value: v } : ERR_TIME)
)

// ============================================================
// IP Address Validators
// ============================================================

/** IPv4 address (e.g., 192.168.1.1) */
const isValidIPv4 = (v: string): boolean => {
	const parts = v.split('.')
	if (parts.length !== 4) return false
	for (const part of parts) {
		if (!/^\d+$/.test(part)) return false
		const num = Number.parseInt(part, 10)
		if (num < 0 || num > 255) return false
		if (part.length > 1 && part[0] === '0') return false // no leading zeros
	}
	return true
}
export const ipv4: Validator<string> = createValidator(
	(v) => {
		if (!isValidIPv4(v)) throw new ValidationError('Invalid IPv4 address')
		return v
	},
	(v) => (isValidIPv4(v) ? { ok: true, value: v } : ERR_IPV4)
)

/** IPv6 address (e.g., 2001:0db8:85a3:0000:0000:8a2e:0370:7334) */
const IPV6_RE =
	/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^([0-9a-fA-F]{1,4}:){1,7}:$|^:([0-9a-fA-F]{1,4}:){1,7}$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:(:[0-9a-fA-F]{1,4}){1,6}$|^:(:[0-9a-fA-F]{1,4}){1,7}$/
export const ipv6: Validator<string> = createValidator(
	(v) => {
		if (!IPV6_RE.test(v)) throw new ValidationError('Invalid IPv6 address')
		return v
	},
	(v) => (IPV6_RE.test(v) ? { ok: true, value: v } : ERR_IPV6)
)

/** IP address (IPv4 or IPv6) */
export const ip: Validator<string> = createValidator(
	(v) => {
		if (!isValidIPv4(v) && !IPV6_RE.test(v)) throw new ValidationError('Invalid IP address')
		return v
	},
	(v) => (isValidIPv4(v) || IPV6_RE.test(v) ? { ok: true, value: v } : ERR_IP)
)

// ============================================================
// ID Format Validators
// ============================================================

/** CUID format (e.g., cjld2cjxh0000qzrmn831i7rn) */
const CUID_RE = /^c[a-z0-9]{24}$/
export const cuid: Validator<string> = createValidator(
	(v) => {
		if (!CUID_RE.test(v)) throw new ValidationError('Invalid CUID')
		return v
	},
	(v) => (CUID_RE.test(v) ? { ok: true, value: v } : ERR_CUID)
)

/** CUID2 format (variable length, lowercase) */
const CUID2_RE = /^[a-z][a-z0-9]{23,}$/
export const cuid2: Validator<string> = createValidator(
	(v) => {
		if (!CUID2_RE.test(v)) throw new ValidationError('Invalid CUID2')
		return v
	},
	(v) => (CUID2_RE.test(v) ? { ok: true, value: v } : ERR_CUID2)
)

/** ULID format (26 chars, Crockford base32) */
const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/
export const ulid: Validator<string> = createValidator(
	(v) => {
		if (!ULID_RE.test(v)) throw new ValidationError('Invalid ULID')
		return v
	},
	(v) => (ULID_RE.test(v) ? { ok: true, value: v } : ERR_ULID)
)

/** Base64 string */
const BASE64_RE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
export const base64: Validator<string> = createValidator(
	(v) => {
		if (!BASE64_RE.test(v)) throw new ValidationError('Invalid base64')
		return v
	},
	(v) => (BASE64_RE.test(v) ? { ok: true, value: v } : ERR_BASE64)
)
