import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./widget.html';

import { AppStore } from '../../../vue/services/app/app-store';
import { User } from '../../user/user.model';
import { Comment } from '../comment-model';
import { Environment } from '../../environment/environment.service';
import { Analytics } from '../../analytics/analytics.service';
import { Growls } from '../../growls/growls.service';
import { AppLoading } from '../../../vue/components/loading/loading';
import { AppAuthRequired } from '../../auth/auth-required-directive.vue';
import { AppCommentWidgetComment } from './comment/comment';
import { AppMessageThread } from '../../message-thread/message-thread';
import { AppMessageThreadAdd } from '../../message-thread/add/add';
import { AppMessageThreadContent } from '../../message-thread/content/content';
import { FormComment } from '../add/add';
import { GameCollaborator } from '../../game/collaborator/collaborator.model';
import { AppTrackEvent } from '../../analytics/track-event.directive.vue';
import { arrayRemove } from '../../../utils/array';

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
	@Prop(Comment) parentComment?: Comment;
	@Prop(Boolean) onlyAdd?: boolean;
	@Prop(Boolean) autofocus?: boolean;

	@State app: AppStore;

	id = ++incrementer;
	hasBootstrapped = false;
	hasError = false;
	isLoading = false;
	currentPage = 1;
	resourceOwner: User | null = null;
	comments: Comment[] = [];
	childComments: { [k: string]: Comment[] } = {};
	commentsCount = 0;
	parentCount = 0;
	perPage = 10;

	collaborators: GameCollaborator[] = [];

	get loginUrl() {
		return (
			Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(this.$route.fullPath)
		);
	}

	get commentList() {
		if (this.parentComment) {
			return this.childComments[this.parentComment.id];
		}
		return this.comments;
	}

	get shouldShowLoadMore() {
		return !this.isLoading && this.parentCount > this.perPage * this.currentPage;
	}

	async created() {
		await this.init();
	}

	@Watch('resourceId')
	@Watch('resourceName')
	async init() {
		if (!this.resource || !this.resourceId) {
			return;
		}

		this.hasBootstrapped = false;
		this.hasError = false;
		this.currentPage = this.$route.query.comment_page
			? parseInt(this.$route.query.comment_page, 10)
			: 1;

		await this.fetchComments();
	}

	private async fetchComments() {
		try {
			this.isLoading = true;
			const payload = await Comment.fetch(this.resource, this.resourceId, this.currentPage);
			this.isLoading = false;

			this.hasBootstrapped = true;
			this.hasError = false;
			this.resourceOwner = new User(payload.resourceOwner);
			this.perPage = payload.perPage || 10;
			this.parentCount = payload.parentCount || 0;
			this.setCommentsCount(payload.count || 0);

			const comments = Comment.populate(payload.comments);
			comments.forEach(i => this.comments.push(i));

			// Child comments.
			if (payload.childComments) {
				const childComments: Comment[] = Comment.populate(payload.childComments);
				this.storeChildComments(childComments);
			}

			this.collaborators = payload.collaborators
				? GameCollaborator.populate(payload.collaborators)
				: [];
		} catch (e) {
			console.error(e);
			this.hasError = true;
		}
	}

	private storeChildComments(comments: Comment[]) {
		for (const comment of comments) {
			if (!this.childComments[comment.parent_id]) {
				this.$set(this.childComments, comment.parent_id + '', []);
			}
			this.childComments[comment.parent_id].push(comment);
		}
	}

	onCommentAdd(comment: Comment) {
		Analytics.trackEvent('comment-widget', 'add');

		// Was it marked as possible spam?
		if (comment.status === Comment.STATUS_SPAM) {
			Growls.success(
				this.$gettext(
					'Your comment has been marked for review. Please allow some time for it to show on the site.'
				),
				this.$gettext('Almost there...')
			);

			Analytics.trackEvent('comment-widget', 'spam');
		} else {
			if (!comment.parent_id) {
				this.comments.unshift(comment);
				++this.parentCount;
			} else {
				this.storeChildComments([comment]);
			}
			this.setCommentsCount(this.commentsCount + 1);
		}

		this.$emit('add', comment);
	}

	onCommentEdited(comment: Comment) {
		Analytics.trackEvent('comment-widget', 'edit');

		// Was it marked as possible spam?
		if (comment.status === Comment.STATUS_SPAM) {
			Growls.success(
				this.$gettext(
					'Your comment has been marked for review. Please allow some time for it to show on the site.'
				),
				this.$gettext('Almost there...')
			);

			Analytics.trackEvent('comment-widget', 'spam');
		}

		this.$emit('edit', comment);
	}

	onCommentRemoved(comment: Comment) {
		Analytics.trackEvent('comment-widget', 'remove');

		// Might be a child comment.
		const comments = comment.parent_id
			? this.childComments[comment.parent_id] || []
			: this.comments;

		arrayRemove(comments, i => i.id === comment.id);
		--this.parentCount;
		this.setCommentsCount(this.commentsCount - 1);

		this.$emit('remove', comment);
	}

	loadMore() {
		this.currentPage += 1;
		this.fetchComments();
	}

	private setCommentsCount(count: number) {
		this.commentsCount = count;
		this.$emit('count', count);
	}
}
