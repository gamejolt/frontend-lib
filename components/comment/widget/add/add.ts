import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./add.html';

import { BaseForm, FormOnInit } from '../../../form-vue/form.service';
import { Comment } from '../../comment-model';
import { AppFormControlMarkdown } from '../../../form-vue/control/markdown/markdown';

@View
@Component({
	components: {
		AppFormControlMarkdown,
	}
})
export class AppCommentWidgetAdd extends BaseForm<Comment> implements FormOnInit
{
	@Prop( String ) resource: string;
	@Prop( Number ) resourceId: number;
	@Prop( Number ) parentId?: number;

	modelClass = Comment;
	resetOnSubmit = true;

	onInit()
	{
		this.formModel.comment = '';
		this.formModel.resource = this.resource;
		this.formModel.resource_id = this.resourceId;

		if ( this.parentId ) {
			this.formModel.parent_id = this.parentId;
		}
	}
}
