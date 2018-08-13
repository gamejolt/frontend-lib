import { FiresidePost } from '../fireside/post/post-model';
import { Modal } from '../modal/modal.service';
import { asyncComponentLoader } from '../../utils/utils';
import { Comment } from '../comment/comment-model';

interface LikesModalOptions {
	likeAmount: number;
	post?: FiresidePost;
	comment?: Comment;
}

export class LikesModal {
	static async show(options: LikesModalOptions) {
		const { likeAmount, post, comment } = options;

		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "CommentLikesModal" */ './modal')),
			props: {
				likeAmount,
				post,
				comment,
			},
			size: 'sm',
		});
	}
}
