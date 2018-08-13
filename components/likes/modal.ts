import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./modal.html';

import { BaseModal } from '../modal/base';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';
import { FiresidePost } from '../fireside/post/post-model';
import { Comment } from '../comment/comment-model';
import { AppCommentContent } from '../comment/content/content';
import { AppMessageThreadItem } from '../message-thread/item/item';
import { Api } from '../api/api.service';
import { User } from '../user/user.model';
import { AppLoading } from '../../vue/components/loading/loading';

@View
@Component({
	components: {
		AppJolticon,
		AppCommentContent,
		AppMessageThreadItem,
		AppLoading,
	},
})
export default class AppLikesModal extends BaseModal {
	@Prop(Number) likeAmount: number;
	@Prop(FiresidePost) post?: FiresidePost;
	@Prop(Comment) comment?: Comment;

	loading = true;
	users: User[] = [];

	get title() {
		if (this.likeAmount === 1) {
			return this.$gettextInterpolate('Liked %{ amount } time', { amount: this.likeAmount });
		} else {
			return this.$gettextInterpolate('Liked %{ amount } times', { amount: this.likeAmount });
		}
	}

	async created() {
		const requestUrl = !!this.comment
			? '/comments/like_users/' + this.comment.id
			: '/fireside/posts/like_users/' + this.post!.id;
		const payload = await Api.sendRequest(requestUrl);
		if (payload.success) {
			this.users = User.populate(payload.users);
			this.loading = false;
		}
	}
}
