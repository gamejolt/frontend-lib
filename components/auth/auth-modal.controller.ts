import { Injectable, Inject } from '@angular/core';

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
