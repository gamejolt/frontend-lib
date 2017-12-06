import { Modal } from '../../modal/modal.service';
import { asyncComponentLoader } from '../../../utils/utils';
import { Comment } from '../comment-model';

interface CommentModalOptions {
	resource?: string;
	resourceId?: number;
	comment?: Comment;
}

export class CommentModal {
	static async show(options: CommentModalOptions) {
		const { resource, resourceId, comment } = options;

		return await Modal.show<boolean>({
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
