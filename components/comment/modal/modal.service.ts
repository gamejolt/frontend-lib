import { asyncComponentLoader } from '../../../utils/utils';
import { Modal } from '../../modal/modal.service';

export type DisplayMode = 'comments' | 'shouts';

interface CommentModalOptions {
	resource?: string;
	resourceId?: number;
	displayMode?: DisplayMode;
}

const MODAL_ID = 'CommentModal';

export class CommentModal {
	static async show(options: CommentModalOptions) {
		const { resource, resourceId, displayMode } = options;

		let modalId = MODAL_ID;
		if (resource) {
			modalId += '-resource=' + resource;
		}
		if (resourceId) {
			modalId += '-resourceid=' + resourceId;
		}
		if (comment instanceof Comment) {
			modalId += '-comment=' + comment.id;
		}

		return await Modal.show<void>({
			modalId,
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "CommentModal" */ './modal')),
			props: {
				resource,
				resourceId,
				displayMode,
			},
			size: 'sm',
		});
	}
}
