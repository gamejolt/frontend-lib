import { Component, Prop } from 'vue-property-decorator';
import { ContentContext } from '../../../content/content-context';
import AppContentEditor from '../../../content/content-editor/content-editor.vue';
import BaseFormControlTS from '../../../form-vue/control/base';

@Component({
	components: {
		AppContentEditor,
	},
})
export default class AppFormControlContent extends BaseFormControlTS {
	@Prop(String)
	contentContext!: ContentContext;

	@Prop({ type: String, default: '' })
	placeholder!: string;

	@Prop(Boolean)
	disabled!: boolean;

	@Prop(Boolean)
	autofocus!: boolean;

	@Prop({ type: Number, default: null })
	modelId!: number;

	@Prop(Number)
	minHeight!: number;

	controlVal = '';

	onUpdate(source: string) {
		this.applyValue(source);
	}
}
