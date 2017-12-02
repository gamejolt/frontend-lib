import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./markdown.html?style=./markdown.styl';

import { BaseFormControl } from '../base';
import { Screen } from '../../../screen/screen-service';
import { makeObservableService } from '../../../../utils/vue';
import { Environment } from '../../../environment/environment.service';
import { Api } from '../../../api/api.service';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../tooltip/tooltip';
import { AppLoading } from '../../../../vue/components/loading/loading';
import { AppFormAutosize } from '../../autosize.directive';
import { AppCodemirror } from '../../../codemirror/codemirror';
import { AppFormControlMarkdownMediaItems } from './media-items/media-items';

@View
@Component({
	components: {
		AppJolticon,
		AppLoading,
		AppCodemirror,
		AppFormControlMarkdownMediaItems,
	},
	directives: {
		AppTooltip,
		AppFormAutosize,
	},
})
export class AppFormControlMarkdown extends BaseFormControl {
	@Prop(String) editorClass?: string;
	@Prop(String) previewClass?: string;
	@Prop(String) previewUrl: string;
	@Prop(Boolean) disablePreview?: boolean;
	@Prop(String) placeholder?: string;
	@Prop({ type: String, default: 'markdown' })
	markdownMode?: string;
	@Prop(Boolean) htmlSupport?: boolean;
	@Prop(Boolean) showMediaItems?: boolean;
	@Prop(String) mediaItemType?: string;
	@Prop(Boolean) allowCodeEditor?: boolean;
	@Prop(Boolean) disabled?: boolean;

	controlVal = '';
	currentTab = 'edit';
	editorMode = 'textarea';
	shouldShowMarkdownHelp = true;
	shouldShowWidgetHelp = false;
	markdownHelpUrl = 'markdown';
	mediaItemParentId = 0;
	previewContent = '';
	isLoadingPreview = false;

	Screen = makeObservableService(Screen);
	Environment = Environment;

	get hasContent() {
		return !!this.controlVal;
	}

	created() {
		if (this.markdownMode === 'comments') {
			this.markdownHelpUrl = 'markdown-comments';
		}

		if (this.markdownMode === 'fireside') {
			this.shouldShowWidgetHelp = true;
		}

		if (this.markdownMode === 'devlog') {
			this.shouldShowWidgetHelp = true;
		}

		if (this.markdownMode === 'jams') {
			this.shouldShowWidgetHelp = true;
		}

		if (this.markdownMode === 'forums') {
			this.shouldShowWidgetHelp = true;
		}

		if (this.markdownMode === 'game-site') {
			this.shouldShowWidgetHelp = true;
		}

		if (this.markdownMode === 'user-site') {
			this.shouldShowWidgetHelp = true;
		}

		if (this.showMediaItems && !!this.form.base.formModel.id) {
			this.mediaItemParentId = this.form.base.formModel.id;
		}
	}

	changeTab(tab: string) {
		this.currentTab = tab;
		this.onTabChanged();
	}

	/**
	 * When the tab is changed between Write and Preview.
	 */
	async onTabChanged() {
		if (this.currentTab === 'preview') {
			this.isLoadingPreview = true;

			// Get the control's model from the form.
			// var content = scope.$parent[ gjForm.formModel ][ formGroup.name ];
			if (this.controlVal) {
				this.previewContent = '';

				const response = await Api.sendRequest(
					this.previewUrl,
					{ content: this.controlVal },
					{ ignorePayloadUser: true }
				);

				if (response && response.success !== false && response.compiled) {
					this.previewContent = response.compiled;
				}
			} else {
				this.previewContent = '';
			}

			this.isLoadingPreview = false;
		}
	}

	onChange(value: string) {
		// Make sure we're in edit mode if content changed.
		this.previewContent = '';
		this.currentTab = 'edit';

		this.applyValue(value);
	}
}
