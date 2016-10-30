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
			controllerAs: '$ctrl',
			template,
			controller: 'AuthModalCtrl',
		} );

		return modalInstance.result;
	}
}
