import View from '!view!./content.html?style=./content.styl';
import { ContentContainer } from 'game-jolt-frontend-lib/components/content/content-container';
import { ContentContext } from 'game-jolt-frontend-lib/components/content/content-context';
import { AppContentEditor } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor';
import { BaseFormControl } from 'game-jolt-frontend-lib/components/form-vue/control/base';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppContentEditor,
	},
})
export class AppFormControlContent extends BaseFormControl {
	@Prop(String)
	contentContext!: ContentContext;

	@Prop({ type: String, default: '' })
	placeholder!: string;

	$refs!: {
		editor: AppContentEditor;
	};

	onUpdate() {
		const container = this.$refs.editor.getContentContainer();
		if (container instanceof ContentContainer) {
			const jsonValue = container.toJson();
			console.log('set json value');
			this.applyValue(jsonValue);
		}
	}
}
