import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { VueRouter } from 'vue-router/types/router';
import { asyncComponentLoader } from '../../../utils/utils';

interface CommentThreadModalOptions {
	resource: string;
	resourceId: number;
	commentId: number;
}

export class CommentThreadModal {
	static async show(options: CommentThreadModalOptions) {
		const { resource, resourceId, commentId } = options;

		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "CommentModal" */ './modal')),
			props: {
				resource,
				resourceId,
				commentId,
			},
			size: 'sm',
		});
	}

	/**
	 * Checks if the url has a comment permalink and opens the modal
	 */
	static async showFromPermalink(router: VueRouter, resource: string, resourceId: number) {
		const hash = router.currentRoute.hash;
		if (!hash || hash.indexOf('#comment-') !== 0) {
			return;
		}

		const id = parseInt(hash.substring('#comment-'.length), 10);
		if (!id) {
			return;
		}

		CommentThreadModal.show({ commentId: id, resource, resourceId });
	}
}
