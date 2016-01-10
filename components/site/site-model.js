angular.module( 'gj.Site' ).factory( 'Site', function( Model )
{
	function Site( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Site.TYPE_DEVELOPER = 'developer';
	Site.TYPE_GAME = 'game';

	Site.STATUS_HIDDEN = 'hidden';
	Site.STATUS_ACTIVE = 'active';
	Site.STATUS_REMOVED = 'removed';

	Site.prototype.$save = function()
	{
		if ( this.hash ) {
			return this.$_save( '/sites/dash/sites/save/' + this.hash, 'site' );
		}
	};

	return Model.create( Site );
} );
