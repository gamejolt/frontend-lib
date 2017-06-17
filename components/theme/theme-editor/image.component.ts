import { Component, Inject, Input, Self } from 'ng-metadata/core';
import * as template from '!html-loader!./image.component.html';

@Component({
	selector: 'gj-theme-editor-image',
	template,
})
export class ThemeEditorImageComponent {
	@Input('@') type: string;
	@Input('<') parentId: number;

	isLoaded = false;
	mediaItem: any;

	constructor(
		@Inject('ngModel')
		@Self()
		private ngModel: ng.INgModelController
	) {}

	onImageAdded(response: any) {
		this.ngModel.$setViewValue(response.mediaItem);
	}

	clear() {
		this.ngModel.$setViewValue(undefined);
	}
}
