import { SchemaError } from '../errors'
import type { BaseSchema, Result } from '../types'
import { toStandardIssue } from '../types'

// ============================================================
// Primitive Schemas
// ============================================================

// --- any ---
export function any(): BaseSchema<unknown, unknown> {
	const safeParse = (data: unknown): Result<unknown> => ({ success: true, data })

	return {
		_input: undefined as unknown as unknown,
		_output: undefined as unknown as unknown,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: 'zen',
			validate: (v): { value: unknown } | { issues: ReadonlyArray<{ message: string; path?: PropertyKey[] }> } => ({ value: v }),
			types: undefined as unknown as { input: unknown; output: unknown },
		},
		parse: (data) => data,
		safeParse,
		parseAsync: async (data) => data,
		safeParseAsync: async (data) => safeParse(data),
	}
}

// --- unknown ---
export function unknown(): BaseSchema<unknown, unknown> {
	return any() // Same as any at runtime
}

// --- null ---
export function null_(): BaseSchema<null, null> {
	const safeParse = (data: unknown): Result<null> => {
		if (data === null) return { success: true, data }
		return { success: false, issues: [{ message: 'Expected null' }] }
	}

	return {
		_input: undefined as unknown as null,
		_output: undefined as unknown as null,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: 'zen',
			validate: (v): { value: null } | { issues: ReadonlyArray<{ message: string; path?: PropertyKey[] }> } => {
				const result = safeParse(v)
				if (result.success) return { value: result.data }
				return { issues: result.issues.map(toStandardIssue) }
			},
			types: undefined as unknown as { input: null; output: null },
		},
		parse: (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse,
		parseAsync: async (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParseAsync: async (data) => safeParse(data),
	}
}

// --- undefined ---
export function undefined_(): BaseSchema<undefined, undefined> {
	const safeParse = (data: unknown): Result<undefined> => {
		if (data === undefined) return { success: true, data }
		return { success: false, issues: [{ message: 'Expected undefined' }] }
	}

	return {
		_input: undefined as unknown as undefined,
		_output: undefined as unknown as undefined,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: 'zen',
			validate: (v): { value: undefined } | { issues: ReadonlyArray<{ message: string; path?: PropertyKey[] }> } => {
				const result = safeParse(v)
				if (result.success) return { value: result.data }
				return { issues: result.issues.map(toStandardIssue) }
			},
			types: undefined as unknown as { input: undefined; output: undefined },
		},
		parse: (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse,
		parseAsync: async (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParseAsync: async (data) => safeParse(data),
	}
}

// --- void ---
export function void_(): BaseSchema<void, void> {
	const safeParse = (data: unknown): Result<void> => {
		if (data === undefined) return { success: true, data: undefined }
		return { success: false, issues: [{ message: 'Expected void (undefined)' }] }
	}

	return {
		_input: undefined as unknown as void,
		_output: undefined as unknown as void,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: 'zen',
			validate: (v): { value: void } | { issues: ReadonlyArray<{ message: string; path?: PropertyKey[] }> } => {
				const result = safeParse(v)
				if (result.success) return { value: result.data }
				return { issues: result.issues.map(toStandardIssue) }
			},
			types: undefined as unknown as { input: void; output: void },
		},
		parse: (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse,
		parseAsync: async (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParseAsync: async (data) => safeParse(data),
	}
}

// --- never ---
export function never(): BaseSchema<never, never> {
	const safeParse = (_data: unknown): Result<never> => {
		return { success: false, issues: [{ message: 'Expected never (no value is valid)' }] }
	}

	const errorIssue = [{ message: 'Expected never (no value is valid)' }]

	return {
		_input: undefined as unknown as never,
		_output: undefined as unknown as never,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: 'zen',
			validate: (): { value: never } | { issues: ReadonlyArray<{ message: string; path?: PropertyKey[] }> } => ({ issues: [{ message: 'Expected never' }] }),
			types: undefined as unknown as { input: never; output: never },
		},
		parse: (_data) => {
			throw new SchemaError(errorIssue)
		},
		safeParse,
		parseAsync: async (_data) => {
			throw new SchemaError(errorIssue)
		},
		safeParseAsync: async (data) => safeParse(data),
	}
}

// --- nan ---
export function nan(): BaseSchema<number, number> {
	const safeParse = (data: unknown): Result<number> => {
		if (typeof data === 'number' && Number.isNaN(data)) {
			return { success: true, data }
		}
		return { success: false, issues: [{ message: 'Expected NaN' }] }
	}

	return {
		_input: undefined as unknown as number,
		_output: undefined as unknown as number,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: 'zen',
			validate: (v): { value: number } | { issues: ReadonlyArray<{ message: string; path?: PropertyKey[] }> } => {
				const result = safeParse(v)
				if (result.success) return { value: result.data }
				return { issues: result.issues.map(toStandardIssue) }
			},
			types: undefined as unknown as { input: number; output: number },
		},
		parse: (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse,
		parseAsync: async (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParseAsync: async (data) => safeParse(data),
	}
}

// --- date ---
export function date(): BaseSchema<Date, Date> {
	const safeParse = (data: unknown): Result<Date> => {
		if (data instanceof Date) {
			if (Number.isNaN(data.getTime())) {
				return { success: false, issues: [{ message: 'Invalid date' }] }
			}
			return { success: true, data }
		}
		return { success: false, issues: [{ message: 'Expected Date' }] }
	}

	return {
		_input: undefined as unknown as Date,
		_output: undefined as unknown as Date,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: 'zen',
			validate: (v): { value: Date } | { issues: ReadonlyArray<{ message: string; path?: PropertyKey[] }> } => {
				const result = safeParse(v)
				if (result.success) return { value: result.data }
				return { issues: result.issues.map(toStandardIssue) }
			},
			types: undefined as unknown as { input: Date; output: Date },
		},
		parse: (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse,
		parseAsync: async (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParseAsync: async (data) => safeParse(data),
	}
}

// --- bigint ---
export function bigint(): BaseSchema<bigint, bigint> {
	const safeParse = (data: unknown): Result<bigint> => {
		if (typeof data === 'bigint') return { success: true, data }
		return { success: false, issues: [{ message: 'Expected bigint' }] }
	}

	return {
		_input: undefined as unknown as bigint,
		_output: undefined as unknown as bigint,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: 'zen',
			validate: (v): { value: bigint } | { issues: ReadonlyArray<{ message: string; path?: PropertyKey[] }> } => {
				const result = safeParse(v)
				if (result.success) return { value: result.data }
				return { issues: result.issues.map(toStandardIssue) }
			},
			types: undefined as unknown as { input: bigint; output: bigint },
		},
		parse: (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse,
		parseAsync: async (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParseAsync: async (data) => safeParse(data),
	}
}

// --- symbol ---
export function symbol(): BaseSchema<symbol, symbol> {
	const safeParse = (data: unknown): Result<symbol> => {
		if (typeof data === 'symbol') return { success: true, data }
		return { success: false, issues: [{ message: 'Expected symbol' }] }
	}

	return {
		_input: undefined as unknown as symbol,
		_output: undefined as unknown as symbol,
		_checks: [],
		'~standard': {
			version: 1,
			vendor: 'zen',
			validate: (v): { value: symbol } | { issues: ReadonlyArray<{ message: string; path?: PropertyKey[] }> } => {
				const result = safeParse(v)
				if (result.success) return { value: result.data }
				return { issues: result.issues.map(toStandardIssue) }
			},
			types: undefined as unknown as { input: symbol; output: symbol },
		},
		parse: (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParse,
		parseAsync: async (data) => {
			const result = safeParse(data)
			if (result.success) return result.data
			throw new SchemaError(result.issues)
		},
		safeParseAsync: async (data) => safeParse(data),
	}
}
