import { Modal } from '../../modal/modal.service';
import { asyncComponentLoader } from '../../../utils/utils';
import { LinkedAccount, TumblrBlog } from '../linked-account.model';

export class ModalTumblrBlogSelector {
	static async show(
		message: string,
		account: LinkedAccount,
		title = 'Confirm...',
		buttonType: 'ok' | 'yes' = 'ok'
	) {
		return await Modal.show<TumblrBlog | false>({
			size: 'sm',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ModalTumblrBlogSelector" */ './tumblr-blog-selector-modal')
				),
			props: { message, account, title, buttonType },
		});
	}
}
