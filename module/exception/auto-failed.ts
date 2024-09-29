export class AutoFailedException extends Error {
	constructor( message: string, stack?: any ) {
		super( message );
		this.name = 'AutoFailedException';
		this.stack = stack;
	}
}