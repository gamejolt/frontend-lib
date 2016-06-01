angular.module( 'gj.LinkedKey.Pool' ).factory( 'LinkedKey_Pool', function( Model )
{
	function LinkedKey_Pool( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	LinkedKey_Pool.PROVIDER_STEAM = 'steam';
	LinkedKey_Pool.PROVIDER_ITCH = 'itch';

	LinkedKey_Pool.prototype.getName = function()
	{
		return this.name || this.provider;
	}

	LinkedKey_Pool.prototype.$save = function()
	{
		var options = { };

		if ( this.id ) {
			return this.$_save( '/web/dash/developer/games/linked-key-pools/save/' + this.game_id + '/' + this.id, 'linkedKeyPool', options );
		}
		else {
			return this.$_save( '/web/dash/developer/games/linked-key-pools/save/' + this.game_id, 'linkedKeyPool', options );
		}
	};

	LinkedKey_Pool.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/linked-key-pools/remove/' + this.game_id + '/' + this.id );
	};

	return Model.create( LinkedKey_Pool );
} );
