import { Injectable, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./auth-modal.component.html';

@Injectable( 'AuthModal' )
export class AuthModal
{
	constructor(
		@Inject( '$modal' ) private $modal: any
	)
	{
	}

	show(): Promise<undefined>
	{
		const modalInstance = this.$modal.open( {
			controller: 'AuthModalCtrl',
			controllerAs: '$ctrl',
			template,
			size: 'sm',
		} );

		return modalInstance.result;
	}
}
