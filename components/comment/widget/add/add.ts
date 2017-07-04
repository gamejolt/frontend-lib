import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./add.html';

import { BaseForm, FormOnInit } from '../../../form-vue/form.service';
import { Comment } from '../../comment-model';
import { AppFormControlMarkdown } from '../../../form-vue/control/markdown/markdown';

@View
@Component({
	components: {
		AppFormControlMarkdown,
	},
})
export class AppCommentWidgetAdd extends BaseForm<Comment>
	implements FormOnInit {
	@Prop(String) resource: string;
	@Prop(Number) resourceId: number;
	@Prop(Number) parentId?: number;

	modelClass = Comment;
	resetOnSubmit = true;

	onInit() {
		this.setField('comment', '');
		this.setField('resource', this.resource);
		this.setField('resource_id', this.resourceId);

		if (this.parentId) {
			this.setField('parent_id', this.parentId);
		}
	}
}
