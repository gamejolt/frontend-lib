import { Injectable, Inject } from 'ng-metadata/core';

@Injectable()
export class ModalCtrl
{
	constructor(
		@Inject( '$modalInstance' ) private $modalInstance: any,
		@Inject( 'options' ) private options: any
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
