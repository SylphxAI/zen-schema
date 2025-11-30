// ============================================================
// Standard Schema V1 Types
// https://standardschema.dev/
// ============================================================

/** The Standard Schema interface */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
	readonly '~standard': StandardSchemaV1.Props<Input, Output>
}

export declare namespace StandardSchemaV1 {
	/** The Standard Schema properties interface */
	export interface Props<Input = unknown, Output = Input> {
		readonly version: 1
		readonly vendor: string
		readonly validate: (value: unknown) => Result<Output> | Promise<Result<Output>>
		readonly types?: Types<Input, Output> | undefined
	}

	/** The result interface of the validate function */
	export type Result<Output> = SuccessResult<Output> | FailureResult

	/** The result interface if validation succeeds */
	export interface SuccessResult<Output> {
		readonly value: Output
		readonly issues?: undefined
	}

	/** The result interface if validation fails */
	export interface FailureResult {
		readonly issues: ReadonlyArray<Issue>
	}

	/** The issue interface of the failure output */
	export interface Issue {
		readonly message: string
		readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined
	}

	/** The path segment interface of the issue */
	export interface PathSegment {
		readonly key: PropertyKey
	}

	/** The Standard Schema types interface */
	export interface Types<Input = unknown, Output = Input> {
		readonly input: Input
		readonly output: Output
	}

	/** Infers the input type of a Standard Schema */
	export type InferInput<Schema extends StandardSchemaV1> = NonNullable<
		Schema['~standard']['types']
	>['input']

	/** Infers the output type of a Standard Schema */
	export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<
		Schema['~standard']['types']
	>['output']
}
