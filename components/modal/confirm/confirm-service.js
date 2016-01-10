angular.module( 'gj.Modal.Confirm' ).service( 'ModalConfirm', function( $modal )
{
	this.show = function( _message, _title, _buttonType )
	{
		var modalInstance = $modal.open( {
			size: 'sm',
			templateUrl: '/lib/gj-lib-client/components/modal/confirm/confirm.html',
			controller: 'ModalConfirmCtrl',
			controllerAs: 'modalCtrl',
			resolve: {
				options: function()
				{
					return {
						message: _message,
						title: _title || 'Confirm...',
						buttonType: _buttonType || 'ok',
					};
				}
			}
		} );

		return modalInstance.result;
	};
} );
