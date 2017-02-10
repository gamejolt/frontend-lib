import { LoaderBase } from './loader-base';

export class HammerVueLoader extends LoaderBase
{
	name = 'hammer-vue';

	protected async _load()
	{
		await require.ensure( [], () =>
		{
			// Will require hammerjs as well.
			const Vue = require( 'vue' );
			const VueTouch = require( 'vue-touch' );
			Vue.use( VueTouch );

		}, 'hammer-vue' );
	}
}
