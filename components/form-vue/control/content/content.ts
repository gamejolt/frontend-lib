import { Component, Prop } from 'vue-property-decorator';
import { ContentContainer } from '../../../content/content-container';
import { ContentContext } from '../../../content/content-context';
import AppContentEditorTS from '../../../content/content-editor/content-editor';
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

	controlVal = '';

	$refs!: {
		editor: AppContentEditorTS;
	};

	mounted() {
		this.applyToEditor();
	}

	onFieldChanged() {
		this.applyToEditor();
	}

	applyToEditor() {
		if (this.controlVal) {
			const container = ContentContainer.fromJson(this.controlVal);
			this.$refs.editor.setContent(container);
		}
	}

	onUpdate() {
		const container = this.$refs.editor.getContent();
		if (container instanceof ContentContainer) {
			const jsonValue = container.toJson();
			this.applyValue(jsonValue);
		}
	}
}
