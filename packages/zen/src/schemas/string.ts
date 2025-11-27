import { SchemaError } from '../errors'
import { extendSchema, type ExtendedSchema } from '../schema-methods'
import type { BaseSchema, Check, Issue, Result } from '../types'

const VENDOR = 'zen'

// Type guard
const isString = (v: unknown): v is string => typeof v === 'string'

// ============================================================
// String Schema Interface
// ============================================================

export interface StringSchema extends ExtendedSchema<string, string> {
	min(length: number, message?: string): StringSchema
	max(length: number, message?: string): StringSchema
	length(length: number, message?: string): StringSchema
	email(message?: string): StringSchema
	url(message?: string): StringSchema
	uuid(message?: string): StringSchema
	cuid(message?: string): StringSchema
	cuid2(message?: string): StringSchema
	ulid(message?: string): StringSchema
	regex(pattern: RegExp, message?: string): StringSchema
	startsWith(prefix: string, message?: string): StringSchema
	endsWith(suffix: string, message?: string): StringSchema
	includes(search: string, message?: string): StringSchema
	trim(): StringSchema
	toLowerCase(): StringSchema
	toUpperCase(): StringSchema
	nonempty(message?: string): StringSchema
	ip(message?: string): StringSchema
	emoji(message?: string): StringSchema
	datetime(message?: string): StringSchema
}

// ============================================================
// Validators
// ============================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const URL_REGEX = /^https?:\/\/.+/
const CUID_REGEX = /^c[^\s-]{8,}$/i
const CUID2_REGEX = /^[a-z][a-z0-9]{23}$/
const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/
const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
const EMOJI_REGEX = /\p{Emoji}/u
const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/

// ============================================================
// Implementation
// ============================================================

interface StringCheck {
	name: string
	check: (v: string) => boolean
	message: string
	transform?: (v: string) => string
}

function createStringSchema(checks: StringCheck[] = []): StringSchema {
	// Apply transforms during parse
	const applyTransforms = (value: string): string => {
		let result = value
		for (const check of checks) {
			if (check.transform) {
				result = check.transform(result)
			}
		}
		return result
	}

	const baseSchema: BaseSchema<string, string> = {
		_input: undefined as string,
		_output: undefined as string,
		_checks: checks as Check<string>[],
		'~standard': {
			version: 1,
			vendor: VENDOR,
			validate(value: unknown) {
				const result = baseSchema.safeParse(value)
				if (result.success) return { value: result.data }
				return {
					issues: result.issues.map((i) => ({
						message: i.message,
						path: i.path ? [...i.path] : undefined,
					})),
				}
			},
			types: undefined as unknown as { input: string; output: string },
		},
		parse(data: unknown): string {
			const result = this.safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse(data: unknown): Result<string> {
			if (!isString(data)) {
				return { success: false, issues: [{ message: 'Expected string' }] }
			}

			// Apply transforms first
			const transformed = applyTransforms(data)

			// Run checks
			let issues: Issue[] | null = null
			for (const check of checks) {
				if (!check.check(transformed)) {
					if (!issues) issues = []
					issues.push({ message: check.message })
				}
			}

			if (issues) return { success: false, issues }
			return { success: true, data: transformed }
		},
		parseAsync: async (data: unknown) => baseSchema.parse(data),
		safeParseAsync: async (data: unknown) => baseSchema.safeParse(data),
	}

	// Get extended methods
	const extended = extendSchema(baseSchema)

	const addCheck = (check: StringCheck): StringSchema => {
		return createStringSchema([...checks, check])
	}

	// Create the full schema with string-specific methods
	const schema: StringSchema = Object.assign(extended, {
		min(length: number, message?: string) {
			return addCheck({
				name: 'min',
				check: (v) => v.length >= length,
				message: message ?? `Must be at least ${length} characters`,
			})
		},

		max(length: number, message?: string) {
			return addCheck({
				name: 'max',
				check: (v) => v.length <= length,
				message: message ?? `Must be at most ${length} characters`,
			})
		},

		length(len: number, message?: string) {
			return addCheck({
				name: 'length',
				check: (v) => v.length === len,
				message: message ?? `Must be exactly ${len} characters`,
			})
		},

		email(message?: string) {
			return addCheck({
				name: 'email',
				check: (v) => EMAIL_REGEX.test(v),
				message: message ?? 'Invalid email address',
			})
		},

		url(message?: string) {
			return addCheck({
				name: 'url',
				check: (v) => URL_REGEX.test(v),
				message: message ?? 'Invalid URL',
			})
		},

		uuid(message?: string) {
			return addCheck({
				name: 'uuid',
				check: (v) => UUID_REGEX.test(v),
				message: message ?? 'Invalid UUID',
			})
		},

		cuid(message?: string) {
			return addCheck({
				name: 'cuid',
				check: (v) => CUID_REGEX.test(v),
				message: message ?? 'Invalid CUID',
			})
		},

		cuid2(message?: string) {
			return addCheck({
				name: 'cuid2',
				check: (v) => CUID2_REGEX.test(v),
				message: message ?? 'Invalid CUID2',
			})
		},

		ulid(message?: string) {
			return addCheck({
				name: 'ulid',
				check: (v) => ULID_REGEX.test(v),
				message: message ?? 'Invalid ULID',
			})
		},

		regex(pattern: RegExp, message?: string) {
			return addCheck({
				name: 'regex',
				check: (v) => pattern.test(v),
				message: message ?? 'Invalid format',
			})
		},

		startsWith(prefix: string, message?: string) {
			return addCheck({
				name: 'startsWith',
				check: (v) => v.startsWith(prefix),
				message: message ?? `Must start with "${prefix}"`,
			})
		},

		endsWith(suffix: string, message?: string) {
			return addCheck({
				name: 'endsWith',
				check: (v) => v.endsWith(suffix),
				message: message ?? `Must end with "${suffix}"`,
			})
		},

		includes(search: string, message?: string) {
			return addCheck({
				name: 'includes',
				check: (v) => v.includes(search),
				message: message ?? `Must include "${search}"`,
			})
		},

		trim() {
			return addCheck({
				name: 'trim',
				check: () => true,
				message: '',
				transform: (v) => v.trim(),
			})
		},

		toLowerCase() {
			return addCheck({
				name: 'toLowerCase',
				check: () => true,
				message: '',
				transform: (v) => v.toLowerCase(),
			})
		},

		toUpperCase() {
			return addCheck({
				name: 'toUpperCase',
				check: () => true,
				message: '',
				transform: (v) => v.toUpperCase(),
			})
		},

		nonempty(message?: string) {
			return this.min(1, message ?? 'Must not be empty')
		},

		ip(message?: string) {
			return addCheck({
				name: 'ip',
				check: (v) => IP_REGEX.test(v),
				message: message ?? 'Invalid IP address',
			})
		},

		emoji(message?: string) {
			return addCheck({
				name: 'emoji',
				check: (v) => EMOJI_REGEX.test(v),
				message: message ?? 'Must contain emoji',
			})
		},

		datetime(message?: string) {
			return addCheck({
				name: 'datetime',
				check: (v) => DATETIME_REGEX.test(v),
				message: message ?? 'Invalid datetime',
			})
		},
	})

	return schema
}

/**
 * Create a string schema
 */
export function string(): StringSchema {
	return createStringSchema()
}
