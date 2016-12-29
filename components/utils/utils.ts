import { FactoryProvider } from '@angular/core';

export function makeFactory( token: any, deps: any, postFactory?: () => void ): FactoryProvider
{
	let depsArray = [];
	for ( const key of Object.keys( deps ) ) {
		depsArray.push( deps[ key ] );
	}

	let provider: FactoryProvider = {
		provide: token,
		useFactory: function ( ...args: any[] )
		{
			const keys = Object.keys( deps );

			let i = 0;
			for ( const depToken of keys ) {
				token[ depToken ] = args[ i ];
				++i;
			}


			if ( postFactory ) {
				postFactory();
			}

			return token;
		},
	};

	if ( depsArray.length ) {
		provider.deps = depsArray;
	}

	return provider;
}
