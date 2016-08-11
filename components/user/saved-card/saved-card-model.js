angular.module( 'gj.User.SavedCard' ).factory( 'User_SavedCard', function( Model )
{
	function User_SavedCard( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	User_SavedCard.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/saved-cards/remove/' + this.id );
	};

	return Model.create( User_SavedCard );
} );
