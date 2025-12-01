// ============================================================
// Text Validators (Graphemes and Words)
// ============================================================

import type { Result, Validator } from '../core'
import { createValidator, ValidationError } from '../core'

// ============================================================
// Grapheme Validators
// ============================================================

/** Get grapheme count using Intl.Segmenter */
const getGraphemeCount = (v: string): number => {
	const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
	return [...segmenter.segment(v)].length
}

/** Exact grapheme count */
export const graphemes = (n: number): Validator<string> => {
	const msg = `Must have exactly ${n} graphemes`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (getGraphemeCount(v) !== n) throw new ValidationError(msg)
			return v
		},
		(v) => (getGraphemeCount(v) === n ? { ok: true, value: v } : err),
	)
}

/** Minimum grapheme count */
export const minGraphemes = (n: number): Validator<string> => {
	const msg = `Must have at least ${n} graphemes`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (getGraphemeCount(v) < n) throw new ValidationError(msg)
			return v
		},
		(v) => (getGraphemeCount(v) >= n ? { ok: true, value: v } : err),
	)
}

/** Maximum grapheme count */
export const maxGraphemes = (n: number): Validator<string> => {
	const msg = `Must have at most ${n} graphemes`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (getGraphemeCount(v) > n) throw new ValidationError(msg)
			return v
		},
		(v) => (getGraphemeCount(v) <= n ? { ok: true, value: v } : err),
	)
}

// ============================================================
// Word Validators
// ============================================================

/** Get word count using Intl.Segmenter */
const getWordCount = (v: string): number => {
	const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' })
	return [...segmenter.segment(v)].filter((s) => s.isWordLike).length
}

/** Exact word count */
export const words = (n: number): Validator<string> => {
	const msg = `Must have exactly ${n} words`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (getWordCount(v) !== n) throw new ValidationError(msg)
			return v
		},
		(v) => (getWordCount(v) === n ? { ok: true, value: v } : err),
	)
}

/** Minimum word count */
export const minWords = (n: number): Validator<string> => {
	const msg = `Must have at least ${n} words`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (getWordCount(v) < n) throw new ValidationError(msg)
			return v
		},
		(v) => (getWordCount(v) >= n ? { ok: true, value: v } : err),
	)
}

/** Maximum word count */
export const maxWords = (n: number): Validator<string> => {
	const msg = `Must have at most ${n} words`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (getWordCount(v) > n) throw new ValidationError(msg)
			return v
		},
		(v) => (getWordCount(v) <= n ? { ok: true, value: v } : err),
	)
}

/** Not grapheme count */
export const notGraphemes = (n: number): Validator<string> => {
	const msg = `Must not have ${n} graphemes`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (getGraphemeCount(v) === n) throw new ValidationError(msg)
			return v
		},
		(v) => (getGraphemeCount(v) !== n ? { ok: true, value: v } : err),
	)
}

/** Not word count */
export const notWords = (n: number): Validator<string> => {
	const msg = `Must not have ${n} words`
	const err: Result<never> = { ok: false, error: msg }
	return createValidator(
		(v) => {
			if (getWordCount(v) === n) throw new ValidationError(msg)
			return v
		},
		(v) => (getWordCount(v) !== n ? { ok: true, value: v } : err),
	)
}
