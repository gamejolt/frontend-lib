import { Modal } from '../../modal/modal.service';
import { Model } from '../../model/model.service';
import { asyncComponentLoader } from '../../../utils/utils';

export class ReportModal {
	static async show(resource: Model) {
		await Modal.show({
			size: 'sm',
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "ReportModal" */ './modal')),
			props: { resource },
		});
	}
}
