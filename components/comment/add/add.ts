import { Component, Prop } from 'vue-property-decorator';
import AppFormControlMarkdown from '../../form-vue/control/markdown/markdown.vue'
import { BaseForm, FormOnInit } from '../../form-vue/form.service';
import { Comment } from '../comment-model';
import '../comment.styl';

@Component({
	components: {
		AppFormControlMarkdown,
	},
})
export default class FormComment extends BaseForm<Comment> implements FormOnInit {
	@Prop(String)
	resource!: 'Game' | 'FiresidePost';

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

	onInit() {
		if (!this.model) {
			this.setField('comment', '');
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
