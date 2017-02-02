import { LoaderBase } from './loader-base';

export class Loader
{
	private static loaders: { [k: string]: any } = {};

	static addLoader( loader: LoaderBase )
	{
		this.loaders[ loader.name ] = loader;
	}

	static load( name: string )
	{
		if ( !this.loaders[ name ] ) {
			throw new Error( `The loader "${name}" is not registered.` );
		}

		return this.loaders[ name ].load();
	}

	static ready( name: string )
	{
		if ( !this.loaders[ name ] ) {
			console.error( new Error( `The loader "${name}" is not registered.` ) );
			return false;
		}

		return this.loaders[ name ].isReady;
	}
}
