import { Injectable, Inject } from 'ng-metadata/core';
import template from 'html!./confirm.html';

@Injectable()
export class ModalConfirm
{
	constructor(
		@Inject( '$modal' ) private $modal: any
	)
	{
	}

	show( message: string, title = 'Confirm...', buttonType: 'ok' | 'yes' = 'ok' ): angular.IPromise<void>
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
