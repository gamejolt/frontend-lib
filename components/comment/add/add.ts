import { Component, Prop } from 'vue-property-decorator';
import { ContentContext } from '../../content/content-context';
import AppFormControlContent from '../../form-vue/control/content/content.vue';
import { BaseForm, FormOnInit } from '../../form-vue/form.service';
import { Comment } from '../comment-model';
import '../comment.styl';

@Component({
	components: {
		AppFormControlContent,
	},
})
export default class FormComment extends BaseForm<Comment> implements FormOnInit {
	@Prop(String)
	resource!: 'Game' | 'FiresidePost' | 'User';

	@Prop(Number)
	resourceId!: number;

	@Prop(Number)
	parentId?: number;

	@Prop(Boolean)
	autofocus?: boolean;

	@Prop(String)
	placeholder?: string;

	@Prop(String)
	maxHeight?: string;

	modelClass = Comment;
	resetOnSubmit = true;

	get contentContext(): ContentContext {
		switch (this.resource) {
			case 'FiresidePost':
				return 'fireside-post-comment';
			case 'Game':
				return 'game-comment';
			case 'User':
				return 'user-comment';
		}
	}

	onInit() {
		if (!this.model) {
			this.setField('comment_content', '');
			this.setField('resource', this.resource);
			this.setField('resource_id', this.resourceId);

			if (this.parentId) {
				this.setField('parent_id', this.parentId);
			}
		}
	}

	onCancel() {
		this.$emit('cancel');
	}
}
