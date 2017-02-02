import { LoaderBase } from './loader-base';
import { lazyload } from '../../utils/utils';

export class ChartLoader extends LoaderBase
{
	name = 'chart';

	protected async _load()
	{
		await require.ensure( [], () => lazyload( () =>
		{
			(window as any).Chart = require( 'chart.js' );
			require( 'tc-angular-chartjs' );
		} ), 'chart' );
	}
}
