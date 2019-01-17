import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../../utils/utils';

export type LinkData = {
	href: string;
	title: string;
};

export class ContentEditorLinkModal {
	static async show() {
		return await Modal.show<LinkData>({
			modalId: 'ContentEditorLink',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ContentEditorLinkModal" */ './link-modal')
				),
			size: 'sm',
		});
	}
}
