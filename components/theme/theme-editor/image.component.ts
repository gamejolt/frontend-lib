import { Component, Inject, Input, Output, Self } from 'ng-metadata/core';
import { NgModel } from 'ng-metadata/common';
import template from 'html!./image.component.html';

@Component({
	selector: 'gj-theme-editor-image',
	template,
})
export class ThemeEditorImageComponent
{
	@Input( '@' ) type: string;
	@Input( '<' ) parentId: number;

	@Output() change: Function;

	isLoaded = false;
	mediaItem: any;

	constructor(
		@Inject( NgModel ) @Self() private ngModel: NgModel,
	)
	{
	}

	onImageAdded( response: any )
	{
		this.ngModel.$setViewValue( response.mediaItem );
	}

	clear()
	{
		this.ngModel.$setViewValue( undefined );
	}
}
