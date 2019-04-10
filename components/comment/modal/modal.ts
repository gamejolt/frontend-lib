import { Component, Prop } from 'vue-property-decorator';
import { CommentState, CommentStore } from '../../../components/comment/comment-store';
import AppJolticon from '../../../vue/components/jolticon/jolticon.vue';
import { number } from '../../../vue/filters/number';
import { BaseModal } from '../../modal/base';
import AppCommentWidget from '../widget/widget.vue';
import { DisplayMode } from './modal.service';

@Component({
	components: {
		AppJolticon,
		AppCommentWidget,
	},
})
export default class AppCommentModal extends BaseModal {
	@Prop(String)
	resource!: string;

	@Prop(Number)
	resourceId!: number;

	@Prop(String)
	displayMode!: DisplayMode;

	@CommentState
	getCommentStore!: CommentStore['getCommentStore'];

	readonly number = number;

	get commentsCount() {
		const store = this.getCommentStore(this.resource, this.resourceId);
		return store ? store.count : 0;
	}

	onReplyAdd() {
		// Dismiss the modal when a reply is added.
		this.modal.dismiss();
	}

	destroyed() {
		// If there was a permalink in the URL, we want to remove it when closing the comment modal.
		const hash = this.$route.hash;
		if (!hash || hash.indexOf('#comment-') !== 0) {
			return;
		}

		this.$router.replace(Object.assign({}, this.$route, { hash: '' }));
	}
}
