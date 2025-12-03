// ============================================================
// Intersect Composition
// ============================================================

import type { MetaAction, Result, Schema, SchemaOrMetaAction, StandardSchemaV1 } from '../core'
import {
	addSchemaMetadata,
	applyMetaActions,
	getErrorMsg,
	type Metadata,
	separateMetaActions,
} from '../core'

/**
 * Create an intersect validator (value must match ALL schemas)
 *
 * @example
 * intersect(
 *   object({ name: str() }),
 *   object({ age: num() }),
 * )
 * intersect(
 *   object({ name: str() }),
 *   object({ age: num() }),
 *   description('User with age')
 * )
 */
export function intersect<A>(a: Schema<A>, ...rest: MetaAction[]): Schema<A>
export function intersect<A, B>(a: Schema<A>, b: Schema<B>, ...rest: MetaAction[]): Schema<A & B>
export function intersect<A, B, C>(
	a: Schema<A>,
	b: Schema<B>,
	c: Schema<C>,
	...rest: MetaAction[]
): Schema<A & B & C>
export function intersect<A, B, C, D>(
	a: Schema<A>,
	b: Schema<B>,
	c: Schema<C>,
	d: Schema<D>,
	...rest: MetaAction[]
): Schema<A & B & C & D>
export function intersect<A, B, C, D, E>(
	a: Schema<A>,
	b: Schema<B>,
	c: Schema<C>,
	d: Schema<D>,
	e: Schema<E>,
	...rest: MetaAction[]
): Schema<A & B & C & D & E>
export function intersect(...args: SchemaOrMetaAction[]): Schema<unknown> {
	const { schemas, metaActions } = separateMetaActions(args)

	if (schemas.length === 0) {
		throw new Error('intersect() requires at least one schema')
	}

	const msg = 'Value does not match all schemas in intersect'

	const fn = ((value: unknown) => {
		let result: unknown = {}

		for (const schema of schemas) {
			const validated = schema(value)
			if (
				typeof validated === 'object' &&
				validated !== null &&
				typeof result === 'object' &&
				result !== null
			) {
				Object.assign(result as object, validated)
			} else {
				result = validated
			}
		}

		return result
	}) as Schema<unknown>

	fn.safe = (value: unknown): Result<unknown> => {
		let result: unknown = {}

		for (const schema of schemas) {
			if (schema.safe) {
				const r = schema.safe(value)
				if (!r.ok) return { ok: false, error: r.error }
				if (
					typeof r.value === 'object' &&
					r.value !== null &&
					typeof result === 'object' &&
					result !== null
				) {
					Object.assign(result as object, r.value)
				} else {
					result = r.value
				}
			} else {
				try {
					const validated = schema(value)
					if (
						typeof validated === 'object' &&
						validated !== null &&
						typeof result === 'object' &&
						result !== null
					) {
						Object.assign(result as object, validated)
					} else {
						result = validated
					}
				} catch (e) {
					return { ok: false, error: getErrorMsg(e) }
				}
			}
		}

		return { ok: true, value: result }
	}

	// Add Standard Schema
	;(fn as unknown as Record<string, unknown>)['~standard'] = {
		version: 1 as const,
		vendor: 'vex',
		validate: (value: unknown): StandardSchemaV1.Result<unknown> => {
			let result: unknown = {}

			for (const schema of schemas) {
				const std = schema['~standard']
				if (std) {
					const r = std.validate(value) as StandardSchemaV1.Result<unknown>
					if (r.issues) return r
					if (
						typeof r.value === 'object' &&
						r.value !== null &&
						typeof result === 'object' &&
						result !== null
					) {
						Object.assign(result as object, r.value)
					} else {
						result = r.value
					}
				} else if (schema.safe) {
					const r = schema.safe(value)
					if (!r.ok) return { issues: [{ message: r.error }] }
					if (
						typeof r.value === 'object' &&
						r.value !== null &&
						typeof result === 'object' &&
						result !== null
					) {
						Object.assign(result as object, r.value)
					} else {
						result = r.value
					}
				} else {
					try {
						const validated = schema(value)
						if (
							typeof validated === 'object' &&
							validated !== null &&
							typeof result === 'object' &&
							result !== null
						) {
							Object.assign(result as object, validated)
						} else {
							result = validated
						}
					} catch (e) {
						return { issues: [{ message: e instanceof Error ? e.message : msg }] }
					}
				}
			}

			return { value: result }
		},
	}

	// Build metadata
	let metadata: Metadata = { type: 'intersect', inner: [...schemas] }

	// Apply MetaActions
	if (metaActions.length > 0) {
		metadata = applyMetaActions(metadata, metaActions)
	}

	addSchemaMetadata(fn, metadata)

	return fn
}
