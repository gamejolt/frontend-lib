import { CommentStoreModel } from './comment-store';
// Acts as a view on the comment store model.
// It can either pull a certain amount of comments from the start or a specific thread (parent + children)
export class CommentStoreView {
	private pageSize?: number;
	private parentCommentId?: number;

	public static getSliceView(pageSize: number) {
		const view = new CommentStoreView();
		view.pageSize = pageSize;
		return view;
	}

	public static getThreadView(parentCommentId: number) {
		const view = new CommentStoreView();
		view.parentCommentId = parentCommentId;
		return view;
	}

	public getComments(storeModel: CommentStoreModel) {}
}
