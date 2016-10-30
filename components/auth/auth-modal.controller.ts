import { Injectable, Inject } from 'ng-metadata/core';

@Injectable()
export class AuthModalCtrl
{
	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$modalInstance' ) private $modalInstance: any,
	)
	{
		// $scope.$on( '$stateChangeStart', () =>
		// {
		// 	this.$modalInstance.dismiss();
		// } );
	}

	close()
	{
		this.$modalInstance.dismiss();
	}
}
