import { Injectable, Inject } from 'ng-metadata/core';
import template from 'html!./auth-modal.component.html';

@Injectable()
export class AuthModal
{
	constructor(
		@Inject( '$modal' ) private $modal: any
	)
	{
	}

	show(): ng.IPromise<undefined>
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
