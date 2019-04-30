import { asyncComponentLoader } from '../../../../../utils/utils';
import { Modal } from '../../../../modal/modal.service';

export type LinkData = {
	href: string;
	title: string;
};

export class ContentEditorLinkModal {
	static async show(selectedText: string) {
		return await Modal.show<LinkData>({
			modalId: 'ContentEditorLink',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ContentEditorLinkModal" */ './link-modal.vue')
				),
			size: 'sm',
			props: { selectedText },
		});
	}
}
