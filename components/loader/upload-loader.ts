import { LoaderBase } from './loader-base';
import { lazyload } from '../../utils/utils';

export class UploadLoader extends LoaderBase {
	name = 'upload';

	protected async _load() {
		await require.ensure(
			[],
			() =>
				lazyload(() => {
					require('ng-file-upload');
				}),
			'upload',
		);
	}
}
