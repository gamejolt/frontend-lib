import { asyncComponentLoader } from '../../utils/utils';
import { Comment } from '../comment/comment-model';
import { FiresidePost } from '../fireside/post/post-model';
import { Modal } from '../modal/modal.service';

interface LikersModalOptions {
	count: number;
	post?: FiresidePost;
	comment?: Comment;
}

export class LikersModal {
	static async show(options: LikersModalOptions) {
		const { count, post, comment } = options;

		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "LikersModal" */ './modal')),
			props: {
				count,
				post,
				comment,
			},
			size: 'sm',
		});
	}
}
