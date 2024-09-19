export class NotFoundError extends Error {
	constructor( message: string, stack?: any ) {
		super( message );
		this.name = 'NotFoundError';
		this.stack = stack;
	}
}