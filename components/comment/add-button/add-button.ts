import View from '!view!./add-button.html?style=./add-button.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppAuthRequired } from '../../auth/auth-required-directive.vue';
import { CommentModal, DisplayMode } from '../modal/modal.service';

@View
@Component({
	directives: {
		AppAuthRequired,
	},
})
export class AppCommentAddButton extends Vue {
	@Prop(String)
	resource!: string;
	@Prop(Number)
	resourceId!: number;
	@Prop(String)
	placeholder?: string;
	@Prop(String)
	displayMode!: DisplayMode;

	get placeholderText() {
		return this.placeholder ? this.placeholder : this.$gettext('What do you think?');
	}

	open() {
		CommentModal.show({
			resource: this.resource,
			resourceId: this.resourceId,
			displayMode: this.displayMode,
		});
	}
}
