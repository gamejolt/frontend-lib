import { LoaderBase } from './loader-base';
import { Loader } from './loader.service';

export class SpectrumLoader extends LoaderBase
{
	name = 'spectrum';

	protected async _load()
	{
		await Loader.load( 'jquery' );

		await require.ensure( [], () =>
		{
			require( 'spectrum-colorpicker' );
		}, 'spectrum' );
	}
}
