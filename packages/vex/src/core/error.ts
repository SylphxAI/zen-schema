// ============================================================
// Validation Error
// ============================================================

/** Path segment (string for object keys, number for array indices) */
export type PathSegment = string | number

/** Single validation issue with path and message */
export interface ValidationIssue {
	/** Error message */
	message: string
	/** Path to the invalid value (e.g., ['user', 'email'] or [0, 'name']) */
	path?: PathSegment[]
	/** The value that failed validation */
	input?: unknown
	/** Expected type or format */
	expected?: string
	/** Received type or value */
	received?: string
}

/** Validation error thrown when validation fails */
export class ValidationError extends Error {
	/** Array of validation issues */
	readonly issues: ValidationIssue[]

	constructor(message: string, issues?: ValidationIssue[]) {
		super(message)
		this.name = 'ValidationError'
		this.issues = issues ?? [{ message }]
	}

	/** Create a ValidationError from a single issue */
	static fromIssue(issue: ValidationIssue): ValidationError {
		return new ValidationError(issue.message, [issue])
	}

	/** Create a ValidationError from multiple issues */
	static fromIssues(issues: ValidationIssue[]): ValidationError {
		if (issues.length === 0) {
			return new ValidationError('Validation failed')
		}
		const first = issues[0]!
		const message = issues.length === 1 ? first.message : `${issues.length} validation errors`
		return new ValidationError(message, issues)
	}

	/** Format issues into a readable string */
	format(): string {
		return this.issues
			.map((issue) => {
				if (issue.path && issue.path.length > 0) {
					const pathStr = issue.path
						.map((p) => (typeof p === 'number' ? `[${p}]` : p))
						.join('.')
						.replace(/\.\[/g, '[')
					return `${pathStr}: ${issue.message}`
				}
				return issue.message
			})
			.join('\n')
	}

	/** Flatten issues into a record keyed by path */
	flatten(): { root: string[]; nested: Record<string, string[]> } {
		const root: string[] = []
		const nested: Record<string, string[]> = {}

		for (const issue of this.issues) {
			if (!issue.path || issue.path.length === 0) {
				root.push(issue.message)
			} else {
				const pathStr = issue.path
					.map((p) => (typeof p === 'number' ? `[${p}]` : p))
					.join('.')
					.replace(/\.\[/g, '[')
				if (!nested[pathStr]) nested[pathStr] = []
				nested[pathStr].push(issue.message)
			}
		}

		return { root, nested }
	}
}

/** Alias for ValidationError - Valibot compatibility */
export { ValidationError as ValiError }
