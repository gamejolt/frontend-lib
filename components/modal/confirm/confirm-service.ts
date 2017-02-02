import { Injectable, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./confirm.html';

@Injectable( 'ModalConfirm' )
export class ModalConfirm
{
	constructor(
		@Inject( '$modal' ) private $modal: any
	)
	{
	}

	show( message: string, title = 'Confirm...', buttonType: 'ok' | 'yes' = 'ok' ): Promise<void>
	{
		const modalInstance = this.$modal.open( {
			template,
			size: 'sm',
			controller: 'ModalConfirmCtrl',
			controllerAs: '$ctrl',
			resolve: {
				options: () =>
				{
					return {
						message,
						title,
						buttonType,
					};
				}
			},
		} );

		return modalInstance.result;
	}
}
