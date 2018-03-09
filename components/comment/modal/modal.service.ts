import { Modal } from '../../modal/modal.service';
import { asyncComponentLoader } from '../../../utils/utils';
import { Comment, fetchComment } from '../comment-model';
import { VueRouter } from 'vue-router/types/router';
import { Growls } from '../../growls/growls.service';
import { Translate } from '../../translate/translate.service';

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

	static async checkPermalink(router: VueRouter) {
		const hash = router.currentRoute.hash;
		if (!hash || hash.indexOf('#comment-') !== 0) {
			return;
		}

		const id = parseInt(hash.substring('#comment-'.length), 10);
		if (!id) {
			return;
		}

		const comment = await fetchComment(id);
		if (!comment) {
			Growls.error(Translate.$gettext(`Couldn't find comment. It may have been removed.`));
			return;
		}

		CommentModal.show({ comment });
	}
}
