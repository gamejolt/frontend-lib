import { LoaderBase } from './loader-base';
import { Loader } from './loader.service';

export class JcropLoader extends LoaderBase {
	name = 'jcrop';

	protected async _load() {
		await Loader.load('jquery');

		await require.ensure(
			[],
			() => {
				require('jquery-jcrop');
			},
			'jcrop',
		);
	}
}
