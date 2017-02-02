angular.module( 'gj.Report.Modal' ).service( 'Report_Modal', function( $modal )
{
	this.show = function( resource )
	{
		var modalInstance = $modal.open( {
			template: require( '!html-loader!./modal.html' ),
			controller: 'Report_ModalCtrl',
			controllerAs: 'modalCtrl',
			size: 'sm',
			resolve: {
				resource: function()
				{
					return resource;
				}
			}
		} );

		return modalInstance.result;
	};
} );

