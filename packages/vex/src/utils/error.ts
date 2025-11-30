// ============================================================
// Error Utilities (Valibot Parity)
// ============================================================

import { ValidationError } from '../core'

/**
 * ValiError - alias for ValidationError (Valibot compatibility)
 */
export { ValidationError as ValiError }

/**
 * Check if a value is a ValidationError/ValiError
 */
export const isValiError = (value: unknown): value is ValidationError => {
	return value instanceof ValidationError
}

/**
 * Check if a value is of a specific schema kind
 */
export const isOfKind = <T extends string>(value: unknown, kind: T): value is { kind: T } => {
	return (
		typeof value === 'object' &&
		value !== null &&
		'kind' in value &&
		(value as { kind: string }).kind === kind
	)
}

/**
 * Check if a value is of a specific type
 */
export const isOfType = <T extends string>(value: unknown, type: T): value is { type: T } => {
	return (
		typeof value === 'object' &&
		value !== null &&
		'type' in value &&
		(value as { type: string }).type === type
	)
}

/**
 * Get dot path from validation issues
 *
 * @example
 * const path = getDotPath({ path: ['user', 'name'] })
 * // Returns: 'user.name'
 */
export const getDotPath = (issue: { path?: PropertyKey[] }): string | undefined => {
	if (!issue.path || issue.path.length === 0) return undefined
	return issue.path
		.map((key) => (typeof key === 'number' ? `[${key}]` : String(key)))
		.join('.')
		.replace(/\.\[/g, '[')
}

/**
 * Create entries from a list of values
 *
 * @example
 * const entries = entriesFromList(['a', 'b', 'c'])
 * // Returns: [['a', 'a'], ['b', 'b'], ['c', 'c']]
 */
export const entriesFromList = <T extends string | number>(list: readonly T[]): [T, T][] => {
	return list.map((item) => [item, item])
}

/**
 * Create entries from objects
 *
 * @example
 * const entries = entriesFromObjects([{ key: 'a', value: 1 }], 'key', 'value')
 */
export const entriesFromObjects = <
	T extends Record<string, unknown>,
	K extends keyof T,
	V extends keyof T,
>(
	objects: readonly T[],
	keyProp: K,
	valueProp: V
): [T[K], T[V]][] => {
	return objects.map((obj) => [obj[keyProp], obj[valueProp]])
}
