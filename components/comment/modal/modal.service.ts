import { asyncComponentLoader } from '../../../utils/utils';
import { Modal } from '../../modal/modal.service';
import { Comment } from '../comment-model';

interface CommentModalOptions {
	resource?: string;
	resourceId?: number;
	comment?: Comment;
}

export class CommentModal {
	static async show(options: CommentModalOptions) {
		const { resource, resourceId, comment } = options;

		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "CommentModal" */ './modal')),
			props: {
				resource,
				resourceId,
				comment,
			},
			size: 'sm',
		});
	}
}
