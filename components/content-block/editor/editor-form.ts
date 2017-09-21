import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./editor-form.html';

import { BaseForm } from '../../form-vue/form.service';
import { SiteContentBlock } from '../../site/content-block/content-block-model';
import { AppFormControlMarkdown } from '../../form-vue/control/markdown/markdown';

@View
@Component({
	components: {
		AppFormControlMarkdown,
	},
})
export class FormContentBlockEditor extends BaseForm<SiteContentBlock> {
	modelClass = SiteContentBlock;
	warnOnDiscard = false;

	@Prop(String) mode: string;

	@Watch('formModel.content_markdown')
	onContentChanged(content: string) {
		if (this.model) {
			this.model.content_markdown! = content;
		}
	}
}
