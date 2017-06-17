import { LoaderBase } from './loader-base';

export class JqueryLoader extends LoaderBase {
	name = 'jquery';

	protected async _load() {
		await require.ensure(
			[],
			() => {
				(window as any).jQuery = require('jquery');
			},
			'jquery',
		);
	}
}
