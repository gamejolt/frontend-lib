import { Modal } from '../modal/modal.service';
import { asyncComponentLoader } from '../../utils/utils';

export class ThemeEditorModal {
	static async show() {
		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ThemeEditorModal" */ './editor-modal')
				),
		});
	}
}
