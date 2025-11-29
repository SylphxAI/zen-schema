// ============================================================
// Benchmark: fn API safeParse with Result-based validation
// ============================================================

import { fn, z } from '../src'

const ITERATIONS = 100_000

function bench(name: string, func: () => void): number {
	// Warmup
	for (let i = 0; i < 1000; i++) func()

	const start = performance.now()
	for (let i = 0; i < ITERATIONS; i++) func()
	const time = performance.now() - start
	const opsPerSec = (ITERATIONS / time) * 1000

	return opsPerSec
}

console.log('='.repeat(70))
console.log('🧘 fn API safeParse Benchmark (Result-based, no try-catch)')
console.log('='.repeat(70))
console.log()

// ============================================================
// String Email Validation
// ============================================================

console.log('━━━ String Email Validation ━━━')

const fnEmail = fn.pipe(fn.str, fn.email)
const zEmail = z.string().email()

// Valid input
const fnValidOps = bench('fn safeParse (valid)', () => fn.safeParse(fnEmail)('test@example.com'))
const zValidOps = bench('z safeParse (valid)', () => zEmail.safeParse('test@example.com'))

console.log(`Valid:   fn ${(fnValidOps / 1e6).toFixed(1)}M  z ${(zValidOps / 1e6).toFixed(1)}M  (fn is ${(fnValidOps / zValidOps).toFixed(2)}x)`)

// Invalid input - this is where the improvement should be visible
const fnInvalidOps = bench('fn safeParse (invalid)', () => fn.safeParse(fnEmail)('invalid'))
const zInvalidOps = bench('z safeParse (invalid)', () => zEmail.safeParse('invalid'))

console.log(`Invalid: fn ${(fnInvalidOps / 1e6).toFixed(1)}M  z ${(zInvalidOps / 1e6).toFixed(1)}M  (fn is ${(fnInvalidOps / zInvalidOps).toFixed(2)}x)`)

console.log()

// ============================================================
// Object Validation
// ============================================================

console.log('━━━ Object Validation ━━━')

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

const validUser = { name: 'Alice', age: 30, email: 'alice@example.com' }
const invalidUser = { name: '', age: -1, email: 'invalid' }

// Valid object
const fnObjValidOps = bench('fn object (valid)', () => fn.safeParse(fnUser)(validUser))
const zObjValidOps = bench('z object (valid)', () => zUser.safeParse(validUser))

console.log(`Valid:   fn ${(fnObjValidOps / 1e6).toFixed(1)}M  z ${(zObjValidOps / 1e6).toFixed(1)}M  (fn is ${(fnObjValidOps / zObjValidOps).toFixed(2)}x)`)

// Invalid object
const fnObjInvalidOps = bench('fn object (invalid)', () => fn.safeParse(fnUser)(invalidUser))
const zObjInvalidOps = bench('z object (invalid)', () => zUser.safeParse(invalidUser))

console.log(`Invalid: fn ${(fnObjInvalidOps / 1e6).toFixed(1)}M  z ${(zObjInvalidOps / 1e6).toFixed(1)}M  (fn is ${(fnObjInvalidOps / zObjInvalidOps).toFixed(2)}x)`)

console.log()

// ============================================================
// Summary
// ============================================================

console.log('='.repeat(70))
console.log('📊 Summary')
console.log('='.repeat(70))

const avgValid = ((fnValidOps / zValidOps) + (fnObjValidOps / zObjValidOps)) / 2
const avgInvalid = ((fnInvalidOps / zInvalidOps) + (fnObjInvalidOps / zObjInvalidOps)) / 2

console.log(`Valid inputs:   fn is ${avgValid.toFixed(2)}x vs z`)
console.log(`Invalid inputs: fn is ${avgInvalid.toFixed(2)}x vs z`)
console.log()

if (avgInvalid > 0.5) {
	console.log('✅ Result-based safeParse is working efficiently!')
} else {
	console.log('⚠️  safeParse on invalid inputs is still slow - may need optimization')
}
