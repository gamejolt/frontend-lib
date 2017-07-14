import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./image.html?style=./image.styl';
import { FormThemeEditorImage } from './image-form';

@View
@Component({
	components: {
		FormThemeEditorImage,
	},
})
export class AppThemeEditorImage extends Vue {
	@Prop(String) type: string;
	@Prop(Number) parentId: number;

	onImageAdded(_model: any, response: any) {
		// this.ngModel.$setViewValue(response.mediaItem);
	}

	clear() {
		// this.ngModel.$setViewValue(undefined);
	}
}
