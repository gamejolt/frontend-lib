import VueRouter from 'vue-router';
import { EventBus } from '../event-bus/event-bus.service';

if ( !GJ_IS_SSR ) {

	// This needs to be done before vue loads.
	// Vue attaches to this event as well and if we don't bind first
	// then the statechange stuff will fire before we're able to react
	// to the pop event.
	window.addEventListener( 'popstate', () =>
	{
		History.inHistorical = true;
	} );

	EventBus.on( 'routeChangeAfter', () =>
	{
		History.inHistorical = false;
	} );
}

export class History
{
	static inHistorical = false;
	static futureState?: VueRouter.Route;

	static init( router: VueRouter )
	{
		router.beforeEach( ( to, _from, next ) =>
		{
			this.futureState = to;
			next();
		} );
	}
}
