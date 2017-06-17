import { LoaderBase } from './loader-base';
import { lazyload } from '../../utils/utils';

export class HammerLoader extends LoaderBase {
	name = 'hammer';

	protected async _load() {
		await require.ensure(
			[],
			() =>
				lazyload(() => {
					// This will require hammerjs as well.
					require('angular-hammer');
				}),
			'hammer',
		);
	}
}
