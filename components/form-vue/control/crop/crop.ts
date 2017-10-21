import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./crop.html';

import { BaseFormControl } from '../base';
import { AppImgCrop } from '../../../img/crop/crop';

@View
@Component({
	components: {
		AppImgCrop,
	},
})
export class AppFormControlCrop extends BaseFormControl {
	@Prop(String) src: string;
	@Prop(Number) aspectRatio?: number;
	@Prop(Number) minWidth?: number;
	@Prop(Number) minHeight?: number;
	@Prop(Boolean) disabled?: boolean;

	value: any = undefined;

	onChange(value: any) {
		this.applyValue(value);
	}
}
