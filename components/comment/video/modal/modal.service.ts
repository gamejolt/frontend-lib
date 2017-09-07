import { CommentVideo } from '../video-model';
import { Modal } from '../../../modal/modal.service';
import { asyncComponentLoader } from '../../../../utils/utils';

export class CommentVideoModal {
	static async show(video: CommentVideo) {
		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "CommentVideoModal" */ './modal')),
			props: { video },
		});
	}
}
