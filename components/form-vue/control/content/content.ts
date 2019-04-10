import { ContentContainer } from 'game-jolt-frontend-lib/components/content/content-container';
import { ContentContext } from 'game-jolt-frontend-lib/components/content/content-context';
import AppContentEditorTS from 'game-jolt-frontend-lib/components/content/content-editor/content-editor';
import AppContentEditor from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.vue';
import BaseFormControlTS from 'game-jolt-frontend-lib/components/form-vue/control/base';
import { Component, Prop } from 'vue-property-decorator';

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
