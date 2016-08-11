angular.module( 'gj.Report.Modal' ).controller( 'Report_ModalCtrl', function( $modalInstance, Game, User, Comment, Forum_Topic, Forum_Post, Growls, gettextCatalog, resource )
{
	var _this = this;
	this.resource = resource;

	this.type = null;
	if ( this.resource instanceof Comment ) {
		this.type = 'Comment';
	}
	else if ( this.resource instanceof User ) {
		this.type = 'User';
	}
	else if ( this.resource instanceof Game ) {
		this.type = 'Game';
	}
	else if ( this.resource instanceof Forum_Topic ) {
		this.type = 'Forum_Topic';
	}
	else if ( this.resource instanceof Forum_Post ) {
		this.type = 'Forum_Post';
	}
	else {
		$modalInstance.dismiss();
		throw new Error( 'Invalid resource to report.' );
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
