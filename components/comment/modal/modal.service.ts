import { asyncComponentLoader } from '../../../utils/utils';
import { Modal } from '../../modal/modal.service';
import { Comment } from '../comment-model';

export type DisplayMode = 'comments' | 'shouts';

interface CommentModalOptions {
	resource?: string;
	resourceId?: number;
	comment?: Comment;
	displayMode?: DisplayMode;
}

export class CommentModal {
	static async show(options: CommentModalOptions) {
		const { resource, resourceId, comment, displayMode } = options;

		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "CommentModal" */ './modal')),
			props: {
				resource,
				resourceId,
				comment,
				displayMode,
			},
			size: 'sm',
		});
	}
}
