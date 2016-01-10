angular.module( 'gj.Modal.Confirm' ).controller( 'ModalConfirmCtrl', function( $scope, $modalInstance, options )
{
	this.options = options;

	this.ok = function()
	{
		$modalInstance.close( true );
	};

	this.cancel = function()
	{
		$modalInstance.dismiss();
	};
} );
