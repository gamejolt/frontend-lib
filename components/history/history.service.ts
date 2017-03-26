import VueRouter from 'vue-router';
import { getProvider } from '../../utils/utils';

if ( !GJ_IS_SSR ) {

	// This needs to be done before angular loads.
	// Angular attaches to this event as well and if we don't bind first
	// then the statechange stuff will fire before we're able to react
	// to the pop event.
	window.addEventListener( 'popstate', () =>
	{
		History.inHistorical = true;
	} );
}

export class History
{
	static inHistorical = false;
	static futureState?: any;

	static init( router: VueRouter )
	{
		router.afterEach( () =>
		{
			History._reset();
		} );
	}

	static initAngular( $rootScope: any )
	{
		// Store the future state.
		// It's helpful to know where we are transitioning to in resolves in some cases.
		$rootScope.$on( '$stateChangeStart', function()
		{
			if ( arguments[1] ) {
				History.futureState = [ arguments[1], arguments[2] ];
			}
		} );

		// Clear ourselves out on success or error.
		$rootScope.$on( '$stateChangeSuccess', async () =>
		{
			// Do it in next digest.
			await getProvider<any>( '$timeout' );
			History._reset();
		} );

		$rootScope.$on( '$stateChangeError', async () =>
		{
			// Do it in next digest.
			await getProvider<any>( '$timeout' );
			History._reset();
		} );
	}

	private static _reset()
	{
		this.inHistorical = false;
		this.futureState = undefined;
	}
}
