import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./modal.html';

import { BaseModal } from '../modal/base';
import { FiresidePost } from '../fireside/post/post-model';
import { Comment } from '../comment/comment-model';
import { Api } from '../api/api.service';
import { User } from '../user/user.model';
import { AppLoading } from '../../vue/components/loading/loading';
import { AppUserList } from '../../../../app/components/user/list/list';

@View
@Component({
	components: {
		AppLoading,
		AppUserList,
	},
})
export default class AppLikesModal extends BaseModal {
	@Prop(Number) likeAmount: number;
	@Prop(FiresidePost) post?: FiresidePost;
	@Prop(Comment) comment?: Comment;

	static readonly USERS_PER_PAGE = 20;

	reachedEnd = false;
	currentPage = 0;
	loading = true;
	users: User[] = [];

	get title() {
		if (this.likeAmount === 1) {
			return this.$gettextInterpolate('Liked %{ amount } time', { amount: this.likeAmount });
		} else {
			return this.$gettextInterpolate('Liked %{ amount } times', { amount: this.likeAmount });
		}
	}

	get shouldShowLoadMore() {
		return !this.loading && !this.reachedEnd;
	}

	async created() {
		this._loadPage();
	}

	async loadMore() {
		this.currentPage++;
		this._loadPage();
	}

	private async _loadPage() {
		this.loading = true;
		let requestUrl = !!this.comment
			? '/comments/like_users/' + this.comment.id
			: '/fireside/posts/like_users/' + this.post!.id;
		requestUrl += '?page=' + this.currentPage;

		const payload = await Api.sendRequest(requestUrl);
		if (payload.success) {
			const newUsers = User.populate(payload.users);
			this.users = this.users.concat(newUsers);

			if (newUsers.length < AppLikesModal.USERS_PER_PAGE) {
				this.reachedEnd = true;
			}
		}
		this.loading = false;
	}
}
