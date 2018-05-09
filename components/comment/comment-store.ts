import Vue from 'vue';
import { namespace, State, Action, Mutation } from 'vuex-class';
import { VuexModule, VuexStore, VuexMutation, VuexGetter, VuexAction } from '../../utils/vuex';
import { Comment } from './comment-model';
import { arrayGroupBy, arrayRemove, numberSort } from '../../utils/array';
import { Growls } from '../growls/growls.service';
import { Translate } from '../translate/translate.service';

export const CommentStoreNamespace = 'comment';
export const CommentState = namespace(CommentStoreNamespace, State);
export const CommentAction = namespace(CommentStoreNamespace, Action);
export const CommentMutation = namespace(CommentStoreNamespace, Mutation);

export type CommentActions = {
	'comment/lockCommentStore': { resource: string; resourceId: number };
	'comment/fetchComments': CommentStoreModel;
	'comment/pinComment': { store: CommentStoreModel; comment: Comment };
};

export type CommentMutations = {
	'comment/releaseCommentStore': CommentStoreModel;
	'comment/setCommentCount': { store: CommentStoreModel; count: number };
	'comment/updateComment': { store: CommentStoreModel; commentId: number; data: any };
	'comment/onCommentAdd': Comment;
	'comment/onCommentEdit': Comment;
	'comment/onCommentRemove': Comment;
};

export class CommentStoreModel {
	count = 0;
	parentCount = 0;
	comments: Comment[] = [];
	locks = 0;

	constructor(public resource: string, public resourceId: number) {}

	get parentComments() {
		const comments = this.comments.filter(i => !i.parent_id);
		// remove pinned comments before sorting
		const pinned = arrayRemove(comments, c => c.is_pinned);
		// We sort reverse since we show newest first when showing parents.
		comments.sort((a, b) => numberSort(b.posted_on, a.posted_on));
		// insert pinned comments at the beginning
		if (pinned) {
			comments.unshift(...pinned);
		}

		return comments;
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

	// removes a comment from the store, does not delete the comment itself
	remove(id: number) {
		const removedComments = arrayRemove(this.comments, c => c.id === id);
		if (removedComments) {
			this.count -= removedComments.length;
		}
	}
}

@VuexModule()
export class CommentStore extends VuexStore<CommentStore, CommentActions, CommentMutations> {
	stores: { [k: string]: CommentStoreModel } = {};

	@VuexGetter
	getCommentStore(resource: string, resourceId: number): CommentStoreModel | undefined {
		const storeId = resource + '/' + resourceId;
		return this.stores[storeId];
	}

	@VuexAction
	async lockCommentStore(payload: CommentActions['comment/lockCommentStore']) {
		const { resource, resourceId } = payload;
		const storeId = resource + '/' + resourceId;
		this._ensureCommentStore(payload);
		return this.stores[storeId];
	}

	@VuexAction
	async fetchComments(store: CommentActions['comment/fetchComments']) {
		// load comments after the last timestamp
		const lastComment =
			store.parentComments.length === 0
				? null // no comments loaded
				: store.parentComments[store.parentComments.length - 1];
		// only use the last comment's timestamp if it's not pinned (pinned comment's dates are sorted differently)
		const lastTimestamp =
			lastComment !== null && !lastComment.is_pinned ? lastComment.posted_on : null;
		const response = await Comment.fetch(store.resource, store.resourceId, lastTimestamp);

		const count = response.count || 0;
		const parentCount = response.parentCount || 0;
		const comments = Comment.populate(response.comments).concat(
			Comment.populate(response.childComments)
		);

		this.setCommentCount({ store, count });
		this._setParentCommentCount({ store, count: parentCount });
		this._addComments({ store, comments });

		return response;
	}

	@VuexAction
	async pinComment(payload: CommentActions['comment/pinComment']) {
		const { store, comment } = payload;

		// due to this comment being pinned, another comment is possibly being unpinned
		// apply the change to its data
		const otherCommentData = await comment.$pin();
		if (otherCommentData) {
			this.updateComment({ store, commentId: otherCommentData.id, data: otherCommentData });
		}

		// Either old comment was unpinned by pinning a new comment, or the old comment was just
		// unpinned.
		const unpinnedComment = otherCommentData || (!comment.is_pinned ? comment : null);
		if (unpinnedComment) {
			// If the unpinned comment is sorted to the very end of the comment chain, remove it
			// from the store. This is done because the comment might not belong on that page.
			if (
				store.parentComments.length > 0 &&
				store.parentComments[store.parentComments.length - 1].id === unpinnedComment.id
			) {
				store.remove(unpinnedComment.id);
			}
		}
	}

	@VuexMutation
	private _addComments(payload: { store: CommentStoreModel; comments: Comment[] }) {
		const { store, comments } = payload;
		for (const comment of comments) {
			if (!store.contains(comment)) {
				store.comments.push(comment);
			}
		}
	}

	@VuexMutation
	private _setParentCommentCount(payload: { store: CommentStoreModel; count: number }) {
		const { store, count } = payload;
		store.parentCount = count;
	}

	@VuexMutation
	setCommentCount(payload: CommentMutations['comment/setCommentCount']) {
		const { store, count } = payload;
		store.count = count;
	}

	@VuexMutation
	updateComment(payload: CommentMutations['comment/updateComment']) {
		const { store, commentId, data } = payload;

		const comment = store.comments.find(i => i.id === commentId);
		if (comment) {
			comment.assign(data);
		}
	}

	@VuexMutation
	onCommentAdd(comment: CommentMutations['comment/onCommentAdd']) {
		const store = this.getCommentStore(comment.resource, comment.resource_id);
		if (comment.status === Comment.STATUS_SPAM) {
			Growls.success(
				Translate.$gettext(
					'Your comment has been marked for review. Please allow some time for it to show on the site.'
				),
				Translate.$gettext('Almost there...')
			);
		} else if (store && !store.contains(comment)) {
			++store.count;
			store.comments.push(comment);
			if (!comment.parent_id) {
				++store.parentCount;
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
		}
	}

	@VuexMutation
	onCommentRemove(comment: CommentMutations['comment/onCommentRemove']) {
		const store = this.getCommentStore(comment.resource, comment.resource_id);
		if (store) {
			if (!comment.parent_id) {
				--store.parentCount;
				// reduce comment count by amount of child comments on this parent + 1 for the parent
				const childAmount = store.comments.filter(c => c.parent_id === comment.id).length;
				store.count -= childAmount + 1;
			} else {
				--store.count;
			}
			arrayRemove(store.comments, i => i.id === comment.id);
		}
	}

	@VuexMutation
	private _ensureCommentStore(payload: { resource: string; resourceId: number }) {
		const { resource, resourceId } = payload;
		const storeId = resource + '/' + resourceId;

		if (!this.stores[storeId]) {
			Vue.set(this.stores, storeId, new CommentStoreModel(resource, resourceId));
		}

		++this.stores[storeId].locks;
	}

	@VuexMutation
	releaseCommentStore(store: CommentMutations['comment/releaseCommentStore']) {
		const storeId = store.resource + '/' + store.resourceId;
		--this.stores[storeId].locks;
		if (this.stores[storeId].locks <= 0) {
			Vue.delete(this.stores, storeId);
		}
	}
}
