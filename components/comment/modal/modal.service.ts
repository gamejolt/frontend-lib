import { asyncComponentLoader } from '../../../utils/utils';
import { Modal } from '../../modal/modal.service';

export type DisplayMode = 'comments' | 'shouts';

interface CommentModalOptions {
	resource?: string;
	resourceId?: number;
	displayMode?: DisplayMode;
	autofocus?: boolean;
}

export class CommentModal {
	static async show(options: CommentModalOptions) {
		const { resource, resourceId, displayMode, autofocus } = options;

		return await Modal.show<void>({
			modalId: 'Comment-' + [resource, resourceId].join('-'),
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "CommentModal" */ './modal.vue')),
			props: {
				resource,
				resourceId,
				displayMode,
				autofocus,
			},
			size: 'sm',
		});
	}
}
