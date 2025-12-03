// ============================================================
// Vex Comprehensive Benchmark Suite
// ============================================================

import {
	array,
	bool,
	coerce,
	cuid,
	cuid2,
	date,
	dateOnly,
	datetime,
	discriminatedUnion,
	email,
	emoji,
	finite,
	gte,
	hash,
	int,
	ip,
	ipv4,
	ipv6,
	len,
	literal,
	lte,
	max,
	maxValue,
	min,
	minValue,
	nanoid,
	negative,
	nonempty,
	nullable,
	num,
	object,
	optional,
	pattern,
	pick,
	positive,
	record,
	safeParse,
	str,
	time,
	transform,
	tuple,
	ulid,
	union,
	url,
	uuid,
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
	return `${result.name.padEnd(45)} ${result.opsPerSec.toLocaleString().padStart(15)} ops/sec`
}

function printSection(title: string) {
	console.log(`\n--- ${title} ---`)
}

// ============================================================
// Run Benchmarks
// ============================================================

console.log('='.repeat(70))
console.log('Vex Comprehensive Benchmark Suite')
console.log('='.repeat(70))

const results: BenchResult[] = []

// ============================================================
// 1. Primitive Validation
// ============================================================
printSection('Primitive Validation')

const strValidator = str()
const numValidator = num()
const boolValidator = bool()

results.push(bench('str()', () => strValidator('hello')))
results.push(bench('num()', () => numValidator(42)))
results.push(bench('bool()', () => boolValidator(true)))

// ============================================================
// 2. String Validators
// ============================================================
printSection('String Validators')

const emailValidator = str(email)
const uuidValidator = str(uuid)
const urlValidator = str(url)
const ulidValidator = str(ulid)
const nanoidValidator = str(nanoid)
const ipValidator = str(ip)
const ipv4Validator = str(ipv4)
const ipv6Validator = str(ipv6)
const emojiValidator = str(emoji)
const regexValidator = str(pattern(/^[a-z]+$/))
const nonemptyValidator = str(nonempty)
const minLenValidator = str(min(3))
const maxLenValidator = str(max(100))
const lenValidator = str(len(5))

results.push(bench('str(email)', () => emailValidator('test@example.com')))
results.push(bench('str(uuid)', () => uuidValidator('550e8400-e29b-41d4-a716-446655440000')))
results.push(bench('str(url)', () => urlValidator('https://example.com')))
results.push(bench('str(ulid)', () => ulidValidator('01ARZ3NDEKTSV4RRFFQ69G5FAV')))
results.push(bench('str(nanoid)', () => nanoidValidator('V1StGXR8_Z5jdHi6B-myT')))

// Hash and CUID validators
const cuidValidator = str(cuid)
const cuid2Validator = str(cuid2)
const sha256Validator = str(hash('sha256'))

results.push(bench('str(cuid)', () => cuidValidator('cjld2cjxh0000qzrmn831i7rn')))
results.push(bench('str(cuid2)', () => cuid2Validator('tz4a98xxat96iws9zmbrgj3a')))
results.push(
	bench('str(hash("sha256"))', () =>
		sha256Validator('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
	),
)
results.push(bench('str(ip)', () => ipValidator('192.168.1.1')))
results.push(bench('str(ipv4)', () => ipv4Validator('192.168.1.1')))
results.push(bench('str(ipv6)', () => ipv6Validator('2001:0db8:85a3:0000:0000:8a2e:0370:7334')))
results.push(bench('str(emoji)', () => emojiValidator('😀')))
results.push(bench('str(regex)', () => regexValidator('hello')))
results.push(bench('str(nonempty)', () => nonemptyValidator('hello')))
results.push(bench('str(minLength(3))', () => minLenValidator('hello')))
results.push(bench('str(maxLength(100))', () => maxLenValidator('hello')))
results.push(bench('str(len(5))', () => lenValidator('hello')))

// ============================================================
// 3. Number Validators
// ============================================================
printSection('Number Validators')

const intValidator = num(int)
const positiveValidator = num(positive)
const negativeValidator = num(negative)
const finiteValidator = num(finite)
const gteValidator = num(gte(0))
const lteValidator = num(lte(100))
const rangeValidator = num(int, gte(0), lte(100))

// minValue/maxValue work with number | bigint | Date
const minValueValidator = minValue(0)
const maxValueValidator = maxValue(100)

results.push(bench('num(int)', () => intValidator(42)))
results.push(bench('num(positive)', () => positiveValidator(42)))
results.push(bench('num(negative)', () => negativeValidator(-42)))
results.push(bench('num(finite)', () => finiteValidator(42)))
results.push(bench('num(gte(0))', () => gteValidator(42)))
results.push(bench('num(lte(100))', () => lteValidator(42)))
results.push(bench('minValue(0)', () => minValueValidator(42)))
results.push(bench('maxValue(100)', () => maxValueValidator(42)))
results.push(bench('num(int, gte, lte)', () => rangeValidator(42)))

// ============================================================
// 4. Date/Time Validators
// ============================================================
printSection('Date/Time Validators')

const isoDateValidator = str(dateOnly)
const isoTimeValidator = str(time)
const isoDateTimeValidator = str(datetime)
const dateValidator = date()

results.push(bench('str(isoDate)', () => isoDateValidator('2024-01-15')))
results.push(bench('str(isoTime)', () => isoTimeValidator('14:30:00')))
results.push(bench('str(isoDateTime)', () => isoDateTimeValidator('2024-01-15T14:30:00Z')))
results.push(bench('date()', () => dateValidator(new Date())))

// ============================================================
// 5. Object Validation
// ============================================================
printSection('Object Validation')

const simpleObject = object({ name: str() })
const mediumObject = object({
	name: str(nonempty),
	age: num(int, gte(0)),
	email: str(email),
})
const complexObject = object({
	name: str(nonempty),
	age: num(int, gte(0), lte(150)),
	email: str(email),
	bio: optional(str()),
	tags: array(str()),
})

const simpleData = { name: 'John' }
const mediumData = { name: 'John', age: 30, email: 'john@example.com' }
const complexData = {
	name: 'John',
	age: 30,
	email: 'john@example.com',
	bio: 'Hello',
	tags: ['a', 'b'],
}

results.push(bench('object (1 field)', () => simpleObject(simpleData)))
results.push(bench('object (3 fields)', () => mediumObject(mediumData)))
results.push(bench('object (5 fields)', () => complexObject(complexData)))

// Nested object
const nestedObject = object({
	user: mediumObject,
	metadata: object({
		createdAt: str(),
		updatedAt: optional(str()),
	}),
})
const nestedData = {
	user: mediumData,
	metadata: { createdAt: '2024-01-01', updatedAt: '2024-01-02' },
}
results.push(bench('object (nested)', () => nestedObject(nestedData)))

// Pick - pick works on shapes, not validators
const userShape = { name: str(nonempty), email: str(email), age: num(int) }
const pickedObject = object(pick(userShape, ['name', 'email']))
results.push(
	bench('pick (2 fields)', () => pickedObject({ name: 'John', email: 'john@example.com' })),
)

// ============================================================
// 6. Array Validation
// ============================================================
printSection('Array Validation')

const arrayStr = array(str())
const arrayNum = array(num(int))
const arrayObject = array(simpleObject)

const arr5 = [1, 2, 3, 4, 5]
const arr10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const arr50 = Array.from({ length: 50 }, (_, i) => i)
const arrStr5 = ['a', 'b', 'c', 'd', 'e']
const arrObj5 = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' }]

results.push(bench('array[5] str', () => arrayStr(arrStr5)))
results.push(bench('array[5] num', () => arrayNum(arr5)))
results.push(bench('array[10] num', () => arrayNum(arr10)))
results.push(bench('array[50] num', () => arrayNum(arr50)))
results.push(bench('array[5] object', () => arrayObject(arrObj5)))

// ============================================================
// 7. Tuple Validation
// ============================================================
printSection('Tuple Validation')

const tuple2 = tuple(str(), num())
const tuple3 = tuple(str(), num(), bool())
const tuple5 = tuple(str(), num(), bool(), str(), num())

results.push(bench('tuple[2]', () => tuple2(['hello', 42])))
results.push(bench('tuple[3]', () => tuple3(['hello', 42, true])))
results.push(bench('tuple[5]', () => tuple5(['hello', 42, true, 'world', 99])))

// ============================================================
// 8. Union & Discriminated Union
// ============================================================
printSection('Union & Discriminated Union')

const union2 = union(str(), num())
const union3 = union(str(), num(), bool())
const union5 = union(str(), num(), bool(), literal('special'), literal(42))

results.push(bench('union[2] (1st match)', () => union2('hello')))
results.push(bench('union[2] (2nd match)', () => union2(42)))
results.push(bench('union[3] (1st match)', () => union3('hello')))
results.push(bench('union[3] (3rd match)', () => union3(true)))
results.push(bench('union[5] (5th match)', () => union5(42)))

// Discriminated union - takes an array of parsers
const discUnion = discriminatedUnion('type', [
	object({ type: literal('a'), value: str() }),
	object({ type: literal('b'), count: num() }),
	object({ type: literal('c'), flag: bool() }),
])

results.push(bench('discriminatedUnion (1st)', () => discUnion({ type: 'a', value: 'hello' })))
results.push(bench('discriminatedUnion (3rd)', () => discUnion({ type: 'c', flag: true })))

// ============================================================
// 9. Optional & Nullable
// ============================================================
printSection('Optional & Nullable')

const optionalStr = optional(str())
const nullableStr = nullable(str())
const optionalNullableStr = optional(nullable(str()))

results.push(bench('optional (present)', () => optionalStr('hello')))
results.push(bench('optional (undefined)', () => optionalStr(undefined)))
results.push(bench('nullable (present)', () => nullableStr('hello')))
results.push(bench('nullable (null)', () => nullableStr(null)))
results.push(bench('optional(nullable) undef', () => optionalNullableStr(undefined)))
results.push(bench('optional(nullable) null', () => optionalNullableStr(null)))

// ============================================================
// 10. Record Validation
// ============================================================
printSection('Record Validation')

const recordStrNum = record(str(), num())
const small = { a: 1, b: 2, c: 3 }
const medium = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 }

results.push(bench('record (3 keys)', () => recordStrNum(small)))
results.push(bench('record (10 keys)', () => recordStrNum(medium)))

// ============================================================
// 11. Transform & Coerce
// ============================================================
printSection('Transform & Coerce')

// transform takes (validator, fn) - not for pipe
const transformUpper = transform(str(), (s) => s.toUpperCase())
const transformTrim = transform(str(), (s) => s.trim())

results.push(bench('transform (uppercase)', () => transformUpper('hello')))
results.push(bench('transform (trim)', () => transformTrim('  hello  ')))
results.push(bench('coerce.string', () => coerce.string(123)))
results.push(bench('coerce.number', () => coerce.number('42')))
results.push(bench('coerce.boolean', () => coerce.boolean(1)))

// ============================================================
// 12. Safe Parse
// ============================================================
printSection('Safe Parse')

const safeSimple = safeParse(simpleObject)
const safeMedium = safeParse(mediumObject)
const safeComplex = safeParse(complexObject)

results.push(bench('safeParse simple (valid)', () => safeSimple(simpleData)))
results.push(bench('safeParse simple (invalid)', () => safeSimple({ name: 123 })))
results.push(bench('safeParse medium (valid)', () => safeMedium(mediumData)))
results.push(bench('safeParse complex (valid)', () => safeComplex(complexData)))

// ============================================================
// 13. Literal
// ============================================================
printSection('Literal')

const literalStr = literal('hello')
const literalNum = literal(42)
const literalBool = literal(true)

results.push(bench('literal (string)', () => literalStr('hello')))
results.push(bench('literal (number)', () => literalNum(42)))
results.push(bench('literal (boolean)', () => literalBool(true)))

// ============================================================
// Print Results
// ============================================================
console.log(`\n${'='.repeat(70)}`)
console.log('All Results:')
console.log('='.repeat(70))
for (const result of results) {
	console.log(formatResult(result))
}

// Summary by category
console.log(`\n${'='.repeat(70)}`)
console.log('Summary:')
console.log('='.repeat(70))
const avgOps = Math.round(results.reduce((a, b) => a + b.opsPerSec, 0) / results.length)
const minResult = results.reduce((a, b) => (a.opsPerSec < b.opsPerSec ? a : b))
const maxResult = results.reduce((a, b) => (a.opsPerSec > b.opsPerSec ? a : b))

console.log(`Total benchmarks: ${results.length}`)
console.log(`Average: ${avgOps.toLocaleString()} ops/sec`)
console.log(`Fastest: ${maxResult.name} (${maxResult.opsPerSec.toLocaleString()} ops/sec)`)
console.log(`Slowest: ${minResult.name} (${minResult.opsPerSec.toLocaleString()} ops/sec)`)
