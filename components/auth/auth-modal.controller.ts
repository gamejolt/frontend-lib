import { Injectable, Inject } from 'ng-metadata/core';

@Injectable()
export class AuthModalCtrl
{
	constructor(
		@Inject( '$modalInstance' ) private $modalInstance: any,
	)
	{
	}

	close()
	{
		this.$modalInstance.dismiss();
	}
}
