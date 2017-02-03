export class AuthModalCtrl
{
	/*@ngInject*/
	constructor(
		private $modalInstance: any,
	)
	{
	}

	close()
	{
		this.$modalInstance.dismiss();
	}
}
