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
import { AppLoadingFade } from '../../loading/fade/fade';
import { AppMessageThread } from '../../message-thread/message-thread';
import { FormComment } from '../add/add';
import { AppMessageThreadAdd } from '../../message-thread/add/add';
import { AppMessageThreadPagination } from '../../message-thread/pagination/pagination';
import { AppMessageThreadContent } from '../../message-thread/content/content';
import { GameCollaborator } from '../../game/collaborator/collaborator.model';
import { AppTrackEvent } from '../../analytics/track-event.directive.vue';

let incrementer = 0;

@View
@Component({
	components: {
		AppLoading,
		AppLoadingFade,
		AppMessageThread,
		AppMessageThreadAdd,
		AppMessageThreadPagination,
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
		this.checkPermalink();
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
			this.commentsCount = payload.count || 0;
			this.parentCount = payload.parentCount || 0;

			const comments = Comment.populate(payload.comments);
			comments.forEach(i => this.comments.push(i));
			// this.comments.concat();

			// Child comments.
			if (payload.childComments) {
				const childComments: Comment[] = Comment.populate(payload.childComments);
				for (const child of childComments) {
					if (!this.childComments[child.parent_id]) {
						this.$set(this.childComments, child.parent_id + '', []);
					}
					this.childComments[child.parent_id].push(child);
				}
			}

			this.collaborators = payload.collaborators
				? GameCollaborator.populate(payload.collaborators)
				: [];

			this.$emit('count', this.commentsCount);
		} catch (e) {
			console.error(e);
			this.hasError = true;
		}
	}

	onCommentAdd(formModel: Comment, isReplying: boolean) {
		Analytics.trackEvent('comment-widget', 'add');

		// Was it marked as possible spam?
		if (formModel.status === Comment.STATUS_SPAM) {
			Growls.success(
				this.$gettext(
					'Your comment has been marked for review. Please allow some time for it to show on the site.'
				),
				this.$gettext('Almost there...')
			);

			Analytics.trackEvent('comment-widget', 'spam');
		} else {
			// Otherwise refresh.
			// Force us back to the first page, but only if we weren't replying.
			// If they replied to a comment, obviously don't want to change back to the first page.
			this.changePage(isReplying ? this.currentPage : 1);
		}

		this.$emit('add', formModel);
	}

	onCommentEdited(formModel: Comment) {
		Analytics.trackEvent('comment-widget', 'edit');

		// Was it marked as possible spam?
		if (formModel.status === Comment.STATUS_SPAM) {
			Growls.success(
				this.$gettext(
					'Your comment has been marked for review. Please allow some time for it to show on the site.'
				),
				this.$gettext('Almost there...')
			);

			Analytics.trackEvent('comment-widget', 'spam');
		} else {
			// Otherwise refresh.
			// Force us back to the first page, but only if we weren't replying.
			// If they replied to a comment, obviously don't want to change back to the first page.
			this.changePage(this.currentPage);
		}

		this.$emit('edit', formModel);
	}

	onCommentRemoved(formModel: Comment) {
		Analytics.trackEvent('comment-widget', 'remove');

		// Otherwise refresh.
		// Force us back to the first page, but only if we weren't replying.
		// If they replied to a comment, obviously don't want to change back to the first page.
		this.changePage(this.currentPage);
		this.$emit('remove', formModel);
	}

	loadMore() {
		this.currentPage += 1;
		this.fetchComments();
	}

	// onPageChange(page: number) {
	// 	this.changePage(page);
	// 	Scroll.to(`comment-pagination-${this.id}`, { animate: false });
	// }

	// changePage(page: number) {
	// 	// Update the page and refresh the comments list.
	// 	this.currentPage = page || 1;
	// 	this.fetchComments();

	// 	Analytics.trackEvent('comment-widget', 'change-page', this.currentPage + '');
	// }

	private async checkPermalink() {
		const hash = this.$route.hash;
		if (!hash || hash.indexOf('#comment-') !== 0) {
			return;
		}

		const id = parseInt(hash.substring('#comment-'.length), 10);
		if (!id) {
			return;
		}

		try {
			const page = await Comment.getCommentPage(id);
			this.changePage(page);
			Analytics.trackEvent('comment-widget', 'permalink');
		} catch (e) {
			Growls.error(this.$gettext(`Invalid comment passed in. It may have been removed.`));
		}
	}
}
