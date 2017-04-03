import { Modal } from '../modal.service';
import { AppModalConfirm } from './confirm';

export class ModalConfirm
{
	static async show( message: string, title = 'Confirm...', buttonType: 'ok' | 'yes' = 'ok' )
	{
		try {
			await Modal.show( {
				size: 'sm',
				component: AppModalConfirm,
				props: { message, title, buttonType },
			} );

			return true;
		}
		catch ( _e ) {
			return false;
		}
	}
}

