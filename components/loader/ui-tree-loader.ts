import { LoaderBase } from './loader-base';
import { lazyload } from '../../utils/utils';

export class UiTreeLoader extends LoaderBase {
	name = 'ui-tree';

	protected async _load() {
		await require.ensure(
			[],
			() =>
				lazyload(() => {
					require('angular-ui-tree');
				}),
			'ui-tree'
		);
	}
}
