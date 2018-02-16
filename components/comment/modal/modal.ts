import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./modal.html?style=./modal.styl';

import { BaseModal } from '../../modal/base';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { Comment } from '../comment-model';
import { AppCommentWidget } from '../widget/widget';
import { AppCommentModalComment } from './comment/comment';

@View
@Component({
	components: {
		AppJolticon,
		AppCommentWidget,
		AppCommentModalComment,
	},
})
export default class AppCommentModal extends BaseModal {
	@Prop(String) resource: string;
	@Prop(Number) resourceId: number;
	@Prop(Comment) comment?: Comment;

	onReplyAdd(comment: Comment) {
		this.modal.resolve(comment);
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
