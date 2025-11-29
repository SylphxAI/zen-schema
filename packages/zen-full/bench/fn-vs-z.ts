// ============================================================
// Full Benchmark: fn (Functional API) vs z (Schema API)
// ============================================================

import { fn, z } from '../src'

const ITERATIONS = 100_000

function bench(name: string, func: () => void): number {
	// Warmup
	for (let i = 0; i < 1000; i++) func()

	const start = performance.now()
	for (let i = 0; i < ITERATIONS; i++) func()
	const time = performance.now() - start

	return (ITERATIONS / time) * 1000
}

interface Result {
	name: string
	fn: number
	z: number
}

const results: Result[] = []

function runBench(name: string, fnFn: () => void, zFn: () => void) {
	const fnOps = bench('fn', fnFn)
	const zOps = bench('z', zFn)
	results.push({ name, fn: fnOps, z: zOps })

	const ratio = fnOps / zOps
	const faster = ratio > 1 ? 'fn' : 'z'
	const diff = ratio > 1 ? ratio : 1 / ratio

	console.log(
		`${name.padEnd(40)} fn: ${(fnOps / 1e6).toFixed(1)}M  z: ${(zOps / 1e6).toFixed(1)}M  (${faster} ${diff.toFixed(2)}x faster)`
	)
}

console.log('='.repeat(80))
console.log('🧘 Full Benchmark: fn (Functional) vs z (Schema)')
console.log('='.repeat(80))
console.log()

// ============================================================
// Schema Creation
// ============================================================

console.log('━━━ Schema Creation ━━━')

runBench('string()', () => fn.str, () => z.string())

runBench('string().email()', () => fn.pipe(fn.str, fn.email), () => z.string().email())

runBench(
	'string().min(1).max(100)',
	() => fn.pipe(fn.str, fn.min(1), fn.max(100)),
	() => z.string().min(1).max(100)
)

runBench('number()', () => fn.num, () => z.number())

runBench(
	'number().int().positive()',
	() => fn.pipe(fn.num, fn.int, fn.positive),
	() => z.number().int().positive()
)

console.log()

// ============================================================
// Validation (direct call, throws on error)
// ============================================================

console.log('━━━ Direct Validation (throws on error) ━━━')

const fnStr = fn.str
const zStr = z.string()

runBench('parse string', () => fnStr('hello'), () => zStr.parse('hello'))

const fnEmail = fn.pipe(fn.str, fn.email)
const zEmail = z.string().email()

runBench('parse email (valid)', () => fnEmail('test@example.com'), () => zEmail.parse('test@example.com'))

const fnNum = fn.pipe(fn.num, fn.int, fn.positive)
const zNum = z.number().int().positive()

runBench('parse number.int.positive', () => fnNum(42), () => zNum.parse(42))

console.log()

// ============================================================
// SafeParse (valid inputs)
// ============================================================

console.log('━━━ SafeParse (valid inputs) ━━━')

runBench('safeParse string (valid)', () => fn.safeParse(fnStr)('hello'), () => zStr.safeParse('hello'))

runBench('safeParse email (valid)', () => fn.safeParse(fnEmail)('test@example.com'), () => zEmail.safeParse('test@example.com'))

console.log()

// ============================================================
// SafeParse (invalid inputs)
// ============================================================

console.log('━━━ SafeParse (invalid inputs) ━━━')

runBench('safeParse string (invalid)', () => fn.safeParse(fnStr)(123), () => zStr.safeParse(123))

runBench('safeParse email (invalid)', () => fn.safeParse(fnEmail)('invalid'), () => zEmail.safeParse('invalid'))

console.log()

// ============================================================
// Object Validation
// ============================================================

console.log('━━━ Object Validation ━━━')

const testUser = { name: 'Alice', age: 30, email: 'alice@example.com' }

const fnUser = fn.object({
	name: fn.pipe(fn.str, fn.nonempty),
	age: fn.pipe(fn.num, fn.int, fn.gte(0)),
	email: fn.pipe(fn.str, fn.email),
})

const zUser = z.object({
	name: z.string().nonempty(),
	age: z.number().int().min(0),
	email: z.string().email(),
})

runBench('parse object (3 fields)', () => fnUser(testUser), () => zUser.parse(testUser))

runBench('safeParse object (valid)', () => fn.safeParse(fnUser)(testUser), () => zUser.safeParse(testUser))

const invalidUser = { name: '', age: -1, email: 'bad' }

runBench('safeParse object (invalid)', () => fn.safeParse(fnUser)(invalidUser), () => zUser.safeParse(invalidUser))

console.log()

// ============================================================
// Array Validation
// ============================================================

console.log('━━━ Array Validation ━━━')

const testNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const fnNumbers = fn.array(fn.pipe(fn.num, fn.int))
const zNumbers = z.array(z.number().int())

runBench('parse array of 10 ints', () => fnNumbers(testNumbers), () => zNumbers.parse(testNumbers))

const testUsers = Array.from({ length: 10 }, (_, i) => ({
	name: `User ${i}`,
	age: 20 + i,
	email: `user${i}@example.com`,
}))

const fnUsers = fn.array(fnUser)
const zUsers = z.array(zUser)

runBench('parse array of 10 objects', () => fnUsers(testUsers), () => zUsers.parse(testUsers))

console.log()

// ============================================================
// Summary
// ============================================================

console.log('='.repeat(80))
console.log('📊 Summary')
console.log('='.repeat(80))
console.log()

const creation = results.slice(0, 5)
const directValidation = results.slice(5, 8)
const safeParseValid = results.slice(8, 10)
const safeParseInvalid = results.slice(10, 12)
const objectArr = results.slice(12)

const avg = (arr: Result[]) => arr.reduce((a, r) => a + r.fn / r.z, 0) / arr.length

console.log('| Category              | fn vs z         |')
console.log('|-----------------------|-----------------|')
console.log(`| Schema Creation       | ${avg(creation).toFixed(2)}x           |`)
console.log(`| Direct Validation     | ${avg(directValidation).toFixed(2)}x           |`)
console.log(`| SafeParse (valid)     | ${avg(safeParseValid).toFixed(2)}x           |`)
console.log(`| SafeParse (invalid)   | ${avg(safeParseInvalid).toFixed(2)}x           |`)
console.log(`| Object/Array          | ${avg(objectArr).toFixed(2)}x           |`)
console.log()

const overall = results.reduce((a, r) => a + r.fn / r.z, 0) / results.length
console.log(`🎯 Overall: fn is ${overall.toFixed(2)}x ${overall > 1 ? 'faster' : 'slower'} than z on average`)
console.log()
