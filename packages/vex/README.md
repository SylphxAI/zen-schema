# @sylphx/vex

> ⚡ Ultra-fast schema validation - 24x faster than Zod, 4.5x faster than Valibot

## Features

- ⚡ **Blazing Fast** - Constant validators, zero allocation
- 🌳 **Tree-shakeable** - Only bundle what you use
- 🔷 **TypeScript-first** - Full type inference
- 📦 **Tiny** - ~8KB (min+gzip)
- 0️⃣ **Zero dependencies**
- 🔌 **Standard Schema** - Works with tRPC, TanStack, Hono, etc.

## Why Vex?

| Library | Design | Schema Creation | Validation |
|---------|--------|-----------------|------------|
| **Vex** | Constants | Zero overhead | Fastest |
| Valibot | Factory functions | Allocates objects | Fast |
| Zod | Builder pattern | Allocates chains | Slowest |

```typescript
// Vex - constants (zero allocation)
str                    // already a validator function
pipe(str, email)       // compose existing functions

// Valibot - factory functions (allocates each call)
v.string()             // creates new object
v.pipe(v.string(), v.email())

// Zod - builder pattern (allocates chain)
z.string().email()     // creates new objects
```

## Installation

```bash
npm install @sylphx/vex
# or
bun add @sylphx/vex
```

## Quick Start

```typescript
import { pipe, str, num, int, email, positive, nonempty, object, safeParse } from '@sylphx/vex'

// Compose validators with pipe()
const validateEmail = pipe(str, email)
const validateAge = pipe(num, int, positive)

// Object validation
const validateUser = object({
  name: pipe(str, nonempty),
  email: pipe(str, email),
  age: pipe(num, int, positive),
})

// Direct validation (throws on error)
const user = validateUser({ name: 'Alice', email: 'alice@example.com', age: 30 })

// Safe validation (returns result)
const result = safeParse(validateUser)(data)
if (result.success) {
  console.log(result.data)
} else {
  console.log(result.error)
}
```

## API

### Type Validators

```typescript
str      // string
num      // number (excludes NaN)
bool     // boolean
arr      // array
obj      // object
bigInt   // bigint
date     // Date
```

### String Validators

```typescript
pipe(str, min(1))           // minimum length
pipe(str, max(100))         // maximum length
pipe(str, len(10))          // exact length
pipe(str, nonempty)         // non-empty (min 1)
pipe(str, email)            // email format
pipe(str, url)              // URL format
pipe(str, uuid)             // UUID format
pipe(str, pattern(/regex/)) // custom regex
pipe(str, startsWith('x'))  // starts with
pipe(str, endsWith('x'))    // ends with
pipe(str, includes('x'))    // contains
```

### Number Validators

```typescript
pipe(num, int)           // integer
pipe(num, positive)      // > 0
pipe(num, negative)      // < 0
pipe(num, finite)        // finite
pipe(num, gte(0))        // >= 0
pipe(num, lte(100))      // <= 100
pipe(num, gt(0))         // > 0
pipe(num, lt(100))       // < 100
pipe(num, multipleOf(5)) // divisible by
```

### Transforms

```typescript
pipe(str, trim)      // trim whitespace
pipe(str, lower)     // lowercase
pipe(str, upper)     // uppercase
pipe(str, toInt)     // parse to integer
pipe(str, toFloat)   // parse to float
pipe(str, toDate)    // parse to Date
```

### Composition

```typescript
// pipe() - compose validators left to right
const validateEmail = pipe(str, trim, lower, email)

// optional() - allows undefined
const optionalEmail = optional(pipe(str, email))

// nullable() - allows null
const nullableEmail = nullable(pipe(str, email))

// withDefault() - provide default value
const emailWithDefault = withDefault(pipe(str, email), 'default@example.com')
```

### Objects & Arrays

```typescript
// object() - validate object shape
const validateUser = object({
  name: pipe(str, nonempty),
  age: pipe(num, int, positive),
  email: optional(pipe(str, email)),
})

// array() - validate array items
const validateTags = array(pipe(str, nonempty))
const validateUsers = array(validateUser)
```

### Error Handling

```typescript
import { safeParse, tryParse, ValidationError } from '@sylphx/vex'

// safeParse - returns result object
const result = safeParse(validateUser)(data)
if (result.success) {
  console.log(result.data)
} else {
  console.log(result.error)
}

// tryParse - returns null on error
const data = tryParse(validateUser)(input)

// Direct validation throws ValidationError
try {
  validateUser(invalidData)
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(e.message)
  }
}
```

## Type Inference

```typescript
const validateUser = object({
  id: pipe(str, uuid),
  email: pipe(str, email),
  age: pipe(num, int, positive),
})

// Infer type from validator
type User = ReturnType<typeof validateUser>
// { id: string; email: string; age: number }
```

## Standard Schema

Vex implements [Standard Schema](https://standardschema.dev/) v1, making it compatible with any library that supports the spec:

- **tRPC** - Type-safe APIs
- **TanStack Form/Router** - Form validation
- **Hono** - Web framework validation
- **Remix** - Form handling
- And more...

```typescript
import { object, str, pipe, email } from '@sylphx/vex'

const validateUser = object({
  email: pipe(str, email),
})

// Use with any Standard Schema compatible library
// validateUser['~standard'].validate(data)
```

All validators expose `~standard` property with:
- `version: 1`
- `vendor: 'vex'`
- `validate(value)` - Returns `{ value }` or `{ issues }`

## Performance

Benchmarks (Bun, M ops/sec, higher is better):

| Benchmark | Vex | Valibot | Zod | vs Valibot | vs Zod |
|-----------|-----|---------|-----|------------|--------|
| Simple object | 38.4M | 16.0M | 16.1M | 2.4x | 2.4x |
| Complex object | 9.2M | 3.1M | 3.3M | 3.0x | 2.8x |
| Array (100 items) | 0.1M | 0.03M | 0.04M | 3.6x | 2.9x |
| SafeParse valid | 5.0M | 2.7M | 4.4M | 1.9x | 1.1x |
| SafeParse invalid | 17.7M | 1.1M | 0.2M | 15.8x | 117.8x |
| string.email | 54.6M | 11.9M | 8.3M | 4.6x | 6.6x |
| number.int.positive | 94.1M | 16.4M | 12.3M | 5.7x | 7.7x |
| Schema creation | 11.4M | 7.2M | 0.2M | 1.6x | 56.8x |

**Average: 4.5x faster than Valibot, 24x faster than Zod**

Run benchmarks:
```bash
cd packages/vex && bun run bench/index.ts
```

## License

MIT
