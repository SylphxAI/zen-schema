// ============================================================
// Vex Benchmark Suite
// ============================================================

import {
	array,
	bool,
	email,
	gte,
	int,
	lte,
	min,
	nonempty,
	num,
	object,
	optional,
	pipe,
	safeParse,
	str,
	union,
} from '../src'

// ============================================================
// Benchmark Utilities
// ============================================================

interface BenchResult {
	name: string
	ops: number
	time: number
	opsPerSec: number
}

function bench(name: string, fn: () => void, iterations = 100000): BenchResult {
	// Warmup
	for (let i = 0; i < 1000; i++) fn()

	const start = performance.now()
	for (let i = 0; i < iterations; i++) fn()
	const end = performance.now()

	const time = end - start
	const opsPerSec = Math.round((iterations / time) * 1000)

	return { name, ops: iterations, time, opsPerSec }
}

function formatResult(result: BenchResult): string {
	return `${result.name.padEnd(40)} ${result.opsPerSec.toLocaleString().padStart(12)} ops/sec  (${result.time.toFixed(2)}ms)`
}

// ============================================================
// Test Data
// ============================================================

const validString = 'hello@example.com'
const validNumber = 42
const validObject = { name: 'John', age: 30, email: 'john@example.com' }
const validArray = [1, 2, 3, 4, 5]
const invalidString = 'not-an-email'
const invalidNumber = 'not-a-number'

// ============================================================
// Schemas
// ============================================================

const emailValidator = pipe(str, email)
const intRangeValidator = pipe(num, int, gte(0), lte(100))
const stringMinValidator = pipe(str, min(1), nonempty)

const userSchema = object({
	name: pipe(str, nonempty),
	age: pipe(num, int, gte(0), lte(150)),
	email: pipe(str, email),
	bio: optional(str),
})

const arraySchema = array(pipe(num, int))

const unionSchema = union([str, num, bool])

const nestedSchema = object({
	user: userSchema,
	tags: array(str),
	metadata: optional(
		object({
			createdAt: str,
			updatedAt: optional(str),
		})
	),
})

// ============================================================
// Run Benchmarks
// ============================================================

console.log('='.repeat(70))
console.log('Vex Benchmark Suite')
console.log('='.repeat(70))
console.log()

const results: BenchResult[] = []

// Primitive validation
console.log('--- Primitive Validation ---')
results.push(bench('str (valid)', () => str(validString)))
results.push(
	bench('str (invalid)', () => {
		try {
			str(123)
		} catch {}
	})
)
results.push(bench('num (valid)', () => num(validNumber)))
results.push(
	bench('num (invalid)', () => {
		try {
			num('abc')
		} catch {}
	})
)

// Piped validators
console.log('\n--- Piped Validators ---')
results.push(bench('pipe(str, email) valid', () => emailValidator(validString)))
results.push(
	bench('pipe(str, email) invalid', () => {
		try {
			emailValidator(invalidString)
		} catch {}
	})
)
results.push(bench('pipe(num, int, gte, lte) valid', () => intRangeValidator(50)))
results.push(
	bench('pipe(num, int, gte, lte) invalid', () => {
		try {
			intRangeValidator(150)
		} catch {}
	})
)

// Object validation
console.log('\n--- Object Validation ---')
results.push(bench('object (valid)', () => userSchema(validObject)))
results.push(
	bench('object (invalid)', () => {
		try {
			userSchema({ name: 123 })
		} catch {}
	})
)

// Array validation
console.log('\n--- Array Validation ---')
results.push(bench('array[5] (valid)', () => arraySchema(validArray)))
results.push(
	bench('array[5] (invalid)', () => {
		try {
			arraySchema(['a', 'b'])
		} catch {}
	})
)

// Union validation
console.log('\n--- Union Validation ---')
results.push(bench('union (string match)', () => unionSchema('hello')))
results.push(bench('union (number match)', () => unionSchema(42)))
results.push(
	bench('union (no match)', () => {
		try {
			unionSchema({})
		} catch {}
	})
)

// Safe parse
console.log('\n--- Safe Parse ---')
results.push(bench('safeParse (valid)', () => safeParse(userSchema, validObject)))
results.push(bench('safeParse (invalid)', () => safeParse(userSchema, { name: 123 })))

// Nested object
console.log('\n--- Nested Objects ---')
const nestedData = {
	user: validObject,
	tags: ['a', 'b', 'c'],
	metadata: { createdAt: '2024-01-01', updatedAt: '2024-01-02' },
}
results.push(bench('nested object (valid)', () => nestedSchema(nestedData)))

// Print results
console.log('\n' + '='.repeat(70))
console.log('Results:')
console.log('='.repeat(70))
for (const result of results) {
	console.log(formatResult(result))
}

// Summary
console.log('\n' + '='.repeat(70))
console.log('Summary:')
console.log('='.repeat(70))
const avgOps = Math.round(results.reduce((a, b) => a + b.opsPerSec, 0) / results.length)
const minOps = Math.min(...results.map((r) => r.opsPerSec))
const maxOps = Math.max(...results.map((r) => r.opsPerSec))
console.log(`Average: ${avgOps.toLocaleString()} ops/sec`)
console.log(`Min: ${minOps.toLocaleString()} ops/sec`)
console.log(`Max: ${maxOps.toLocaleString()} ops/sec`)
