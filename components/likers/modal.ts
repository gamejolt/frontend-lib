import View from '!view!./modal.html';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component, Prop } from 'vue-property-decorator';
import { AppUserList } from '../../../../app/components/user/list/list';
import { AppLoading } from '../../vue/components/loading/loading';
import { Api } from '../api/api.service';
import { Comment } from '../comment/comment-model';
import { FiresidePost } from '../fireside/post/post-model';
import { Game } from '../game/game.model';
import { BaseModal } from '../modal/base';
import { User } from '../user/user.model';
import { LikersResource } from './modal.service';

const UsersPerPage = 20;

@View
@Component({
	components: {
		AppLoading,
		AppUserList,
	},
})
export default class AppLikesModal extends BaseModal {
	@Prop(Number)
	count!: number;

	@Prop(Object)
	resource?: LikersResource;

	readonly number = number;

	reachedEnd = false;
	isLoading = false;
	currentPage = 0;
	users: User[] = [];

	get requestUrl() {
		if (this.resource) {
			if (this.resource instanceof Comment) {
				return '/comments/likers/' + this.resource.id;
			} else if (this.resource instanceof FiresidePost) {
				return '/web/posts/likers/' + this.resource.id;
			} else if (this.resource instanceof Game) {
				return '/web/discover/games/likers/' + this.resource.id;
			}
		}
	}

	get shouldShowLoadMore() {
		return !this.isLoading && !this.reachedEnd;
	}

	async created() {
		this.loadMore();
	}

	async loadMore() {
		if (this.isLoading) {
			return;
		}

		this.isLoading = true;
		++this.currentPage;
		const payload = await Api.sendRequest(this.requestUrl + '?page=' + this.currentPage);

		const users = User.populate(payload.users);
		this.users = this.users.concat(users);

		if (users.length < UsersPerPage || this.users.length === this.count) {
			this.reachedEnd = true;
		}

		this.isLoading = false;
	}
}
