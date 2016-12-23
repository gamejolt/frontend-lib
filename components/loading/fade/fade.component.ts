import { Component, Input } from 'ng-metadata/core';
import template from 'html!./fade.component.html';

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
