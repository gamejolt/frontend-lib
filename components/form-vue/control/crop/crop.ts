import View from '!view!./crop.html';
import { Component, Prop } from 'vue-property-decorator';
import { AppImgCrop } from '../../../img/crop/crop';
import { BaseFormControl } from '../base';

@View
@Component({
	components: {
		AppImgCrop,
	},
})
export class AppFormControlCrop extends BaseFormControl {
	@Prop(String)
	src!: string;

	@Prop(Number)
	aspectRatio?: number;

	@Prop(Number)
	minAspectRatio?: number;

	@Prop(Number)
	maxAspectRatio?: number;

	@Prop(Number)
	minWidth?: number;

	@Prop(Number)
	minHeight?: number;

	@Prop(Number)
	maxWidth?: number;

	@Prop(Number)
	maxHeight?: number;

	@Prop(Boolean)
	disabled?: boolean;

	controlVal: any = null;

	onChange(value: any) {
		this.applyValue(value);
	}
}
