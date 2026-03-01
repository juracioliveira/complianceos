export class ComplianceOSError extends Error {
    constructor(
        public readonly code: string,
        public readonly message: string,
        public readonly statusCode: number = 400
    ) {
        super(message)
        this.name = 'ComplianceOSError'
    }
}
