angular.module( 'gj.Game.Release' ).factory( 'Game_Release', function( Api, Model )
{
	function Game_Release( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Game_Release.STATUS_HIDDEN = 'hidden';
	Game_Release.STATUS_PUBLISHED = 'published';
	Game_Release.STATUS_REMOVED = 'removed';

	Game_Release.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/releases/save/' + this.game_id + '/' + this.game_package_id, 'gameRelease' );
		}
		else {
			return this.$_save( '/web/dash/developer/games/releases/save/' + this.game_id + '/' + this.game_package_id + '/' + this.id, 'gameRelease' );
		}
	};

	Game_Release.prototype.$publish = function( game )
	{
		return this.$_save( '/web/dash/developer/games/releases/publish/' + this.game_id + '/' + this.game_package_id + '/' + this.id, 'gameRelease' )
			.then( function( response )
			{
				if ( game && response.game ) {
					game.assign( response.game );
				}

				return response;
			} );
	};

	Game_Release.prototype.$unpublish = function( game )
	{
		return this.$_save( '/web/dash/developer/games/releases/unpublish/' + this.game_id + '/' + this.game_package_id + '/' + this.id, 'gameRelease' )
			.then( function( response )
			{
				if ( game && response.game ) {
					game.assign( response.game );
				}

				return response;
			} );
	};

	Game_Release.prototype.$remove = function( game )
	{
		return this.$_remove( '/web/dash/developer/games/releases/remove/' + this.game_id + '/' + this.game_package_id + '/' + this.id )
			.then( function( response )
			{
				if ( game && response.game ) {
					game.assign( response.game );
				}

				return response;
			} );
	};

	return Model.create( Game_Release );
} );
