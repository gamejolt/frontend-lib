import VueRouter from 'vue-router';

const MAX_ITEMS = 10;

interface HistoryCacheState
{
	tag: string | undefined;
	url: string;
	data?: any;
}

export class HistoryCache
{
	private static states: HistoryCacheState[] = [];

	static get( route: VueRouter.Route, tag?: string )
	{
		return this.states.find( ( item ) => item.url === route.fullPath && item.tag === tag );
	}

	static has( route: VueRouter.Route, tag?: string )
	{
		return !!this.get( route, tag );
	}

	static store( route: VueRouter.Route, data: any, tag?: string )
	{
		const state = this.get( route, tag );

		if ( state ) {
			state.data = data;
		}
		else {
			const url = route.fullPath;

			this.states.push( {
				tag,
				url,
				data,
			} );

			// Prune the cache data to a certain number of states.
			this.states = this.states.slice( -MAX_ITEMS );
		}
	}
}
