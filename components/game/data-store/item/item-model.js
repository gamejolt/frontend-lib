angular.module( 'gj.Game.DataStore.Item' ).factory( 'Game_DataStore_Item', function( Model, User )
{
	function Game_DataStore_Item( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		if ( this.user ) {
			this.user = new User( this.user );
		}
	}

	Game_DataStore_Item.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/api/data-storage/remove-item/' + this.game_id + '/' + this.id );
	};

	return Model.create( Game_DataStore_Item );
} );
