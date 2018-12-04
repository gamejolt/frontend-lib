import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { VueRouter } from 'vue-router/types/router';
import { asyncComponentLoader } from '../../../utils/utils';
import { DisplayMode } from '../modal/modal.service';

interface CommentThreadModalOptions {
	resource: string;
	resourceId: number;
	commentId: number;
	displayMode: DisplayMode;
}

export class CommentThreadModal {
	static async show(options: CommentThreadModalOptions) {
		const { resource, resourceId, commentId, displayMode } = options;

		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "CommentModal" */ './modal')),
			props: {
				resource,
				resourceId,
				commentId,
				displayMode,
			},
			size: 'sm',
		});
	}

	/**
	 * Checks if the url has a comment permalink and opens the modal
	 */
	static async showFromPermalink(
		router: VueRouter,
		resource: string,
		resourceId: number,
		displayMode: DisplayMode
	) {
		const hash = router.currentRoute.hash;
		if (!hash || hash.indexOf('#comment-') !== 0) {
			return;
		}

		const id = parseInt(hash.substring('#comment-'.length), 10);
		if (!id) {
			return;
		}

		CommentThreadModal.show({ commentId: id, resource, resourceId, displayMode });
	}
}
