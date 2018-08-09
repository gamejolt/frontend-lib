import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./widget.html';

import { AppStore, AppState } from '../../../vue/services/app/app-store';
import { User } from '../../user/user.model';
import { Comment } from '../comment-model';
import { Environment } from '../../environment/environment.service';
import { Analytics } from '../../analytics/analytics.service';
import { AppLoading } from '../../../vue/components/loading/loading';
import { AppAuthRequired } from '../../auth/auth-required-directive.vue';
import { AppCommentWidgetComment } from './comment/comment';
import { AppMessageThread } from '../../message-thread/message-thread';
import { AppMessageThreadAdd } from '../../message-thread/add/add';
import { AppMessageThreadContent } from '../../message-thread/content/content';
import { FormComment } from '../add/add';
import { GameCollaborator } from '../../game/collaborator/collaborator.model';
import { AppTrackEvent } from '../../analytics/track-event.directive.vue';
import {
	CommentState,
	CommentStore,
	CommentMutation,
	CommentAction,
	CommentStoreModel,
} from '../comment-store';

let incrementer = 0;

@View
@Component({
	components: {
		AppLoading,
		AppMessageThread,
		AppMessageThreadAdd,
		AppMessageThreadContent,
		AppCommentWidgetComment,
		FormComment,
	},
	directives: {
		AppAuthRequired,
		AppTrackEvent,
	},
})
export class AppCommentWidget extends Vue {
	@Prop(String) resource: string;
	@Prop(Number) resourceId: number;
	@Prop(Boolean) onlyAdd?: boolean;
	@Prop(Boolean) autofocus?: boolean;

	@AppState user: AppStore['user'];

	@CommentState getCommentStore: CommentStore['getCommentStore'];
	@CommentAction fetchComments: CommentStore['fetchComments'];
	@CommentAction lockCommentStore: CommentStore['lockCommentStore'];
	@CommentAction pinComment: CommentStore['pinComment'];
	@CommentAction setSort: CommentStore['setSort'];
	@CommentMutation releaseCommentStore: CommentStore['releaseCommentStore'];
	@CommentMutation onCommentAdd: CommentStore['onCommentAdd'];
	@CommentMutation onCommentEdit: CommentStore['onCommentEdit'];
	@CommentMutation onCommentRemove: CommentStore['onCommentRemove'];

	store: CommentStoreModel | null = null;
	id = ++incrementer;
	hasBootstrapped = false;
	hasError = false;
	isLoading = false;
	resourceOwner: User | null = null;
	perPage = 10;
	currentPage = 1;

	collaborators: GameCollaborator[] = [];

	get loginUrl() {
		return (
			Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(this.$route.fullPath)
		);
	}

	get shouldShowLoadMore() {
		return !this.isLoading && this.totalParentCount > this.currentParentCount;
	}

	get comments() {
		return this.store ? this.store.parentComments : [];
	}

	get childComments() {
		return this.store ? this.store.childComments : [];
	}

	get commentsCount() {
		return this.store ? this.store.count : 0;
	}

	get totalParentCount() {
		return this.store ? this.store.parentCount : 0;
	}

	get currentParentCount() {
		return this.store ? this.store.parentComments.length : 0;
	}

	get currentSort() {
		return this.store ? this.store.sort : Comment.SORT_HOT;
	}

	get isSortHot() {
		return this.currentSort === Comment.SORT_HOT;
	}

	get isSortTop() {
		return this.currentSort === Comment.SORT_TOP;
	}

	get isSortNew() {
		return this.currentSort === Comment.SORT_NEW;
	}

	get isSortYou() {
		return this.currentSort === Comment.SORT_YOU;
	}

	async created() {
		await this.init();
	}

	destroyed() {
		if (this.store) {
			this.releaseCommentStore(this.store);
			this.store = null;
		}
	}

	@Watch('resourceId')
	@Watch('resourceName')
	async init() {
		if (!this.resource || !this.resourceId) {
			return;
		}

		this.hasBootstrapped = false;
		this.hasError = false;

		if (this.store) {
			this.releaseCommentStore(this.store);
			this.store = null;
		}

		await this._fetchComments();
	}

	private async _fetchComments() {
		try {
			this.isLoading = true;

			const resource = this.resource;
			const resourceId = this.resourceId;

			if (!this.store) {
				this.store = await this.lockCommentStore({ resource, resourceId });
			}

			const payload = await this.fetchComments({ store: this.store, page: this.currentPage });

			this.isLoading = false;
			this.hasBootstrapped = true;
			this.hasError = false;
			this.resourceOwner = new User(payload.resourceOwner);
			this.perPage = payload.perPage || 10;

			this.collaborators = payload.collaborators
				? GameCollaborator.populate(payload.collaborators)
				: [];
		} catch (e) {
			console.error(e);
			this.hasError = true;
		}
	}

	_onCommentAdd(comment: Comment) {
		Analytics.trackEvent('comment-widget', 'add');
		this.onCommentAdd(comment);
		this.$emit('add', comment);
	}

	_onCommentEdit(comment: Comment) {
		Analytics.trackEvent('comment-widget', 'edit');
		this.onCommentEdit(comment);
		this.$emit('edit', comment);
	}

	_onCommentRemove(comment: Comment) {
		Analytics.trackEvent('comment-widget', 'remove');
		this.onCommentRemove(comment);
		this.$emit('remove', comment);
	}

	async _pinComment(comment: Comment) {
		if (this.store) {
			this.currentPage = 1;
			await this.pinComment({ store: this.store, comment });
			this._fetchComments();
		}
	}

	_onSortHot() {
		this._setSort(Comment.SORT_HOT);
	}

	_onSortTop() {
		this._setSort(Comment.SORT_TOP);
	}

	_onSortNew() {
		this._setSort(Comment.SORT_NEW);
	}

	_onSortYou() {
		this._setSort(Comment.SORT_YOU);
	}

	private _setSort(sort: string) {
		if (this.store) {
			this.currentPage = 1;
			this.setSort({ store: this.store, sort: sort });
			this._fetchComments();
		}
	}

	loadMore() {
		this.currentPage++;
		this._fetchComments();
	}
}
