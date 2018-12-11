import View from '!view!./modal.html?style=./modal.styl';
import {
	CommentState,
	CommentStore,
} from 'game-jolt-frontend-lib/components/comment/comment-store';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component, Prop } from 'vue-property-decorator';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { BaseModal } from '../../modal/base';
import { AppCommentWidget } from '../widget/widget';
import { AppCommentModalComment } from './comment/comment';
import { DisplayMode } from './modal.service';

@View
@Component({
	components: {
		AppJolticon,
		AppCommentWidget,
		AppCommentModalComment,
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
