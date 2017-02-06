export type RequireContextMap = { [k: string]: string };

const KebabCaseRegex = /[A-Z]/g;

export function kebabCase( name: string )
{
	return name.replace( KebabCaseRegex, ( letter, pos ) =>
		(pos ? '-' : '') + letter.toLowerCase() );
}

export function importContext( r: WebpackContext )
{
	let map: RequireContextMap = {};
	r.keys().forEach( ( key ) => map[ key ] = r( key ) );
	return map;
}

export function getProvider<T>( token: any ): T
{
	const injector = angular.element( window.document ).injector();
	if ( !injector ) {
		throw new Error( 'Injector is not yet bootstrapped into the app.' );
	}

	return injector.get( token );
}

export function hasProvider( token: any ): boolean
{
	const injector = angular.element( window.document ).injector();
	if ( !injector ) {
		throw new Error( 'Injector is not yet bootstrapped into the app.' );
	}

	return injector.has( token );
}

/**
 * Can be used to wrap a require.ensure callback in $ocLazyLoad.
 */
export function lazyload( func: Function ): Promise<void>
{
	return new Promise<void>( async ( resolve ) =>
	{
		const $ocLazyLoad = getProvider<any>( '$ocLazyLoad' );
		$ocLazyLoad.toggleWatch( true );
		await Promise.resolve( func() );
		$ocLazyLoad.toggleWatch( false );
		await $ocLazyLoad.inject();
		resolve();
	} );
}

// await require.ensure( [], () => lazyload( () =>
// {
// 	require( 'angular-hammer' );
// } ), 'hammer' );

export function loadScript( src: string )
{
	return new Promise( ( resolve, reject ) =>
	{
		const script = window.document.createElement( 'script' );
		script.type = 'text/javascript';
		script.async = true;

		const docHead = window.document.head || window.document.getElementsByTagName( 'head' )[0];
		docHead.appendChild( script );

		script.onload = resolve;
		script.onerror = reject;
		script.src = src;
	} );
}
