angular.module( 'gj.Report.Modal' ).controller( 'Report_ModalCtrl', function( $modalInstance, Game, User, Comment, Growls, gettextCatalog, resource )
{
	var _this = this;
	this.resource = resource;

	this.type = null;
	if ( this.resource instanceof Comment ) {
		this.type = 'comment';
	}
	else if ( this.resource instanceof User ) {
		this.type = 'user';
	}
	else if ( this.resource instanceof Game ) {
		this.type = 'game';
	}
	else {
		throw new Error( 'Invalid resource to report.' );
		$modalInstance.dismiss();
	}

	this.onSubmitted = function( response )
	{
		Growls.info( gettextCatalog.getString( 'Thanks for helping us make Game Jolt a place for everyone. We will take a look as soon as possible!' ), gettextCatalog.getString( 'Reported' ) );

		$modalInstance.close( response );
	};

	this.close = function()
	{
		$modalInstance.dismiss();
	};
} );
