import { Component, Prop } from 'vue-property-decorator';
import { ContentDocument } from '../../../content/content-document';
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
			const doc = ContentDocument.fromJson(this.controlVal);
			this.$refs.editor.setContent(doc);
		}
	}

	onUpdate() {
		const doc = this.$refs.editor.getContent();
		if (doc instanceof ContentDocument) {
			const jsonValue = doc.toJson();
			this.applyValue(jsonValue);
		}
	}
}
