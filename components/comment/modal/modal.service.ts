import { VueRouter } from 'vue-router/types/router';
import { asyncComponentLoader } from '../../../utils/utils';
import { Growls } from '../../growls/growls.service';
import { Modal } from '../../modal/modal.service';
import { Translate } from '../../translate/translate.service';
import { Comment, fetchComment } from '../comment-model';

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
