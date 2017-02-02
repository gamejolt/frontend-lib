import { Component, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./fade.component.html';

@Component({
	selector: 'gj-loading-fade',
	template,
	legacy: {
		transclude: true,
	}
})
export class LoadingFadeComponent
{
	@Input( '<' ) isLoading: boolean;

	constructor(

	)
	{
	}
}
