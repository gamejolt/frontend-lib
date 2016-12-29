import { Injectable, Inject } from '@angular/core';

@Injectable()
export class ModalCtrl
{
	constructor(
		@Inject( '$modalInstance' ) private $modalInstance: any,
		@Inject( 'options' ) public options: any,
	)
	{
	}

	ok()
	{
		this.$modalInstance.close( true );
	}

	cancel()
	{
		this.$modalInstance.dismiss();
	}
}
