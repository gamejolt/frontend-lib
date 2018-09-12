import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./image.html?style=./image.styl';
import { FormThemeEditorImage } from './image-form';

@View
@Component({
	components: {
		FormThemeEditorImage,
	},
})
export class AppThemeEditorImage extends Vue {
	@Prop(String) type!: string;
	@Prop(Number) parentId!: number;
	@Prop(Object) value!: any;

	onImageAdded(_model: any, response: any) {
		this.$emit('input', response.mediaItem);
	}

	clear() {
		this.$emit('input', undefined);
	}
}
