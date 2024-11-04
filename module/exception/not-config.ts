export class NotConfigError extends Error {
	constructor( message: string, stack?: any ) {
		super( message );
		this.name = 'NotConfigError';
		this.stack = stack;
	}
}