export class RiskError extends Error {
	constructor( message: string, stack?: any ) {
		super( message );
		this.name = 'RiskError';
		this.stack = stack;
	}
}
