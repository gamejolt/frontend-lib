import { LoaderBase } from './loader-base';
import { lazyload } from '../../utils/utils';

export class HammerLoader extends LoaderBase
{
	name = 'hammer';

	protected async _load()
	{
		await require.ensure( [], () => lazyload( () =>
		{
			// This will require hammerjs as well.
			require( 'angular-hammer' );

			// And the vue hammer lib.
			const Vue = require( 'vue' );
			const VueTouch = require( 'vue-touch' );
			Vue.use( VueTouch );
		} ), 'hammer' );
	}
}
