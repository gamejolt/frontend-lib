import { Modal } from '../../modal/modal.service';
import { AppReportModal } from './modal';
import { Model } from '../../model/model.service';

export class ReportModal
{
	static async show( resource: Model )
	{
		try {
			await Modal.show( {
				size: 'sm',
				component: AppReportModal,
				props: { resource },
			} );
		}
		catch ( e ) {}
	}
}
