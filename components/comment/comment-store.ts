import Vue from 'vue';
import { namespace, State, Action, Mutation } from 'vuex-class';
import { VuexModule, VuexStore, VuexMutation, VuexGetter, VuexAction } from '../../utils/vuex';
import { Comment } from './comment-model';
import { arrayGroupBy, arrayRemove, numberSort } from '../../utils/array';
import { Analytics } from '../analytics/analytics.service';
import { Growls } from '../growls/growls.service';
import { Translate } from '../translate/translate.service';

export const CommentStoreNamespace = 'comment';
export const CommentState = namespace(CommentStoreNamespace, State);
export const CommentAction = namespace(CommentStoreNamespace, Action);
export const CommentMutation = namespace(CommentStoreNamespace, Mutation);

export type CommentActions = {
	'comment/fetchComments': { resource: string; resourceId: number; page?: number };
};

export type CommentMutations = {
	'comment/addComment': { resource: string; resourceId: number; comments: Comment[] };
	'comment/setCommentCount': { resource: string; resourceId: number; count: number };
	'comment/setParentCommentCount': { resource: string; resourceId: number; count: number };
	'comment/onCommentAdd': Comment;
	'comment/onCommentEdit': Comment;
	'comment/onCommentRemove': Comment;
};

class CommentBag {
	count = 0;
	parentCount = 0;
	comments: Comment[] = [];

	constructor(public resource: string, public resourceId: number) {}

	get parentComments() {
		// We sort reverse since we show newest first when showing parents.
		return this.comments
			.filter(i => !i.parent_id)
			.sort((a, b) => numberSort(b.posted_on, a.posted_on));
	}

	get childComments() {
		const comments = this.comments
			.filter(i => i.parent_id)
			.sort((a, b) => numberSort(a.posted_on, b.posted_on));

		return arrayGroupBy(comments, 'parent_id');
	}

	contains(comment: Comment) {
		return this.comments.findIndex(i => i.id === comment.id) !== -1;
	}
}

function ensureBag(bags: { [k: string]: CommentBag }, resource: string, resourceId: number) {
	const bagId = resource + '/' + resourceId;
	if (!bags[bagId]) {
		Vue.set(bags, bagId, new CommentBag(resource, resourceId));
	}

	return bags[bagId];
}

@VuexModule()
export class CommentStore extends VuexStore<CommentStore, CommentActions, CommentMutations> {
	bags: { [k: string]: CommentBag } = {};

	@VuexGetter
	getCommentBag(resource: string, resourceId: number): CommentBag | undefined {
		const bagId = resource + '/' + resourceId;
		return this.bags[bagId];
	}

	@VuexAction
	async fetchComments(payload: CommentActions['comment/fetchComments']) {
		const { resource, resourceId, page } = payload;

		const response = await Comment.fetch(resource, resourceId, page || 1);

		const count = response.count || 0;
		const parentCount = response.parentCount || 0;
		const comments = Comment.populate(response.comments).concat(
			Comment.populate(response.childComments)
		);

		this.setCommentCount({ resource, resourceId, count });
		this.setParentCommentCount({ resource, resourceId, count: parentCount });
		this.addComments({ resource, resourceId, comments });

		return response;
	}

	@VuexMutation
	private addComments(payload: CommentMutations['comment/addComment']) {
		const { resource, resourceId, comments } = payload;
		for (const comment of comments) {
			const bag = ensureBag(this.bags, resource, resourceId);
			if (!bag.contains(comment)) {
				bag.comments.push(comment);
			}
		}
	}

	@VuexMutation
	private setParentCommentCount(payload: CommentMutations['comment/setParentCommentCount']) {
		const { resource, resourceId, count } = payload;
		const bag = ensureBag(this.bags, resource, resourceId);
		bag.parentCount = count;
	}

	@VuexMutation
	private setCommentCount(payload: CommentMutations['comment/setCommentCount']) {
		const { resource, resourceId, count } = payload;
		const bag = ensureBag(this.bags, resource, resourceId);
		bag.count = count;
	}

	@VuexMutation
	onCommentAdd(comment: CommentMutations['comment/onCommentAdd']) {
		const bag = this.getCommentBag(comment.resource, comment.resource_id);
		if (comment.status === Comment.STATUS_SPAM) {
			Growls.success(
				Translate.$gettext(
					'Your comment has been marked for review. Please allow some time for it to show on the site.'
				),
				Translate.$gettext('Almost there...')
			);

			Analytics.trackEvent('comment-widget', 'spam');
		} else if (bag && !bag.contains(comment)) {
			++bag.count;
			if (!comment.parent_id) {
				++bag.parentCount;
				bag.comments.unshift(comment);
			} else {
				bag.comments.push(comment);
			}
		}
	}

	@VuexMutation
	onCommentEdit(comment: CommentMutations['comment/onCommentEdit']) {
		// Was it marked as possible spam?
		if (comment.status === Comment.STATUS_SPAM) {
			Growls.success(
				Translate.$gettext(
					'Your comment has been marked for review. Please allow some time for it to show on the site.'
				),
				Translate.$gettext('Almost there...')
			);

			Analytics.trackEvent('comment-widget', 'spam');
		}
	}

	@VuexMutation
	onCommentRemove(comment: CommentMutations['comment/onCommentRemove']) {
		const bag = this.getCommentBag(comment.resource, comment.resource_id);
		if (bag) {
			if (comment.parent_id) {
				--bag.parentCount;
			}
			--bag.count;
			arrayRemove(bag.comments, i => i.id === comment.id);
		}
	}
}
