import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./add-button.html?style=./add-button.styl';
import { CommentModal } from '../modal/modal.service';
import { AppAuthRequired } from '../../auth/auth-required-directive.vue';

@View
@Component({
	directives: {
		AppAuthRequired,
	},
})
export class AppCommentAddButton extends Vue {
	@Prop(String) resource!: string;
	@Prop(Number) resourceId!: number;

	open() {
		CommentModal.show({ resource: this.resource, resourceId: this.resourceId });
	}
}
