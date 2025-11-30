// ============================================================
// Validation Error
// ============================================================

/** Validation error thrown when validation fails */
export class ValidationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ValidationError'
	}
}
