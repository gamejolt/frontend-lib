angular.module( 'gj.KeyGroup' ).factory( 'KeyGroup', function( Model, Game_Package )
{
	function KeyGroup( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.packages ) {
				this.packages = Game_Package.populate( data.packages );
			}
		}
	}

	KeyGroup.TYPE_ORDER = 'order';
	KeyGroup.TYPE_ANONYMOUS = 'anonymous';
	KeyGroup.TYPE_ANONYMOUS_CLAIM = 'anonymous-claim';
	KeyGroup.TYPE_EMAIL = 'email';
	KeyGroup.TYPE_USER = 'user';

	KeyGroup.prototype.$save = function()
	{
		var options = {
			allowComplexData: [ 'packages' ],
		};

		if ( this.id ) {
			return this.$_save( '/web/dash/developer/games/key-groups/save/' + this.game_id + '/' + this.id, 'keyGroup', options );
		}
		else {
			return this.$_save( '/web/dash/developer/games/key-groups/save/' + this.game_id, 'keyGroup', options );
		}
	};

	KeyGroup.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/key-groups/remove/' + this.game_id + '/' + this.id );
	};

	return Model.create( KeyGroup );
} );
